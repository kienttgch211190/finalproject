const TableInfo = require("../models/TableInfo");
const Restaurant = require("../models/Restaurant");
const Reservation = require("../models/Reservation");

// Create a new table
const createTable = async (tableData) => {
  try {
    const { restaurant, tableNumber, capacity, isAvailable } = tableData;

    // Validate required fields
    if (!restaurant || !tableNumber || !capacity) {
      return { status: "Error", message: "Required fields are missing" };
    }

    // Check if restaurant exists
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return { status: "Error", message: "Restaurant not found" };
    }

    // Check if table number already exists in this restaurant
    const tableExists = await TableInfo.findOne({
      restaurant,
      tableNumber,
    });

    if (tableExists) {
      return {
        status: "Error",
        message: "Table number already exists in this restaurant",
      };
    }

    // Validate capacity
    if (capacity <= 0) {
      return { status: "Error", message: "Capacity must be greater than zero" };
    }

    const newTable = new TableInfo({
      restaurant,
      tableNumber,
      capacity,
      isAvailable: true,
    });

    await newTable.save();

    return {
      status: "Success",
      message: "Table created successfully",
      data: newTable,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get all tables for a restaurant
const getRestaurantTables = async (restaurantId) => {
  try {
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return { status: "Error", message: "Restaurant not found" };
    }

    const tables = await TableInfo.find({ restaurant: restaurantId }).sort({
      tableNumber: 1,
    });

    return { status: "Success", data: tables };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get a table by ID
const getTableById = async (tableId) => {
  try {
    const table = await TableInfo.findById(tableId).populate(
      "restaurant",
      "name address"
    );

    if (!table) {
      return { status: "Error", message: "Table not found" };
    }

    return { status: "Success", data: table };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Check table availability for a specific date and time
const checkTableAvailability = async (tableId, date, time) => {
  try {
    // Check if table exists
    const table = await TableInfo.findById(tableId);
    if (!table) {
      return { status: "Error", message: "Table not found" };
    }

    // Check if the table is generally available
    if (!table.isAvailable) {
      return {
        status: "Success",
        data: {
          isAvailable: false,
          table,
          message: "Table is not available for reservations",
        },
      };
    }

    // Check if there's already a reservation for this table at this time
    const reservation = await Reservation.findOne({
      table: tableId,
      reservationDate: date,
      reservationTime: time,
      status: { $in: ["pending", "confirmed"] },
    });

    return {
      status: "Success",
      data: {
        isAvailable: !reservation,
        table,
        message: reservation
          ? "Table is already reserved"
          : "Table is available",
      },
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Update a table
const updateTable = async (tableId, tableData) => {
  try {
    const { tableNumber, capacity, isAvailable } = tableData;

    const table = await TableInfo.findById(tableId);

    if (!table) {
      return { status: "Error", message: "Table not found" };
    }

    // If changing table number, check if the new number already exists
    if (tableNumber && tableNumber !== table.tableNumber) {
      const tableExists = await TableInfo.findOne({
        restaurant: table.restaurant,
        tableNumber,
        _id: { $ne: tableId }, // Exclude current table
      });

      if (tableExists) {
        return {
          status: "Error",
          message: "Table number already exists in this restaurant",
        };
      }
    }

    // Validate capacity if provided
    if (capacity && capacity <= 0) {
      return { status: "Error", message: "Capacity must be greater than zero" };
    }

    const updatedTable = await TableInfo.findByIdAndUpdate(
      tableId,
      {
        tableNumber: tableNumber || table.tableNumber,
        capacity: capacity || table.capacity,
        isAvailable:
          isAvailable !== undefined ? isAvailable : table.isAvailable,
      },
      { new: true }
    );

    return {
      status: "Success",
      message: "Table updated successfully",
      data: updatedTable,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Delete a table
const deleteTable = async (tableId) => {
  try {
    const table = await TableInfo.findById(tableId);

    if (!table) {
      return { status: "Error", message: "Table not found" };
    }

    // Check if there are future reservations for this table
    const futureReservations = await Reservation.findOne({
      table: tableId,
      reservationDate: { $gte: new Date() },
      status: { $in: ["pending", "confirmed"] },
    });

    if (futureReservations) {
      return {
        status: "Error",
        message: "Cannot delete table with future reservations",
      };
    }

    await TableInfo.findByIdAndDelete(tableId);

    return { status: "Success", message: "Table deleted successfully" };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Find available tables for a specific date, time and party size
const findAvailableTables = async (restaurantId, date, time, partySize) => {
  try {
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return { status: "Error", message: "Restaurant not found" };
    }

    // Get all tables for this restaurant with enough capacity
    const allTables = await TableInfo.find({
      restaurant: restaurantId,
      capacity: { $gte: partySize },
      isAvailable: true,
    }).sort({ capacity: 1 }); // Sort by capacity to get the best fit

    // If no tables with enough capacity, return empty
    if (allTables.length === 0) {
      return {
        status: "Success",
        message: "No tables found with sufficient capacity",
        data: [],
      };
    }

    // Get tables that are already reserved for this date and time
    const reservedTables = await Reservation.find({
      restaurant: restaurantId,
      reservationDate: date,
      reservationTime: time,
      status: { $in: ["pending", "confirmed"] },
    }).select("table");

    const reservedTableIds = reservedTables.map((res) => res.table.toString());

    // Filter out the tables that are already reserved
    const availableTables = allTables.filter(
      (table) => !reservedTableIds.includes(table._id.toString())
    );

    return {
      status: "Success",
      data: availableTables,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

module.exports = {
  createTable,
  getRestaurantTables,
  getTableById,
  checkTableAvailability,
  updateTable,
  deleteTable,
  findAvailableTables,
};
