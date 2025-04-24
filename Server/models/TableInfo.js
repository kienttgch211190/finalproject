const mongoose = require("mongoose");
const TableSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  tableNumber: String,
  capacity: Number,
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("TableInfo", TableSchema);
