const express = require("express");
const router = express.Router();
const {
  createTable,
  getRestaurantTables,
  getTableById,
  checkTableAvailability,
  updateTable,
  deleteTable,
  findAvailableTables,
} = require("../controllers/tableInfoController");
const { authMiddleware, isStaff } = require("../middlewares/middleware");

/**
 * @route POST /api/table
 * @desc Create a new table
 * @access Private (Staff only)
 */
router.post("/", authMiddleware("access"), isStaff, createTable);

/**
 * @route GET /api/table/:tableId
 * @desc Get a specific table by ID
 * @access Public
 */
router.get("/:tableId", getTableById);

/**
 * @route GET /api/table/restaurant/:restaurantId
 * @desc Get all tables for a restaurant
 * @access Public
 */
router.get("/restaurant/:restaurantId", getRestaurantTables);

/**
 * @route GET /api/table/:tableId/availability
 * @desc Check availability for specific date and time
 * @access Public
 */
router.get("/:tableId/availability", checkTableAvailability);

/**
 * @route GET /api/table/available/:restaurantId
 * @desc Find available tables with filters
 * @access Public
 */
router.get("/available/:restaurantId", findAvailableTables);

/**
 * @route PUT /api/table/:tableId
 * @desc Update a table
 * @access Private (Staff only)
 */
router.put("/:tableId", authMiddleware("access"), isStaff, updateTable);

/**
 * @route DELETE /api/table/:tableId
 * @desc Delete a table
 * @access Private (Staff only)
 */
router.delete("/:tableId", authMiddleware("access"), isStaff, deleteTable);

module.exports = router;
