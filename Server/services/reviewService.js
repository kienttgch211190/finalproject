const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

// Create a new review
const createReview = async (reviewData) => {
  try {
    const { user, restaurant, rating, comment } = reviewData;

    // Validate required fields
    if (!user || !restaurant || !rating) {
      return { status: "Error", message: "Required fields are missing" };
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return { status: "Error", message: "Rating must be between 1 and 5" };
    }

    // Check if restaurant exists
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return { status: "Error", message: "Restaurant not found" };
    }

    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return { status: "Error", message: "User not found" };
    }

    // Check if user has already reviewed this restaurant
    const existingReview = await Review.findOne({ user, restaurant });
    if (existingReview) {
      return {
        status: "Error",
        message: "You have already reviewed this restaurant",
      };
    }

    const newReview = new Review({
      user,
      restaurant,
      rating,
      comment,
      isApproved: false, // Default to false, admin will approve later
    });

    await newReview.save();

    return {
      status: "Success",
      message: "Review submitted successfully and awaiting approval",
      data: newReview,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get reviews for a restaurant
const getRestaurantReviews = async (restaurantId, onlyApproved = true) => {
  try {
    let query = { restaurant: restaurantId };

    if (onlyApproved) {
      query.isApproved = true;
    }

    const reviews = await Review.find(query)
      .populate("user", "name image")
      .sort({ createdAt: -1 });

    return { status: "Success", data: reviews };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get reviews by a user
const getUserReviews = async (userId) => {
  try {
    const reviews = await Review.find({ user: userId })
      .populate("restaurant", "name address")
      .sort({ createdAt: -1 });

    return { status: "Success", data: reviews };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Update a review
const updateReview = async (reviewId, userId, reviewData) => {
  try {
    const { rating, comment } = reviewData;

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return { status: "Error", message: "Review not found" };
    }

    // Check if the user owns this review
    if (review.user.toString() !== userId) {
      return {
        status: "Error",
        message: "You can only update your own reviews",
      };
    }

    // Validate rating range
    if (rating && (rating < 1 || rating > 5)) {
      return { status: "Error", message: "Rating must be between 1 and 5" };
    }

    // Update the review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.isApproved = false; // Reset approval status

    await review.save();

    return {
      status: "Success",
      message: "Review updated successfully and awaiting approval",
      data: review,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Delete a review
const deleteReview = async (reviewId, userId) => {
  try {
    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return { status: "Error", message: "Review not found" };
    }

    // Check if the user owns this review or is an admin
    if (review.user.toString() !== userId) {
      return {
        status: "Error",
        message: "You can only delete your own reviews",
      };
    }

    await Review.findByIdAndDelete(reviewId);

    return { status: "Success", message: "Review deleted successfully" };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Approve or reject a review (admin function)
const moderateReview = async (reviewId, isApproved) => {
  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return { status: "Error", message: "Review not found" };
    }

    review.isApproved = isApproved;
    await review.save();

    return {
      status: "Success",
      message: isApproved ? "Review approved" : "Review rejected",
      data: review,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

module.exports = {
  createReview,
  getRestaurantReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  moderateReview,
};
