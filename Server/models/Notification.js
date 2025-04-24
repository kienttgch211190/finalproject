const mongoose = require("mongoose");
const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  type: { type: String, enum: ["confirmation", "reminder", "promo", "system"] },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
