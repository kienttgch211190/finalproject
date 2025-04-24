const customerPreferenceService = require("../services/customerPreferenceService");

// Create customer preferences
const createPreference = async (req, res) => {
  try {
    // If no user ID is provided in the body, use the authenticated user's ID
    if (!req.body.user) {
      req.body.user = req.user.payload.id;
    }

    // Check if the user is trying to create preferences for another user
    if (
      req.body.user !== req.user.payload.id &&
      req.user.payload.role !== "admin"
    ) {
      return res.status(403).json({
        status: "Error",
        message: "You can only create preferences for your own account",
      });
    }

    const result = await customerPreferenceService.createPreference(req.body);

    if (result.status === "Success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get preferences for a user
const getPreferenceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is trying to access another user's preferences
    if (
      userId !== req.user.payload.id &&
      req.user.payload.role !== "admin" &&
      req.user.payload.role !== "staff"
    ) {
      return res.status(403).json({
        status: "Error",
        message: "You can only view your own preferences",
      });
    }

    const result = await customerPreferenceService.getPreferenceByUserId(
      userId
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "User not found" ? 404 : 400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Update customer preferences
const updatePreference = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is trying to update another user's preferences
    if (userId !== req.user.payload.id && req.user.payload.role !== "admin") {
      return res.status(403).json({
        status: "Error",
        message: "You can only update your own preferences",
      });
    }

    const result = await customerPreferenceService.updatePreference(
      userId,
      req.body
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "User not found" ? 404 : 400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Delete customer preferences
const deletePreference = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is trying to delete another user's preferences
    if (userId !== req.user.payload.id && req.user.payload.role !== "admin") {
      return res.status(403).json({
        status: "Error",
        message: "You can only delete your own preferences",
      });
    }

    const result = await customerPreferenceService.deletePreference(userId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(
          result.message === "User not found" ||
            result.message === "No preferences found for this user"
            ? 404
            : 400
        )
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

module.exports = {
  createPreference,
  getPreferenceByUserId,
  updatePreference,
  deletePreference,
};
