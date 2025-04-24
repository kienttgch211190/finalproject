const restaurantService = require("../services/restaurantService");

// Create a new restaurant
const createRestaurant = async (req, res) => {
  try {
    const result = await restaurantService.createRestaurant(req.body);

    if (result.status === "Success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get all restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const { cuisineType, priceRange, sort, order } = req.query;

    const filters = {
      cuisineType,
      priceRange,
      sort,
      order,
    };

    const result = await restaurantService.getAllRestaurants(filters);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get a restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await restaurantService.getRestaurantById(id);

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

// Update a restaurant
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await restaurantService.updateRestaurant(id, req.body);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Restaurant not found" ? 404 : 400)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Delete a restaurant
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await restaurantService.deleteRestaurant(id);

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

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
