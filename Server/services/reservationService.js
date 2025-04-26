const TableInfo = require("../models/TableInfo");
const Reservation = require("../models/Reservation");

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

    // Find reservations for the given date and time that aren't cancelled
    const reservations = await Reservation.find({
      restaurant: restaurantId,
      reservationDate: new Date(date),
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
      data: reservations 
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

const getAllReservations = async (userId) => {
  try {
    const reservations = await Reservation.find({ user: userId })
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
      createdAt: { $gte: oneDayAgo }
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(limit)
    .populate("user", "name email phone")
    .populate("restaurant", "name address")
    .populate("table", "tableNumber capacity");

    return { 
      status: "Success", 
      message: "Recent reservations retrieved successfully",
      data: reservations 
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
        $lt: tomorrow
      },
      status: { $ne: "cancelled" }
    })
    .populate("user", "name email phone")
    .populate("restaurant", "name address")
    .populate("table", "tableNumber capacity")
    .sort({ reservationTime: 1 }); // Sort by time ascending
    
    return {
      status: "Success",
      message: "Today's reservations retrieved successfully",
      data: reservations
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
      status: "pending"
    })
    .populate("user", "name email phone")
    .populate("restaurant", "name address")
    .populate("table", "tableNumber capacity")
    .sort({ reservationDate: 1, reservationTime: 1 }); // Sort by date and time
    
    return {
      status: "Success",
      message: "Pending reservations retrieved successfully",
      data: pendingReservations
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

module.exports = {
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
};
