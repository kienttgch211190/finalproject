const express = require("express");
const router = express.Router();
const {
  getAvailableTables,
  createReservation,
  updateReservation,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
  getReservationById,
} = require("../controllers/reservationController");
const { authMiddleware, isStaff} =require("../middlewares/middleware");

// Find available tables
router.post("/available-tables", authMiddleware("access"), getAvailableTables);
// create reservation
router.post("/", authMiddleware("access"), createReservation);
//update reservation
router.put("/:id", authMiddleware("access"), updateReservation);
//cancel reservation
router.delete("/:id", authMiddleware("access"), cancelReservation);
// Get all reservations for a user
router.get("/user/:userId", authMiddleware("access"), getAllReservations);
//update reservation status(for staff)
router.put("/status/:id",authMiddleware("access"),isStaff, updateReservationStatus);
// Get a specific reservation by ID
router.get("/detail/:id", authMiddleware("access"), getReservationById);

module.exports = router;
