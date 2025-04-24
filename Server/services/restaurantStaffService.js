const RestaurantStaff = require("../models/RestaurantStaff");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

// Assign a staff member to a restaurant
const assignStaff = async (assignmentData) => {
  try {
    const { user, restaurant, position } = assignmentData;

    // Validate required fields
    if (!user || !restaurant) {
      return { status: "Error", message: "User and restaurant are required" };
    }

    // Check if user exists and is a staff member
    const userExists = await User.findById(user);
    if (!userExists) {
      return { status: "Error", message: "User not found" };
    }

    if (userExists.role !== "staff" && userExists.role !== "admin") {
      return {
        status: "Error",
        message: "User must be a staff member or admin",
      };
    }

    // Check if restaurant exists
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return { status: "Error", message: "Restaurant not found" };
    }

    // Check if staff is already assigned to this restaurant
    const existingAssignment = await RestaurantStaff.findOne({
      user,
      restaurant,
    });

    if (existingAssignment) {
      if (existingAssignment.isActive) {
        return {
          status: "Error",
          message: "Staff already assigned to this restaurant",
        };
      } else {
        // If previously deactivated, reactivate
        existingAssignment.isActive = true;
        existingAssignment.position = position || existingAssignment.position;
        await existingAssignment.save();

        return {
          status: "Success",
          message: "Staff assignment reactivated",
          data: existingAssignment,
        };
      }
    }

    // Create new staff assignment
    const newAssignment = new RestaurantStaff({
      user,
      restaurant,
      position: position || "Staff",
      isActive: true,
    });

    await newAssignment.save();

    return {
      status: "Success",
      message: "Staff assigned to restaurant successfully",
      data: newAssignment,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get all staff for a restaurant
const getRestaurantStaff = async (restaurantId) => {
  try {
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return { status: "Error", message: "Restaurant not found" };
    }

    const staffAssignments = await RestaurantStaff.find({
      restaurant: restaurantId,
      isActive: true,
    }).populate("user", "name email phone image");

    return { status: "Success", data: staffAssignments };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get all restaurants a staff member is assigned to
const getStaffAssignments = async (userId) => {
  try {
    // Check if user exists and is a staff member
    const user = await User.findById(userId);
    if (!user) {
      return { status: "Error", message: "User not found" };
    }

    // Allow admins to see all assignments
    if (user.role !== "staff" && user.role !== "admin") {
      return {
        status: "Error",
        message: "User must be a staff member or admin",
      };
    }

    const assignments = await RestaurantStaff.find({
      user: userId,
      isActive: true,
    }).populate("restaurant", "name address cuisineType");

    return { status: "Success", data: assignments };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Update staff assignment
const updateStaffAssignment = async (assignmentId, updateData) => {
  try {
    const { position, isActive } = updateData;

    const assignment = await RestaurantStaff.findById(assignmentId);
    if (!assignment) {
      return { status: "Error", message: "Staff assignment not found" };
    }

    // Update fields if provided
    if (position !== undefined) {
      assignment.position = position;
    }

    if (isActive !== undefined) {
      assignment.isActive = isActive;
    }

    await assignment.save();

    return {
      status: "Success",
      message: "Staff assignment updated successfully",
      data: assignment,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Remove staff from restaurant (soft delete by setting isActive to false)
const removeStaff = async (assignmentId) => {
  try {
    const assignment = await RestaurantStaff.findById(assignmentId);
    if (!assignment) {
      return { status: "Error", message: "Staff assignment not found" };
    }

    // Soft delete - set isActive to false
    assignment.isActive = false;
    await assignment.save();

    return {
      status: "Success",
      message: "Staff removed from restaurant successfully",
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

module.exports = {
  assignStaff,
  getRestaurantStaff,
  getStaffAssignments,
  updateStaffAssignment,
  removeStaff,
};
