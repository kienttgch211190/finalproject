const reviewService = require("../services/reviewService");

// Create a new review
const createReview = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.payload.id;

    // Create review data by combining request body with authenticated user ID
    const reviewData = {
      ...req.body,
      user: userId,
    };

    const result = await reviewService.createReview(reviewData);

    if (result.status === "Success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get reviews for a restaurant
const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const onlyApproved = req.query.onlyApproved !== "false"; // Default to true if not specified

    const result = await reviewService.getRestaurantReviews(
      restaurantId,
      onlyApproved
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get reviews by a user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the requesting user is trying to access their own reviews
    // or is an admin/staff who can see others' reviews
    if (req.user.payload.id !== userId && req.user.payload.role !== "admin") {
      return res.status(403).json({
        status: "Error",
        message: "You don't have permission to view these reviews",
      });
    }

    const result = await reviewService.getUserReviews(userId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.payload.id;

    const result = await reviewService.updateReview(reviewId, userId, req.body);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      if (result.message === "Review not found") {
        res.status(404).json(result);
      } else if (result.message === "You can only update your own reviews") {
        res.status(403).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.payload.id;

    // For admin users, allow them to delete any review
    const isAdmin = req.user.payload.role === "admin";

    const result = await reviewService.deleteReview(
      reviewId,
      isAdmin ? null : userId // Pass null userId for admins to bypass ownership check
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      if (result.message === "Review not found") {
        res.status(404).json(result);
      } else if (result.message === "You can only delete your own reviews") {
        res.status(403).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Approve or reject a review (admin/staff function)
const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    // Check if the isApproved parameter is a boolean
    if (typeof isApproved !== "boolean") {
      return res.status(400).json({
        status: "Error",
        message: "isApproved must be a boolean value",
      });
    }

    const result = await reviewService.moderateReview(reviewId, isApproved);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      if (result.message === "Review not found") {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get reviews statistics for a restaurant
const getReviewStats = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await reviewService.getRestaurantReviews(
      restaurantId,
      true
    );

    if (reviews.status !== "Success") {
      return res.status(400).json(reviews);
    }

    const reviewsData = reviews.data;

    // Calculate stats
    const totalReviews = reviewsData.length;
    let totalRating = 0;
    const ratingCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviewsData.forEach((review) => {
      totalRating += review.rating;
      ratingCounts[review.rating]++;
    });

    const averageRating =
      totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    // Calculate percentage for each rating
    const ratingPercentages = {};
    Object.keys(ratingCounts).forEach((rating) => {
      ratingPercentages[rating] =
        totalReviews > 0
          ? Math.round((ratingCounts[rating] / totalReviews) * 100)
          : 0;
    });

    res.status(200).json({
      status: "Success",
      data: {
        totalReviews,
        averageRating,
        ratingCounts,
        ratingPercentages,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

module.exports = {
  createReview,
  getRestaurantReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  moderateReview,
  getReviewStats,
};
