const express = require("express");
const router = express.Router();
const {
  createPromotion,
  getRestaurantPromotions,
  getActivePromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
} = require("../controllers/promotionController");
const { authMiddleware, isStaff } = require("../middlewares/middleware");

/**
 * @route POST /api/promotion
 * @desc Create a new promotion
 * @access Private (Staff only)
 */
router.post("/", authMiddleware("access"), isStaff, createPromotion);

/**
 * @route GET /api/promotion/restaurant/:restaurantId
 * @desc Get all promotions for a specific restaurant
 * @access Public
 */
router.get("/restaurant/:restaurantId", getRestaurantPromotions);

/**
 * @route GET /api/promotion/active
 * @desc Get all active promotions across restaurants
 * @access Public
 */
router.get("/active", getActivePromotions);

/**
 * @route GET /api/promotion/:promotionId
 * @desc Get a specific promotion by ID
 * @access Public
 */
router.get("/:promotionId", getPromotionById);

/**
 * @route PUT /api/promotion/:promotionId
 * @desc Update a promotion
 * @access Private (Staff only)
 */
router.put("/:promotionId", authMiddleware("access"), isStaff, updatePromotion);

/**
 * @route DELETE /api/promotion/:promotionId
 * @desc Delete a promotion
 * @access Private (Staff only)
 */
router.delete(
  "/:promotionId",
  authMiddleware("access"),
  isStaff,
  deletePromotion
);

module.exports = router;
