const express = require("express");
const router = express.Router();
const {
  createPreference,
  getPreferenceByUserId,
  updatePreference,
  deletePreference,
} = require("../controllers/customerPreferenceController");
const { authMiddleware } = require("../middlewares/middleware");

/**
 * @route POST /api/preference
 * @desc Create customer preferences
 * @access Private
 */
router.post("/", authMiddleware("access"), createPreference);

/**
 * @route GET /api/preference/:userId
 * @desc Get preferences for a specific user
 * @access Private (Own user or admin/staff)
 */
router.get("/:userId", authMiddleware("access"), getPreferenceByUserId);

/**
 * @route PUT /api/preference/:userId
 * @desc Update customer preferences
 * @access Private (Own user or admin)
 */
router.put("/:userId", authMiddleware("access"), updatePreference);

/**
 * @route DELETE /api/preference/:userId
 * @desc Delete customer preferences
 * @access Private (Own user or admin)
 */
router.delete("/:userId", authMiddleware("access"), deletePreference);

module.exports = router;
