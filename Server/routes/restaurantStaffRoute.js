const express = require("express");
const router = express.Router();
const {
  assignStaff,
  getRestaurantStaff,
  getStaffAssignments,
  updateStaffAssignment,
  removeStaff,
} = require("../controllers/restaurantStaffController");
const {
  authMiddleware,
  isStaff,
  isAdmin,
  isStaffOrAdmin,
} = require("../middlewares/middleware");

/**
 * @route POST /api/staff/assign
 * @desc Assign a staff member to a restaurant
 * @access Private (Admin only)
 */
router.post("/assign", authMiddleware("access"), isAdmin, assignStaff);

/**
 * @route GET /api/staff/restaurant/:restaurantId
 * @desc Get all staff for a restaurant
 * @access Private (Staff only)
 */
router.get(
  "/restaurant/:userId",
  authMiddleware("access"),
  isStaffOrAdmin,
  getRestaurantStaff
);

/**
 * @route GET /api/staff/assignments/:userId
 * @desc Get all restaurants a staff member is assigned to
 * @access Private (Own user or admin)
 */
router.get(
  "/assignments/:userId",
  authMiddleware("access"),
  getStaffAssignments
);

/**
 * @route PUT /api/staff/assignment/:assignmentId
 * @desc Update a staff assignment
 * @access Private (Admin only)
 */
router.put(
  "/assignment/:assignmentId",
  authMiddleware("access"),
  isStaff,
  updateStaffAssignment
);

/**
 * @route DELETE /api/staff/assignment/:assignmentId
 * @desc Remove a staff member from a restaurant
 * @access Private (Admin only)
 */
router.delete(
  "/assignment/:assignmentId",
  authMiddleware("access"),
  isAdmin,
  removeStaff
);

module.exports = router;
