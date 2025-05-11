const express = require("express");
const router = express.Router();
const {
  createTable,
  getRestaurantTables,
  getTableById,
  checkTableAvailability,
  updateTable,
  deleteTable,
  findAvailableTables,
} = require("../controllers/tableInfoController");
const { authMiddleware, isStaff } = require("../middlewares/middleware");

router.post("/", authMiddleware("access"), isStaff, createTable);
router.get("/:tableId", getTableById);
router.get("/restaurant/:restaurantId", getRestaurantTables);
router.get("/:tableId/availability", checkTableAvailability);
router.get("/available/:restaurantId", findAvailableTables);
router.put("/:tableId", authMiddleware("access"), isStaff, updateTable);
router.delete("/:tableId", authMiddleware("access"), isStaff, deleteTable);

module.exports = router;
