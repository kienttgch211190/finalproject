const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");
const { authMiddleware, isStaff, isAdmin , isStaffOrAdmin} = require("../middlewares/middleware");

router.get("/", getAllRestaurants);
router.get("/detail/:id", getRestaurantById);
router.post("/create", authMiddleware("access"), isAdmin, createRestaurant);
router.put("/update/:id", authMiddleware("access"), isAdmin, updateRestaurant);
router.delete("/delete/:id", authMiddleware("access"), isAdmin, deleteRestaurant);

module.exports = router;
