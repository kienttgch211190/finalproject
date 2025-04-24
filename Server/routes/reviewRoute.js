const express = require("express");
const router = express.Router();
const {
  createReview,
  getRestaurantReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  moderateReview,
  getReviewStats,
} = require("../controllers/reviewController");
const { authMiddleware, isStaff } = require("../middlewares/middleware");

/**
 * @route POST /api/review
 * @desc Create a new review
 * @access Private (authenticated users only)
 */
router.post("/", authMiddleware("access"), createReview);

/**
 * @route GET /api/review/restaurant/:restaurantId
 * @desc Get all reviews for a specific restaurant
 * @access Public
 */
router.get("/restaurant/:restaurantId", getRestaurantReviews);

/**
 * @route GET /api/review/user/:userId
 * @desc Get all reviews by a specific user
 * @access Private (own user or admin only)
 */
router.get("/user/:userId", authMiddleware("access"), getUserReviews);

/**
 * @route PUT /api/review/:reviewId
 * @desc Update a review
 * @access Private (own user only)
 */
router.put("/:reviewId", authMiddleware("access"), updateReview);

/**
 * @route DELETE /api/review/:reviewId
 * @desc Delete a review
 * @access Private (own user or admin only)
 */
router.delete("/:reviewId", authMiddleware("access"), deleteReview);

/**
 * @route PUT /api/review/:reviewId/moderate
 * @desc Approve or reject a review
 * @access Private (staff/admin only)
 */
router.put(
  "/:reviewId/moderate",
  authMiddleware("access"),
  isStaff,
  moderateReview
);

/**
 * @route GET /api/review/stats/restaurant/:restaurantId
 * @desc Get review statistics for a restaurant
 * @access Public
 */
router.get("/stats/restaurant/:restaurantId", getReviewStats);

module.exports = router;
