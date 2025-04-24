const mongoose = require("mongoose");
const PromotionSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  title: String,
  description: String,
  discountPercent: Number,
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Promotion", PromotionSchema);
