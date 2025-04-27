const express = require("express");
const router = express.Router();
const {
  createPromotion,
  getRestaurantPromotions,
  getActivePromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getRestaurantActivePromotions,
} = require("../controllers/promotionController");
const { authMiddleware, isStaff , isAdmin} = require("../middlewares/middleware");

/**
 * @route POST /api/promotion
 * @desc Create a new promotion
 * @access Private (Staff only)
 */
router.post("/", authMiddleware("access"), isAdmin, createPromotion);

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
router.put("/:promotionId", authMiddleware("access"), isAdmin, updatePromotion);


router.get("/restaurant/:restaurantId/active", getRestaurantActivePromotions);

/**
 * @route DELETE /api/promotion/:promotionId
 * @desc Delete a promotion
 * @access Private (Staff only)
 */


router.delete(
  "/:promotionId",
  authMiddleware("access"),
  isAdmin,
  deletePromotion
);

module.exports = router;
