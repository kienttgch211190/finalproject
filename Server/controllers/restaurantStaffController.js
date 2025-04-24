const restaurantStaffService = require("../services/restaurantStaffService");

// Assign a staff member to a restaurant
const assignStaff = async (req, res) => {
  try {
    const result = await restaurantStaffService.assignStaff(req.body);

    if (result.status === "Success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get all staff for a restaurant
const getRestaurantStaff = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const result = await restaurantStaffService.getRestaurantStaff(
      restaurantId
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

// Get all restaurants a staff member is assigned to
const getStaffAssignments = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is requesting their own assignments or is an admin
    if (req.user.payload.id !== userId && req.user.payload.role !== "admin") {
      return res.status(403).json({
        status: "Error",
        message: "You can only view your own assignments",
      });
    }

    const result = await restaurantStaffService.getStaffAssignments(userId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "User not found" ? 404 : 400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Update staff assignment
const updateStaffAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await restaurantStaffService.updateStaffAssignment(
      assignmentId,
      req.body
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Staff assignment not found" ? 404 : 400)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Remove staff from restaurant
const removeStaff = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await restaurantStaffService.removeStaff(assignmentId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Staff assignment not found" ? 404 : 500)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

module.exports = {
  assignStaff,
  getRestaurantStaff,
  getStaffAssignments,
  updateStaffAssignment,
  removeStaff,
};
