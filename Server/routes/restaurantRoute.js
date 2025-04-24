const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");
const { authMiddleware, isStaff } = require("../middlewares/middleware");

/**
 * @route GET /api/restaurant
 * @desc Get all restaurants with optional filtering
 * @access Public
 */
router.get("/", getAllRestaurants);

/**
 * @route GET /api/restaurant/:id
 * @desc Get a specific restaurant by ID
 * @access Public
 */
router.get("/:id", getRestaurantById);

/**
 * @route POST /api/restaurant
 * @desc Create a new restaurant
 * @access Private (Staff only)
 */
router.post("/", authMiddleware("access"), isStaff, createRestaurant);

/**
 * @route PUT /api/restaurant/:id
 * @desc Update a restaurant
 * @access Private (Staff only)
 */
router.put("/:id", authMiddleware("access"), isStaff, updateRestaurant);

/**
 * @route DELETE /api/restaurant/:id
 * @desc Delete a restaurant
 * @access Private (Staff only)
 */
router.delete("/:id", authMiddleware("access"), isStaff, deleteRestaurant);

module.exports = router;
