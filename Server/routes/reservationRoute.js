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
  getAllReservationsAdmin,
  getRecentReservations,
  getRestaurantTodayReservations,
  getRestaurantPendingReservations,
  getRestaurantCompletedReservations,
  getRestaurantConfirmedReservations,
  getRestaurantCancelledReservations,
  getUserReservations,
} = require("../controllers/reservationController");
const {
  authMiddleware,
  isAdmin,
  isStaffOrAdmin,
} = require("../middlewares/middleware");

// Find available tables
router.post("/available-tables", authMiddleware("access"), getAvailableTables);
// create reservation
router.post("/create", authMiddleware("access"), createReservation);

router.get(
  "/restaurant/:restaurantId/today",
  authMiddleware("access"),
  getRestaurantTodayReservations
);

router.get("/", authMiddleware("access"), isAdmin, getAllReservationsAdmin);
//update reservation
router.put("/update/:id", authMiddleware("access"), updateReservation);
//cancel reservation
router.delete("/cancel/:id", authMiddleware("access"), cancelReservation);
//delete reservation (for admin)
router.delete(
  "/delete/:id",
  authMiddleware("access"),
  isAdmin,
  cancelReservation
);
// Get all reservations for a user
router.get(
  "/restaurant/:restaurantId",
  authMiddleware("access"),
  getAllReservations
);
//update reservation status(for staff)
router.put(
  "/status/:id",
  authMiddleware("access"),
  isStaffOrAdmin,
  updateReservationStatus
);
// Get a specific reservation by ID
router.get("/detail/:id", authMiddleware("access"), getReservationById);

router.get("/recent", authMiddleware("access"), isAdmin, getRecentReservations);

router.get(
  "/restaurant/:restaurantId/pending",
  authMiddleware("access"),
  getRestaurantPendingReservations
);

router.get(
  "/restaurant/:restaurantId/completed",
  authMiddleware("access"),
  getRestaurantCompletedReservations
);

router.get(
  "/restaurant/:restaurantId/confirmed",
  authMiddleware("access"),
  getRestaurantConfirmedReservations
);

router.get(
  "/restaurant/:restaurantId/cancelled",
  authMiddleware("access"),
  getRestaurantCancelledReservations
);

router.get("/user/:userId", authMiddleware("access"), getUserReservations);
module.exports = router;
