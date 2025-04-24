const Restaurant = require("../models/Restaurant");

// Create a new restaurant
const createRestaurant = async (restaurantData) => {
  try {
    const {
      name,
      address,
      cuisineType,
      description,
      openingTime,
      closingTime,
      priceRange,
    } = restaurantData;

    // Validate required fields
    if (!name || !address || !openingTime || !closingTime) {
      return { status: "Error", message: "Required fields are missing" };
    }

    // Check for valid price range
    if (priceRange && !["low", "medium", "high"].includes(priceRange)) {
      return { status: "Error", message: "Invalid price range" };
    }

    const newRestaurant = new Restaurant({
      name,
      address,
      cuisineType,
      description,
      openingTime,
      closingTime,
      priceRange: priceRange || "medium",
    });

    await newRestaurant.save();

    return {
      status: "Success",
      message: "Restaurant created successfully",
      data: newRestaurant,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get all restaurants with optional filtering
const getAllRestaurants = async (filters = {}) => {
  try {
    const { cuisineType, priceRange, sort = "name", order = "asc" } = filters;

    let query = {};

    if (cuisineType) {
      query.cuisineType = cuisineType;
    }

    if (priceRange) {
      query.priceRange = priceRange;
    }

    const sortOptions = {};
    sortOptions[sort] = order === "asc" ? 1 : -1;

    const restaurants = await Restaurant.find(query).sort(sortOptions);

    return { status: "Success", data: restaurants };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get a restaurant by ID
const getRestaurantById = async (id) => {
  try {
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return { status: "Error", message: "Restaurant not found" };
    }

    return { status: "Success", data: restaurant };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Update a restaurant
const updateRestaurant = async (id, restaurantData) => {
  try {
    const {
      name,
      address,
      cuisineType,
      description,
      openingTime,
      closingTime,
      priceRange,
    } = restaurantData;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return { status: "Error", message: "Restaurant not found" };
    }

    // Check for valid price range
    if (priceRange && !["low", "medium", "high"].includes(priceRange)) {
      return { status: "Error", message: "Invalid price range" };
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        name,
        address,
        cuisineType,
        description,
        openingTime,
        closingTime,
        priceRange,
      },
      { new: true }
    );

    return {
      status: "Success",
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Delete a restaurant
const deleteRestaurant = async (id) => {
  try {
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return { status: "Error", message: "Restaurant not found" };
    }

    await Restaurant.findByIdAndDelete(id);

    return { status: "Success", message: "Restaurant deleted successfully" };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
