const express = require("express");
const router = express.Router();
const {
  createMenu,
  getRestaurantMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const { authMiddleware, isStaff } = require("../middlewares/middleware");

/**
 * @route POST /api/menu
 * @desc Create a new menu
 * @access Private (Staff only)
 */
router.post("/", authMiddleware("access"), isStaff, createMenu);

/**
 * @route GET /api/menu/restaurant/:restaurantId
 * @desc Get all menus for a restaurant (with optional items)
 * @access Public
 */
router.get("/restaurant/:restaurantId", getRestaurantMenus);

/**
 * @route GET /api/menu/:menuId
 * @desc Get a specific menu with its items
 * @access Public
 */
router.get("/:menuId", getMenuById);

/**
 * @route PUT /api/menu/:menuId
 * @desc Update a menu
 * @access Private (Staff only)
 */
router.put("/:menuId", authMiddleware("access"), isStaff, updateMenu);

/**
 * @route DELETE /api/menu/:menuId
 * @desc Delete a menu and all its items
 * @access Private (Staff only)
 */
router.delete("/:menuId", authMiddleware("access"), isStaff, deleteMenu);

/**
 * @route POST /api/menu/item
 * @desc Create a new menu item
 * @access Private (Staff only)
 */
router.post("/item", authMiddleware("access"), isStaff, createMenuItem);

/**
 * @route GET /api/menu/:menuId/items
 * @desc Get all items for a specific menu
 * @access Public
 */
router.get("/:menuId/items", getMenuItems);

/**
 * @route GET /api/menu/item/:itemId
 * @desc Get a specific menu item
 * @access Public
 */
router.get("/item/:itemId", getMenuItemById);

/**
 * @route PUT /api/menu/item/:itemId
 * @desc Update a menu item
 * @access Private (Staff only)
 */
router.put("/item/:itemId", authMiddleware("access"), isStaff, updateMenuItem);

/**
 * @route DELETE /api/menu/item/:itemId
 * @desc Delete a menu item
 * @access Private (Staff only)
 */
router.delete(
  "/item/:itemId",
  authMiddleware("access"),
  isStaff,
  deleteMenuItem
);

module.exports = router;
