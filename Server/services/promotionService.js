const Promotion = require("../models/Promotion");
const Restaurant = require("../models/Restaurant");

// Create a new promotion
const createPromotion = async (promotionData) => {
  try {
    const {
      restaurant,
      title,
      description,
      discountPercent,
      startDate,
      endDate,
    } = promotionData;

    // Validate required fields
    if (!restaurant || !title || !discountPercent || !startDate || !endDate) {
      return { status: "Error", message: "Required fields are missing" };
    }

    // Check if restaurant exists
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return { status: "Error", message: "Restaurant not found" };
    }

    // Validate discount percent
    if (discountPercent <= 0 || discountPercent > 100) {
      return {
        status: "Error",
        message: "Discount percent must be between 1 and 100",
      };
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { status: "Error", message: "Invalid date format" };
    }

    if (end <= start) {
      return { status: "Error", message: "End date must be after start date" };
    }

    const newPromotion = new Promotion({
      restaurant,
      title,
      description,
      discountPercent,
      startDate: start,
      endDate: end,
      isActive: true,
    });

    await newPromotion.save();

    return {
      status: "Success",
      message: "Promotion created successfully",
      data: newPromotion,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get all promotions for a restaurant
const getRestaurantPromotions = async (
  restaurantId,
  includeExpired = false
) => {
  try {
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return { status: "Error", message: "Restaurant not found" };
    }

    let query = { restaurant: restaurantId };

    if (!includeExpired) {
      // Only show active and non-expired promotions
      const currentDate = new Date();
      query.endDate = { $gte: currentDate };
      query.isActive = true;
    }

    const promotions = await Promotion.find(query).sort({ startDate: 1 });

    return { status: "Success", data: promotions };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get active promotions across all restaurants
const getActivePromotions = async () => {
  try {
    const currentDate = new Date();

    const promotions = await Promotion.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      isActive: true,
    })
      .populate("restaurant", "name address")
      .sort({ discountPercent: -1 });

    return { status: "Success", data: promotions };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get a specific promotion by ID
const getPromotionById = async (promotionId) => {
  try {
    const promotion = await Promotion.findById(promotionId).populate(
      "restaurant",
      "name address"
    );

    if (!promotion) {
      return { status: "Error", message: "Promotion not found" };
    }

    return { status: "Success", data: promotion };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Update a promotion
const updatePromotion = async (promotionId, promotionData) => {
  try {
    const {
      title,
      description,
      discountPercent,
      startDate,
      endDate,
      isActive,
    } = promotionData;

    const promotion = await Promotion.findById(promotionId);

    if (!promotion) {
      return { status: "Error", message: "Promotion not found" };
    }

    // Validate discount percent if provided
    if (discountPercent && (discountPercent <= 0 || discountPercent > 100)) {
      return {
        status: "Error",
        message: "Discount percent must be between 1 and 100",
      };
    }

    // Validate dates if provided
    let start = promotion.startDate;
    let end = promotion.endDate;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return { status: "Error", message: "Invalid start date format" };
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return { status: "Error", message: "Invalid end date format" };
      }
    }

    if (end <= start) {
      return { status: "Error", message: "End date must be after start date" };
    }

    const updatedPromotion = await Promotion.findByIdAndUpdate(
      promotionId,
      {
        title: title || promotion.title,
        description:
          description !== undefined ? description : promotion.description,
        discountPercent: discountPercent || promotion.discountPercent,
        startDate: start,
        endDate: end,
        isActive: isActive !== undefined ? isActive : promotion.isActive,
      },
      { new: true }
    );

    return {
      status: "Success",
      message: "Promotion updated successfully",
      data: updatedPromotion,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Delete a promotion
const deletePromotion = async (promotionId) => {
  try {
    const promotion = await Promotion.findById(promotionId);

    if (!promotion) {
      return { status: "Error", message: "Promotion not found" };
    }

    await Promotion.findByIdAndDelete(promotionId);

    return { status: "Success", message: "Promotion deleted successfully" };
  } catch (error) {
    return { status: "Error", message: error.message };
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
