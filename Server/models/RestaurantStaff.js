const mongoose = require("mongoose");
const RestaurantStaffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  position: String,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("RestaurantStaff", RestaurantStaffSchema);
