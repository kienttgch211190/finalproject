const promotionService = require("../services/promotionService");

// Create a new promotion
const createPromotion = async (req, res) => {
  try {
    const result = await promotionService.createPromotion(req.body);

    if (result.status === "Success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get promotions for a restaurant
const getRestaurantPromotions = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { includeExpired } = req.query;

    const result = await promotionService.getRestaurantPromotions(
      restaurantId,
      includeExpired === "true"
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

// Get all active promotions
const getActivePromotions = async (req, res) => {
  try {
    const result = await promotionService.getActivePromotions();

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get a specific promotion
const getPromotionById = async (req, res) => {
  try {
    const { promotionId } = req.params;

    const result = await promotionService.getPromotionById(promotionId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Promotion not found" ? 404 : 500)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Update a promotion
const updatePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;

    const result = await promotionService.updatePromotion(
      promotionId,
      req.body
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      if (result.message === "Promotion not found") {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Delete a promotion
const deletePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;

    const result = await promotionService.deletePromotion(promotionId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Promotion not found" ? 404 : 500)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

module.exports = {
  createPromotion,
  getRestaurantPromotions,
  getActivePromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
};
