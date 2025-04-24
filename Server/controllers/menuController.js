const menuService = require("../services/menuService");

// Create a new menu
const createMenu = async (req, res) => {
  try {
    const result = await menuService.createMenu(req.body);

    if (result.status === "Success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get all menus for a restaurant
const getRestaurantMenus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { includeItems } = req.query;

    const result = await menuService.getRestaurantMenus(
      restaurantId,
      includeItems === "true"
    );

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Restaurant not found" ? 404 : 500)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get a specific menu with its items
const getMenuById = async (req, res) => {
  try {
    const { menuId } = req.params;

    const result = await menuService.getMenuById(menuId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "Menu not found" ? 404 : 500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Update a menu
const updateMenu = async (req, res) => {
  try {
    const { menuId } = req.params;

    const result = await menuService.updateMenu(menuId, req.body);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "Menu not found" ? 404 : 400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Delete a menu
const deleteMenu = async (req, res) => {
  try {
    const { menuId } = req.params;

    const result = await menuService.deleteMenu(menuId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "Menu not found" ? 404 : 500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Create a new menu item
const createMenuItem = async (req, res) => {
  try {
    const result = await menuService.createMenuItem(req.body);

    if (result.status === "Success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get all items for a specific menu
const getMenuItems = async (req, res) => {
  try {
    const { menuId } = req.params;

    const result = await menuService.getMenuItems(menuId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res.status(result.message === "Menu not found" ? 404 : 500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Get a specific menu item
const getMenuItemById = async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await menuService.getMenuItemById(itemId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Menu item not found" ? 404 : 500)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await menuService.updateMenuItem(itemId, req.body);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Menu item not found" ? 404 : 400)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await menuService.deleteMenuItem(itemId);

    if (result.status === "Success") {
      res.status(200).json(result);
    } else {
      res
        .status(result.message === "Menu item not found" ? 404 : 500)
        .json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

module.exports = {
  // Menu operations
  createMenu,
  getRestaurantMenus,
  getMenuById,
  updateMenu,
  deleteMenu,

  // MenuItem operations
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
