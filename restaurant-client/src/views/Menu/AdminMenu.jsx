import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  message,
  Card,
  Tabs,
  Spin,
  Typography,
  Divider,
} from "antd";
import { Link } from "react-router-dom";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  ShopOutlined,
  MenuOutlined,
  DollarOutlined,
  AppstoreOutlined,
  TagOutlined,
} from "@ant-design/icons";

// Material-UI components for breadcrumbs
import {
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  Container,
  Typography as MuiTypography,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

// Custom axios instance
import axiosInstance from "../../contexts/AxiosCustom";

// Import CSS
import "../../style/Menu/AdminMenu.scss";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Meta } = Card;
const { Title, Text } = Typography;

const AdminMenu = () => {
  // States
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [menuForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  // Dialogs
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // First load - fetch restaurants
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // When restaurant is selected, fetch its menus
  useEffect(() => {
    if (selectedRestaurant) {
      fetchRestaurantMenus(selectedRestaurant);
    } else {
      setMenus([]);
      setSelectedMenu(null);
      setMenuItems([]);
    }
  }, [selectedRestaurant]);

  // When menu is selected, fetch its items
  useEffect(() => {
    if (selectedMenu) {
      fetchMenuItems(selectedMenu._id);
    } else {
      setMenuItems([]);
    }
  }, [selectedMenu]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/restaurant");

      if (response.data.status === "Success") {
        setRestaurants(response.data.data || []);
      } else {
        message.error("Không thể tải danh sách nhà hàng");
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      message.error(
        "Không thể tải danh sách nhà hàng: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantMenus = async (restaurantId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/menu/restaurant/${restaurantId}`
      );

      if (response.data.status === "Success") {
        setMenus(response.data.data || []);
        setSelectedMenu(null);
        setMenuItems([]);
      } else {
        message.error("Không thể tải danh sách menu");
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      message.error(
        "Không thể tải danh sách menu: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (menuId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/menu/${menuId}/items`);

      if (response.data.status === "Success") {
        setMenuItems(response.data.data || []);
      } else {
        message.error("Không thể tải danh sách món ăn");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      message.error(
        "Không thể tải danh sách món ăn: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Restaurant selection handler
  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
  };

  // Menu selection handler
  const handleSelectMenu = (menu) => {
    setSelectedMenu(menu);
    setActiveTab("2"); // Switch to menu items tab when selecting a menu
  };

  // ===== MENU MODAL HANDLERS =====
  const openMenuModal = (menu = null) => {
    if (!selectedRestaurant && !menu) {
      message.warning("Vui lòng chọn nhà hàng trước");
      return;
    }

    setIsEditMode(!!menu);

    if (menu) {
      // Edit mode
      menuForm.setFieldsValue({
        name: menu.name,
        description: menu.description || "",
        restaurant: menu.restaurant,
      });
    } else {
      // Create mode
      menuForm.setFieldsValue({
        name: "",
        description: "",
        restaurant: selectedRestaurant,
      });
    }

    setMenuModalVisible(true);
  };

  const handleSaveMenu = async (values) => {
    try {
      setLoading(true);

      if (isEditMode) {
        // Update existing menu
        const response = await axiosInstance.put(
          `/api/menu/${selectedMenu._id}`,
          values
        );

        if (response.data.status === "Success") {
          message.success("Cập nhật menu thành công!");

          // Update the menu in the state
          setMenus(
            menus.map((menu) =>
              menu._id === selectedMenu._id ? response.data.data : menu
            )
          );
          setSelectedMenu(response.data.data);
        } else {
          message.error("Không thể cập nhật menu: " + response.data.message);
        }
      } else {
        // Create new menu
        const response = await axiosInstance.post("/api/menu", values);

        if (response.data.status === "Success") {
          message.success("Tạo menu mới thành công!");

          // Add the new menu to the state
          const newMenu = response.data.data;
          setMenus([...menus, newMenu]);
        } else {
          message.error("Không thể tạo menu mới: " + response.data.message);
        }
      }

      setMenuModalVisible(false);
    } catch (error) {
      console.error("Error saving menu:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa menu này? Tất cả các món ăn trong menu cũng sẽ bị xóa."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/api/menu/${menuId}`);

      if (response.data.status === "Success") {
        message.success("Xóa menu thành công!");

        // Remove the menu from the state
        setMenus(menus.filter((menu) => menu._id !== menuId));

        // If the deleted menu was selected, clear selection
        if (selectedMenu && selectedMenu._id === menuId) {
          setSelectedMenu(null);
          setMenuItems([]);
        }
      } else {
        message.error("Không thể xóa menu: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ===== MENU ITEM MODAL HANDLERS =====
  const openItemModal = (item = null) => {
    if (!selectedMenu) {
      message.warning("Vui lòng chọn menu trước khi thêm món ăn");
      return;
    }

    setIsEditMode(!!item);

    if (item) {
      // Edit mode
      itemForm.setFieldsValue({
        _id: item._id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category || "",
        imageUrl: item.imageUrl || "",
        menu: item.menu,
      });
    } else {
      // Create mode
      itemForm.setFieldsValue({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
        menu: selectedMenu._id,
      });
    }

    setItemModalVisible(true);
  };

  const handleSaveItem = async (values) => {
    try {
      setLoading(true);

      if (isEditMode) {
        // Update existing item
        const response = await axiosInstance.put(
          `/api/menu/item/${values._id}`,
          values
        );

        if (response.data.status === "Success") {
          message.success("Cập nhật món ăn thành công!");

          // Update the item in the state
          setMenuItems(
            menuItems.map((item) =>
              item._id === values._id ? response.data.data : item
            )
          );
        } else {
          message.error("Không thể cập nhật món ăn: " + response.data.message);
        }
      } else {
        // Create new item
        const response = await axiosInstance.post("/api/menu/item", values);

        if (response.data.status === "Success") {
          message.success("Thêm món ăn mới thành công!");

          // Add the new item to the state
          setMenuItems([...menuItems, response.data.data]);
        } else {
          message.error("Không thể thêm món ăn mới: " + response.data.message);
        }
      }

      setItemModalVisible(false);
    } catch (error) {
      console.error("Error saving menu item:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa món ăn này?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/api/menu/item/${itemId}`);

      if (response.data.status === "Success") {
        message.success("Xóa món ăn thành công!");

        // Remove the item from the state
        setMenuItems(menuItems.filter((item) => item._id !== itemId));
      } else {
        message.error("Không thể xóa món ăn: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on search term
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Menu cards render
  const renderMenuCards = () => {
    if (loading && menus.length === 0) return <Spin size="large" />;

    if (!selectedRestaurant) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">Vui lòng chọn nhà hàng để xem menu</Text>
        </div>
      );
    }

    if (menus.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">Chưa có menu nào cho nhà hàng này</Text>
          <div style={{ marginTop: "10px" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openMenuModal()}
            >
              Tạo Menu Mới
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="menu-cards-container">
        {menus.map((menu) => (
          <Card
            key={menu._id}
            hoverable
            className={
              selectedMenu && selectedMenu._id === menu._id
                ? "menu-card selected"
                : "menu-card"
            }
            onClick={() => handleSelectMenu(menu)}
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMenu(menu);
                  openMenuModal(menu);
                }}
              >
                Sửa
              </Button>,
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMenu(menu._id);
                }}
              >
                Xóa
              </Button>,
            ]}
          >
            <Meta
              avatar={
                <MenuOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              }
              title={menu.name}
              description={menu.description || "Không có mô tả"}
            />
          </Card>
        ))}
      </div>
    );
  };

  // Menu item table columns
  const menuItemColumns = [
    {
      title: "Tên món",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt={text}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          ) : (
            <AppstoreOutlined />
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
      filteredValue: searchTerm ? [searchTerm] : null,
      onFilter: () => true, // Apply filtering in filteredMenuItems
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "Không có mô tả",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Space>
          <TagOutlined />
          <Text>{category || "Không có danh mục"}</Text>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <Space>
          <DollarOutlined />
          <Text>{price?.toLocaleString()} VNĐ</Text>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => openItemModal(record)}
            type="primary"
            size="small"
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteItem(record._id)}
            type="primary"
            danger
            size="small"
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" style={{ marginTop: 24, marginBottom: 24 }}>
      <Paper
        elevation={3}
        style={{ padding: 24, borderRadius: "8px" }}
        className="menu-management"
      >
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <MuiLink
            component={Link}
            to="/admin/dashboard"
            color="inherit"
            underline="hover"
          >
            Dashboard
          </MuiLink>
          <MuiTypography color="textPrimary">Quản lý Menu</MuiTypography>
        </Breadcrumbs>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <MuiTypography variant="h4" component="h1" gutterBottom>
            Quản lý Menu Nhà Hàng
          </MuiTypography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchRestaurants}
              loading={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Restaurant Selector */}
        <div style={{ marginBottom: 20 }}>
          <Select
            placeholder="Chọn nhà hàng"
            style={{ width: "100%" }}
            value={selectedRestaurant || undefined}
            onChange={handleRestaurantChange}
            loading={loading}
            showSearch
            optionFilterProp="children"
          >
            <Option value="">-- Chọn nhà hàng --</Option>
            {restaurants.map((restaurant) => (
              <Option key={restaurant._id} value={restaurant._id}>
                <Space>
                  <ShopOutlined />
                  {restaurant.name}
                </Space>
              </Option>
            ))}
          </Select>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className="menu-tabs"
        >
          <TabPane tab="Danh sách Menu" key="1">
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 16,
              }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openMenuModal()}
                disabled={!selectedRestaurant}
              >
                Thêm Menu
              </Button>
            </div>
            {renderMenuCards()}
          </TabPane>

          <TabPane tab="Món ăn" key="2" disabled={!selectedMenu}>
            {selectedMenu && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>
                    <MenuFoldOutlined /> Menu: {selectedMenu.name}
                  </Title>
                  <Text type="secondary">
                    {selectedMenu.description || "Không có mô tả"}
                  </Text>

                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Input.Search
                      placeholder="Tìm kiếm món ăn..."
                      allowClear
                      style={{ width: 300 }}
                      onSearch={setSearchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      prefix={<SearchOutlined />}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => openItemModal()}
                    >
                      Thêm Món ăn
                    </Button>
                  </div>
                </div>

                <Table
                  columns={menuItemColumns}
                  dataSource={filteredMenuItems}
                  rowKey="_id"
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                  locale={{
                    emptyText: searchTerm
                      ? "Không tìm thấy món ăn nào phù hợp"
                      : "Chưa có món ăn nào trong menu này",
                  }}
                  bordered
                />
              </>
            )}
          </TabPane>
        </Tabs>

        {/* Menu Modal */}
        <Modal
          title={isEditMode ? "Chỉnh sửa Menu" : "Thêm Menu mới"}
          visible={menuModalVisible}
          onCancel={() => setMenuModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <Form form={menuForm} layout="vertical" onFinish={handleSaveMenu}>
            <Form.Item
              name="restaurant"
              label="Nhà hàng"
              rules={[{ required: true, message: "Vui lòng chọn nhà hàng" }]}
            >
              <Select placeholder="Chọn nhà hàng" disabled={isEditMode}>
                {restaurants.map((restaurant) => (
                  <Option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên menu"
              rules={[{ required: true, message: "Vui lòng nhập tên menu" }]}
            >
              <Input placeholder="Nhập tên menu" prefix={<MenuOutlined />} />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} placeholder="Nhập mô tả về menu" />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <Button onClick={() => setMenuModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Menu Item Modal */}
        <Modal
          title={isEditMode ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          visible={itemModalVisible}
          onCancel={() => setItemModalVisible(false)}
          footer={null}
          destroyOnClose
          width={600}
        >
          <Form form={itemForm} layout="vertical" onFinish={handleSaveItem}>
            {isEditMode && (
              <Form.Item name="_id" hidden>
                <Input />
              </Form.Item>
            )}

            <Form.Item name="menu" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên món ăn"
              rules={[{ required: true, message: "Vui lòng nhập tên món ăn" }]}
            >
              <Input
                placeholder="Nhập tên món ăn"
                prefix={<AppstoreOutlined />}
              />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={2} placeholder="Nhập mô tả về món ăn" />
            </Form.Item>

            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Form.Item
                name="category"
                label="Danh mục"
                style={{ width: "48%" }}
              >
                <Input placeholder="Nhập danh mục" prefix={<TagOutlined />} />
              </Form.Item>

              <Form.Item
                name="price"
                label="Giá"
                rules={[
                  { required: true, message: "Vui lòng nhập giá" },
                  { type: "number", min: 0, message: "Giá phải là số dương" },
                ]}
                style={{ width: "48%" }}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Nhập giá"
                  prefix={<DollarOutlined />}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Space>

            <Form.Item name="imageUrl" label="URL Hình ảnh">
              <Input placeholder="Nhập URL hình ảnh món ăn" />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <Button onClick={() => setItemModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>
      </Paper>
    </Container>
  );
};

export default AdminMenu;
