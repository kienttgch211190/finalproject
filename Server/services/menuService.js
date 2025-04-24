const Menu = require("../models/Menu");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// Create a new menu
const createMenu = async (menuData) => {
  try {
    const { restaurant, name, description } = menuData;

    // Validate required fields
    if (!restaurant || !name) {
      return { status: "Error", message: "Required fields are missing" };
    }

    // Check if restaurant exists
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return { status: "Error", message: "Restaurant not found" };
    }

    const newMenu = new Menu({
      restaurant,
      name,
      description,
      isActive: true,
    });

    await newMenu.save();

    return {
      status: "Success",
      message: "Menu created successfully",
      data: newMenu,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get all menus for a restaurant
const getRestaurantMenus = async (restaurantId, includeItems = false) => {
  try {
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return { status: "Error", message: "Restaurant not found" };
    }

    let menus = await Menu.find({ restaurant: restaurantId });

    if (includeItems) {
      // For each menu, get its items
      const menusWithItems = await Promise.all(
        menus.map(async (menu) => {
          const items = await MenuItem.find({ menu: menu._id });
          // Convert the menu to an object and add items
          const menuObj = menu.toObject();
          menuObj.items = items;
          return menuObj;
        })
      );

      menus = menusWithItems;
    }

    return { status: "Success", data: menus };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get a specific menu with its items
const getMenuById = async (menuId) => {
  try {
    const menu = await Menu.findById(menuId);

    if (!menu) {
      return { status: "Error", message: "Menu not found" };
    }

    const items = await MenuItem.find({ menu: menuId });

    return {
      status: "Success",
      data: {
        ...menu.toObject(),
        items,
      },
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Update a menu
const updateMenu = async (menuId, menuData) => {
  try {
    const { name, description, isActive } = menuData;

    const menu = await Menu.findById(menuId);

    if (!menu) {
      return { status: "Error", message: "Menu not found" };
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      menuId,
      {
        name: name || menu.name,
        description: description !== undefined ? description : menu.description,
        isActive: isActive !== undefined ? isActive : menu.isActive,
      },
      { new: true }
    );

    return {
      status: "Success",
      message: "Menu updated successfully",
      data: updatedMenu,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Delete a menu (and all its items)
const deleteMenu = async (menuId) => {
  try {
    const menu = await Menu.findById(menuId);

    if (!menu) {
      return { status: "Error", message: "Menu not found" };
    }

    // Delete all items belonging to this menu
    await MenuItem.deleteMany({ menu: menuId });

    // Delete the menu
    await Menu.findByIdAndDelete(menuId);

    return {
      status: "Success",
      message: "Menu and all its items deleted successfully",
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Create a new menu item
const createMenuItem = async (menuItemData) => {
  try {
    const { menu, name, description, imageUrl, price, category } = menuItemData;

    // Validate required fields
    if (!menu || !name || !price) {
      return { status: "Error", message: "Required fields are missing" };
    }

    // Check if menu exists
    const menuExists = await Menu.findById(menu);
    if (!menuExists) {
      return { status: "Error", message: "Menu not found" };
    }

    const newMenuItem = new MenuItem({
      menu,
      name,
      description,
      imageUrl,
      price,
      category,
      isAvailable: true,
    });

    await newMenuItem.save();

    return {
      status: "Success",
      message: "Menu item created successfully",
      data: newMenuItem,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get all items for a specific menu
const getMenuItems = async (menuId) => {
  try {
    // Check if menu exists
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return { status: "Error", message: "Menu not found" };
    }

    const items = await MenuItem.find({ menu: menuId });

    return { status: "Success", data: items };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Get a specific menu item
const getMenuItemById = async (itemId) => {
  try {
    const item = await MenuItem.findById(itemId).populate("menu", "name");

    if (!item) {
      return { status: "Error", message: "Menu item not found" };
    }

    return { status: "Success", data: item };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Update a menu item
const updateMenuItem = async (itemId, menuItemData) => {
  try {
    const { name, description, imageUrl, price, category, isAvailable } =
      menuItemData;

    const menuItem = await MenuItem.findById(itemId);

    if (!menuItem) {
      return { status: "Error", message: "Menu item not found" };
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      itemId,
      {
        name: name || menuItem.name,
        description:
          description !== undefined ? description : menuItem.description,
        imageUrl: imageUrl || menuItem.imageUrl,
        price: price || menuItem.price,
        category: category || menuItem.category,
        isAvailable:
          isAvailable !== undefined ? isAvailable : menuItem.isAvailable,
      },
      { new: true }
    );

    return {
      status: "Success",
      message: "Menu item updated successfully",
      data: updatedMenuItem,
    };
  } catch (error) {
    return { status: "Error", message: error.message };
  }
};

// Delete a menu item
const deleteMenuItem = async (itemId) => {
  try {
    const menuItem = await MenuItem.findById(itemId);

    if (!menuItem) {
      return { status: "Error", message: "Menu item not found" };
    }

    await MenuItem.findByIdAndDelete(itemId);

    return { status: "Success", message: "Menu item deleted successfully" };
  } catch (error) {
    return { status: "Error", message: error.message };
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
    