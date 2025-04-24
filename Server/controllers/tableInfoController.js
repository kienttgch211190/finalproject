const tableService = require("../services/tableInfoService");

// Create a new table
const createTable = async (req, res) => {
  try {
    const result = await tableService.createTable(req.body);

    if (result.status === "Success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get all tables for a restaurant
const getRestaurantTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const result = await tableService.getRestaurantTables(restaurantId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Restaurant not found" ? 404 : 500)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get a table by ID
const getTableById = async (req, res) => {
  try {
    const { tableId } = req.params;

    const result = await tableService.getTableById(tableId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "Table not found" ? 404 : 500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Check table availability for a specific date and time
const checkTableAvailability = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        status: "Error",
        message: "Date and time are required query parameters",
      });
    }

    const result = await tableService.checkTableAvailability(
      tableId,
      date,
      time
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "Table not found" ? 404 : 500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Update a table
const updateTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    const result = await tableService.updateTable(tableId, req.body);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      if (result.message === "Table not found") {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Delete a table
const deleteTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    const result = await tableService.deleteTable(tableId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      if (result.message === "Table not found") {
        res.status(404).json(result);
      } else if (
        result.message === "Cannot delete table with future reservations"
      ) {
        res.status(400).json(result);
      } else {
        res.status(500).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Find available tables for a specific date, time and party size
const findAvailableTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date, time, partySize } = req.query;

    if (!date || !time || !partySize) {
      return res.status(400).json({
        status: "Error",
        message: "Date, time, and partySize are required query parameters",
      });
    }

    const result = await tableService.findAvailableTables(
      restaurantId,
      date,
      time,
      parseInt(partySize)
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Restaurant not found" ? 404 : 500)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
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
