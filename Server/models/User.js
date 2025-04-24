const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: String,
    image: {type: String},
    address: {type: String},
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    passwordHash: String,
    role: {
      type: String,
      enum: ["customer", "staff", "admin"],
      default: "customer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
