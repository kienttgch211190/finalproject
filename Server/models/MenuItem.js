const mongoose = require("mongoose");
const MenuItemSchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
  name: String,
  description: String,
  imageUrl: String,
  price: Number,
  category: String,
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("MenuItem", MenuItemSchema);
