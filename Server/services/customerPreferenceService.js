const CustomerPreference = require("../models/CustomerPreference");
const User = require("../models/User");

// Create or update a customer preference
const createPreference = async (preferenceData) => {
  try {
    const { user, favoriteDish, dietaryRestrictions, specialNotes } =
      preferenceData;

    // Validate required fields
    if (!user) {
      return { status: "Error", message: "User ID is required" };
    }

    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return { status: "Error", message: "User not found" };
    }

    // Check if preference already exists for this user
    const existingPreference = await CustomerPreference.findOne({ user });

    if (existingPreference) {
      // Update existing preference
      const updatedPreference = await CustomerPreference.findOneAndUpdate(
        { user },
        {
          favoriteDish: favoriteDish || existingPreference.favoriteDish,
          dietaryRestrictions:
            dietaryRestrictions || existingPreference.dietaryRestrictions,
          specialNotes: specialNotes || existingPreference.specialNotes,
        },
        { new: true }
      );

      return {
        status: "Success",
        message: "Customer preferences updated successfully",
        data: updatedPreference,
      };
    }

    // Create new preference
    const newPreference = new CustomerPreference({
      user,
      favoriteDish,
      dietaryRestrictions,
      specialNotes,
    });

    await newPreference.save();

    return {
      status: "Success",
      message: "Customer preferences saved successfully",
      data: newPreference,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get preferences for a specific user
const getPreferenceByUserId = async (userId) => {
  try {
    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return { status: "Error", message: "User not found" };
    }

    const preference = await CustomerPreference.findOne({ user: userId });

    if (!preference) {
      return {
        status: "Success",
        message: "No preferences found for this user",
        data: null,
      };
    }

    return { status: "Success", data: preference };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Update customer preferences
const updatePreference = async (userId, preferenceData) => {
  try {
    const { favoriteDish, dietaryRestrictions, specialNotes } = preferenceData;

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return { status: "Error", message: "User not found" };
    }

    // Check if preference exists for this user
    const preference = await CustomerPreference.findOne({ user: userId });

    if (!preference) {
      // Create new preference if it doesn't exist
      const newPreference = new CustomerPreference({
        user: userId,
        favoriteDish,
        dietaryRestrictions,
        specialNotes,
      });

      await newPreference.save();

      return {
        status: "Success",
        message: "Customer preferences created successfully",
        data: newPreference,
      };
    }

    // Update existing preference
    const updatedPreference = await CustomerPreference.findOneAndUpdate(
      { user: userId },
      {
        favoriteDish:
          favoriteDish !== undefined ? favoriteDish : preference.favoriteDish,
        dietaryRestrictions:
          dietaryRestrictions !== undefined
            ? dietaryRestrictions
            : preference.dietaryRestrictions,
        specialNotes:
          specialNotes !== undefined ? specialNotes : preference.specialNotes,
      },
      { new: true }
    );

    return {
      status: "Success",
      message: "Customer preferences updated successfully",
      data: updatedPreference,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Delete customer preferences
const deletePreference = async (userId) => {
  try {
    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return { status: "Error", message: "User not found" };
    }

    const preference = await CustomerPreference.findOne({ user: userId });

    if (!preference) {
      return { status: "Error", message: "No preferences found for this user" };
    }

    await CustomerPreference.findOneAndDelete({ user: userId });

    return {
      status: "Success",
      message: "Customer preferences deleted successfully",
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

module.exports = {
  createPreference,
  getPreferenceByUserId,
  updatePreference,
  deletePreference,
};
