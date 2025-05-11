const reservationService = require("../services/reservationService");

// Sửa hàm getAvailableTables
const getAvailableTables = async (req, res) => {
  const { restaurantId, reservationDate, reservationTime, numGuests } =
    req.body;
  try {
    // Validate input
    if (!restaurantId || !reservationDate || !reservationTime || !numGuests) {
      return res.status(400).json({
        status: "Error",
        message:
          "Missing required fields: restaurantId, reservationDate, reservationTime, numGuests",
      });
    }

    // Convert numGuests to number if it's a string
    const parsedNumGuests = parseInt(numGuests);
    if (isNaN(parsedNumGuests)) {
      return res.status(400).json({
        status: "Error",
        message: "Number of guests must be a valid number",
      });
    }

    const result = await reservationService.getAvailableTables(
      restaurantId,
      reservationDate,
      reservationTime,
      parsedNumGuests
    );

    // Return appropriate response regardless of whether tables were found
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAvailableTables:", err);
    return res.status(500).json({
      status: "Error",
      message: "Error when finding available tables: " + err.message,
    });
  }
};

// Add this function to reservationController.js
const getAllReservationsAdmin = async (req, res) => {
  try {
    const result = await reservationService.getAllReservationsAdmin(req.query);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};
// Create reservation
const createReservation = async (req, res) => {
  try {
    const result = await reservationService.createReservation(req.body);
    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get reservation by ID
const getReservationById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await reservationService.getReservationById(id);
    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// Update reservation
const updateReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await reservationService.updateReservation(id, req.body);
    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// Cancel reservation
const cancelReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await reservationService.cancelReservation(id);
    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// Get all reservations
const getAllReservations = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    // Pass query parameters for filtering and sorting
    const result = await reservationService.getAllReservations(
      restaurantId,
      req.query
    );
    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// Update reservation status (for staff)
const updateReservationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await reservationService.updateReservationStatus(id, status);
    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(
          result.status === "Error" &&
            result.message === "Reservation not found"
            ? 404
            : 400
        )
        .json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// Get recent reservations from the last day
const getRecentReservations = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const result = await reservationService.getRecentReservations(limit);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// Get today's reservations for a restaurant
const getRestaurantTodayReservations = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const result = await reservationService.getRestaurantTodayReservations(
      restaurantId
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(
          result.status === "Error" && result.message.includes("not found")
            ? 404
            : 400
        )
        .json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// Get pending reservations for a restaurant
const getRestaurantPendingReservations = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const result = await reservationService.getRestaurantPendingReservations(
      restaurantId
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(
          result.status === "Error" && result.message.includes("not found")
            ? 404
            : 400
        )
        .json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

const getRestaurantCompletedReservations = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Truyền query parameters cho service function để hỗ trợ lọc theo khoảng thời gian
    const result = await reservationService.getRestaurantCompletedReservations(
      restaurantId,
      req.query
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(
          result.status === "Error" && result.message.includes("not found")
            ? 404
            : 400
        )
        .json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

const getRestaurantConfirmedReservations = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const result = await reservationService.getRestaurantConfirmedReservations(
      restaurantId,
      req.query
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(
          result.status === "Error" && result.message.includes("not found")
            ? 404
            : 400
        )
        .json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

const getRestaurantCancelledReservations = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const result = await reservationService.getRestaurantCancelledReservations(
      restaurantId,
      req.query
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(
          result.status === "Error" && result.message.includes("not found")
            ? 404
            : 400
        )
        .json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

const getUserReservations = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await reservationService.getUserReservations(userId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(
          result.status === "Error" && result.message.includes("not found")
            ? 404
            : 400
        )
        .json(result);
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

module.exports = {
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
};
