const TableInfo = require("../models/TableInfo");
const Reservation = require("../models/Reservation");

// Sửa hàm getAvailableTables
const getAvailableTables = async (
  restaurantId,
  date,
  reservationTime,
  numGuests
) => {
  try {
    console.log(
      `Finding tables for: Restaurant=${restaurantId}, Date=${date}, Time=${reservationTime}, Guests=${numGuests}`
    );

    // Validate restaurant ID
    if (!restaurantId) {
      return { status: "Error", message: "Restaurant ID is required" };
    }

    // Find all tables for the specified restaurant with sufficient capacity
    const allTables = await TableInfo.find({
      restaurant: restaurantId,
      capacity: { $gte: numGuests },
      isAvailable: true,
    });

    console.log(`Found ${allTables.length} tables with sufficient capacity`);

    if (allTables.length === 0) {
      return {
        status: "Success",
        message:
          "No tables available with sufficient capacity for your party size",
        data: [],
      };
    }

    // Chuyển đổi chuỗi date thành đối tượng Date chính xác
    // Đây là vấn đề chính - khi chuỗi YYYY-MM-DD được chuyển thành Date có thể gây lệch múi giờ
    const reservationDate = new Date(date);
    // Đặt giờ, phút, giây, mili giây về 0 để tránh vấn đề về múi giờ
    reservationDate.setHours(0, 0, 0, 0);

    // Find reservations for the given date and time that aren't cancelled
    const reservations = await Reservation.find({
      restaurant: restaurantId,
      reservationDate: reservationDate, // Sử dụng đối tượng Date đã xử lý
      reservationTime: reservationTime,
      status: { $nin: ["cancelled"] },
    });

    console.log(
      `Found ${reservations.length} existing reservations for this time`
    );

    // Get IDs of tables that are already reserved
    const reservedTableIds = reservations.map((reservation) =>
      reservation.table.toString()
    );

    console.log("Reserved table IDs:", reservedTableIds);

    // Filter out tables that are already reserved
    const availableTables = allTables.filter(
      (table) => !reservedTableIds.includes(table._id.toString())
    );

    console.log(
      `Found ${availableTables.length} available tables after filtering`
    );

    return {
      status: "Success",
      message:
        availableTables.length > 0
          ? `Found ${availableTables.length} available tables`
          : "No tables available for the selected time",
      data: availableTables,
    };
  } catch (error) {
    console.error("Error in getAvailableTables service:", error);
    return { status: "Error", message: error.message };
  }
};
// Add this function to reservationService.js
const getAllReservationsAdmin = async (query = {}) => {
  try {
    // Build filters based on query parameters (for future enhancement)
    const filters = {};

    if (query.status) {
      filters.status = query.status;
    }

    // You can add more filters here as needed

    // Get all reservations with populated references
    const reservations = await Reservation.find(filters)
      .populate("user", "name email phone")
      .populate("restaurant", "name address")
      .populate("table");

    return {
      status: "Success",
      message: "Reservations retrieved successfully",
      data: reservations,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

const createReservation = async (reservationData) => {
  try {
    const {
      user,
      restaurant,
      table,
      reservationDate,
      reservationTime,
      numGuests,
      specialRequest,
    } = reservationData;

    // Check if table is already reserved
    const exists = await Reservation.findOne({
      table,
      reservationDate,
      reservationTime,
    });

    if (exists) {
      return { status: "Error", message: "Table is already reserved" };
    }

    // Create a new reservation
    const newReservation = new Reservation({
      user,
      restaurant,
      table,
      reservationDate,
      reservationTime,
      numGuests,
      specialRequest,
    });

    // Save the reservation to database
    await newReservation.save();

    return {
      status: "Success",
      message: "Reservation created successfully",
      data: newReservation,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

const updateReservation = async (id, reservationData) => {
  try {
    // First check if the reservation exists
    const existingReservation = await Reservation.findById(id);
    if (!existingReservation) {
      return { status: "Error", message: "Reservation not found" };
    }

    const {
      table,
      reservationDate,
      reservationTime,
      numGuests,
      specialRequest,
    } = reservationData;

    // Check if the requested table, date and time is already reserved by another reservation
    const conflictingReservation = await Reservation.findOne({
      table,
      reservationDate,
      reservationTime,
      _id: { $ne: id }, // Exclude the current reservation
      status: { $nin: ["cancelled"] }, // Exclude cancelled reservations
    });

    if (conflictingReservation) {
      return {
        status: "Error",
        message: "Table is already reserved for this time",
      };
    }

    // Update the reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      {
        // Keep the original user and restaurant
        user: existingReservation.user,
        restaurant: existingReservation.restaurant,
        // Update the modifiable fields
        table,
        reservationDate,
        reservationTime,
        numGuests,
        specialRequest,
      },
      { new: true }
    );

    return {
      status: "Success",
      message: "Reservation updated successfully",
      data: updatedReservation,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

const cancelReservation = async (id) => {
  try {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return { status: "Error", message: "Reservation not found" };
    }

    reservation.status = "cancelled";
    await reservation.save();

    return { status: "Success", message: "Reservation cancelled successfully" };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

const getAllReservations = async (restaurantId) => {
  try {
    const reservations = await Reservation.find({ restaurant: restaurantId })
      .populate("user")
      .populate("restaurant")
      .populate("table");

    return { status: "Success", data: reservations };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

const updateReservationStatus = async (id, status) => {
  try {
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!validStatuses.includes(status)) {
      return { status: "Error", message: "Invalid status" };
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedReservation) {
      return { status: "Error", message: "Reservation not found" };
    }

    return {
      status: "Success",
      message: "Reservation status updated successfully",
      data: updatedReservation,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

const getReservationById = async (id) => {
  try {
    const reservation = await Reservation.findById(id)
      .populate("user", "name email phone")
      .populate("restaurant", "name address")
      .populate("table");

    if (!reservation) {
      return { status: "Error", message: "Reservation not found" };
    }

    return { status: "Success", data: reservation };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get recent reservations (within the last day)
const getRecentReservations = async (limit = 5) => {
  try {
    // Calculate date one day ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Get recent reservations from the last day
    const reservations = await Reservation.find({
      createdAt: { $gte: oneDayAgo },
    })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit)
      .populate("user", "name email phone")
      .populate("restaurant", "name address")
      .populate("table", "tableNumber capacity");

    return {
      status: "Success",
      message: "Recent reservations retrieved successfully",
      data: reservations,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get reservations for a restaurant for today
const getRestaurantTodayReservations = async (restaurantId) => {
  try {
    if (!restaurantId) {
      return { status: "Error", message: "Restaurant ID is required" };
    }

    // Get start and end of today in local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all reservations for the restaurant today
    const reservations = await Reservation.find({
      restaurant: restaurantId,
      reservationDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $ne: "cancelled" },
    })
      .populate("user", "name email phone")
      .populate("restaurant", "name address")
      .populate("table", "tableNumber capacity")
      .sort({ reservationTime: 1 }); // Sort by time ascending

    return {
      status: "Success",
      message: "Today's reservations retrieved successfully",
      data: reservations,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get pending reservations for a restaurant
const getRestaurantPendingReservations = async (restaurantId) => {
  try {
    if (!restaurantId) {
      return { status: "Error", message: "Restaurant ID is required" };
    }

    // Find all pending reservations for the restaurant
    const pendingReservations = await Reservation.find({
      restaurant: restaurantId,
      status: "pending",
    })
      .populate("user", "name email phone")
      .populate("restaurant", "name address")
      .populate("table", "tableNumber capacity")
      .sort({ reservationDate: 1, reservationTime: 1 }); // Sort by date and time

    return {
      status: "Success",
      message: "Pending reservations retrieved successfully",
      data: pendingReservations,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Thêm hàm này vào cuối file trước module.exports
const getRestaurantCompletedReservations = async (restaurantId, query = {}) => {
  try {
    if (!restaurantId) {
      return { status: "Error", message: "Restaurant ID is required" };
    }

    // Xây dựng query filter
    const filter = {
      restaurant: restaurantId,
      status: "completed",
    };

    // Thêm filter theo ngày nếu có
    if (query.startDate && query.endDate) {
      filter.reservationDate = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    } else if (query.startDate) {
      filter.reservationDate = { $gte: new Date(query.startDate) };
    } else if (query.endDate) {
      filter.reservationDate = { $lte: new Date(query.endDate) };
    }

    // Tìm tất cả đơn đặt bàn đã hoàn thành của nhà hàng
    const completedReservations = await Reservation.find(filter)
      .populate("user", "name email phone")
      .populate("restaurant", "name address")
      .populate("table", "tableNumber capacity name")
      .sort({ reservationDate: -1, reservationTime: 1 }); // Sắp xếp theo ngày gần nhất và giờ tăng dần

    return {
      status: "Success",
      message: "Completed reservations retrieved successfully",
      data: completedReservations,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

const getRestaurantConfirmedReservations = async (restaurantId, query = {}) => {
  try {
    if (!restaurantId) {
      return { status: "Error", message: "Restaurant ID is required" };
    }

    // Xây dựng query filter
    const filter = {
      restaurant: restaurantId,
      status: "confirmed",
    };

    // Thêm filter theo ngày nếu có
    if (query.date) {
      const selectedDate = new Date(query.date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);

      filter.reservationDate = {
        $gte: selectedDate,
        $lt: nextDay,
      };
    } else if (query.startDate && query.endDate) {
      filter.reservationDate = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    // Tìm tất cả đơn đặt bàn đã xác nhận của nhà hàng
    const confirmedReservations = await Reservation.find(filter)
      .populate("user", "name email phone")
      .populate("restaurant", "name address")
      .populate("table", "tableNumber capacity name")
      .sort({ reservationDate: 1, reservationTime: 1 }); // Sắp xếp theo ngày và giờ

    return {
      status: "Success",
      message: "Confirmed reservations retrieved successfully",
      data: confirmedReservations,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Thêm hàm lấy danh sách đặt bàn đã hủy (cancelled)
const getRestaurantCancelledReservations = async (restaurantId, query = {}) => {
  try {
    if (!restaurantId) {
      return { status: "Error", message: "Restaurant ID is required" };
    }

    // Xây dựng query filter
    const filter = {
      restaurant: restaurantId,
      status: "cancelled",
    };

    // Thêm filter theo ngày nếu có
    if (query.date) {
      const selectedDate = new Date(query.date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);

      filter.reservationDate = {
        $gte: selectedDate,
        $lt: nextDay,
      };
    } else if (query.startDate && query.endDate) {
      filter.reservationDate = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    // Tìm tất cả đơn đặt bàn đã hủy của nhà hàng
    const cancelledReservations = await Reservation.find(filter)
      .populate("user", "name email phone")
      .populate("restaurant", "name address")
      .populate("table", "tableNumber capacity name")
      .sort({ updatedAt: -1 }); // Sắp xếp theo thời gian hủy gần đây nhất

    return {
      status: "Success",
      message: "Cancelled reservations retrieved successfully",
      data: cancelledReservations,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

const getUserReservations = async (userId) => {
  try {
    if (!userId) {
      return { status: "Error", message: "User ID is required" };
    }

    // Find all reservations for the specified user
    const reservations = await Reservation.find({ user: userId })
      .populate("restaurant", "name address phone cuisineType")
      .populate("table", "name tableNumber capacity")
      .sort({ reservationDate: -1, reservationTime: -1 }); // Sort by date and time (newest first)

    return {
      status: "Success",
      message: "User reservations retrieved successfully",
      data: reservations,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Thêm function vào module.exports
module.exports = {
  getUserReservations,
  getAvailableTables,
  createReservation,
  updateReservation,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
  getReservationById,
  getAllReservationsAdmin,
  getRecentReservations,
  getRestaurantTodayReservations,
  getRestaurantPendingReservations,
  getRestaurantCompletedReservations,
  getRestaurantConfirmedReservations,
  getRestaurantCancelledReservations,
};
