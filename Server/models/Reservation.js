const mongoose = require("mongoose");
const ReservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    table: { type: mongoose.Schema.Types.ObjectId, ref: "TableInfo" },
    reservationDate: Date,
    reservationTime: String,
    numGuests: Number,
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    specialRequest: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", ReservationSchema);
