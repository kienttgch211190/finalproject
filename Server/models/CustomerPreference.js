const mongoose = require("mongoose");
const CustomerPreferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  favoriteDish: String,
  dietaryRestrictions: String,
  specialNotes: String,
});

module.exports = mongoose.model("CustomerPreference", CustomerPreferenceSchema);
