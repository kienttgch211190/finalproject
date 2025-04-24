const mongoose = require("mongoose");
const RestaurantSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    cuisineType: String,
    description: String,
    openingTime: String, //
    closingTime: String,
    priceRange: { type: String, enum: ["low", "medium", "high"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", RestaurantSchema);
