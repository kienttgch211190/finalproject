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
  Tag,
  Image,
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
  MenuOutlined,
  DollarOutlined,
  AppstoreOutlined,
  TagOutlined,
  EyeOutlined,
  FilterOutlined,
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
import "../../style/Staff/StaffMenu.scss";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Meta } = Card;
const { Title, Text } = Typography;

const StaffMenu = () => {
  // States
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Form states
  const [itemForm] = Form.useForm();

  // Dialogs
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Lấy thông tin staff từ localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");

  // Khi component mount, lấy thông tin nhà hàng của staff
  useEffect(() => {
    fetchStaffRestaurant();
  }, []);

  // Khi có restaurant, lấy tất cả menu của restaurant đó
  useEffect(() => {
    if (restaurant) {
      fetchRestaurantMenus(restaurant._id);
    }
  }, [restaurant]);

  // Khi menu được chọn, lấy danh sách món ăn trong menu đó
  useEffect(() => {
    if (selectedMenu) {
      fetchMenuItems(selectedMenu._id);
    } else {
      setMenuItems([]);
    }
  }, [selectedMenu]);

  // Fetch thông tin nhà hàng của staff
  const fetchStaffRestaurant = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/staff/restaurant/${staff._id}`
      );

      if (
        response.data.status === "Success" &&
        response.data.data?.restaurant
      ) {
        setRestaurant(response.data.data.restaurant);
      } else {
        message.error("Bạn chưa được gán cho nhà hàng nào");
      }
    } catch (error) {
      console.error("Error fetching staff restaurant:", error);
      message.error("Không thể lấy thông tin nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu của nhà hàng
  const fetchRestaurantMenus = async (restaurantId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/menu/restaurant/${restaurantId}`
      );

      if (response.data.status === "Success") {
        const menuData = response.data.data || [];
        setMenus(menuData);

        // Nếu có menu, tự động chọn menu đầu tiên
        if (menuData.length > 0 && !selectedMenu) {
          setSelectedMenu(menuData[0]);
        }
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

  // Fetch món ăn trong menu
  const fetchMenuItems = async (menuId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/menu/${menuId}/items`);

      if (response.data.status === "Success") {
        const items = response.data.data || [];
        setMenuItems(items);

        // Trích xuất danh sách danh mục
        const categories = [
          ...new Set(
            items.filter((item) => item.category).map((item) => item.category)
          ),
        ];
        setAvailableCategories(categories);
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

  // Menu selection handler
  const handleSelectMenu = (menu) => {
    setSelectedMenu(menu);
    setActiveTab("2"); // Switch to menu items tab when selecting a menu
    setCategoryFilter(""); // Reset category filter
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

  // Open preview modal
  const openPreviewModal = (item) => {
    setPreviewItem(item);
    setPreviewVisible(true);
  };

  // Handle item form submit
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

          // Update categories
          const updatedItems = menuItems.map((item) =>
            item._id === values._id ? response.data.data : item
          );
          const categories = [
            ...new Set(
              updatedItems
                .filter((item) => item.category)
                .map((item) => item.category)
            ),
          ];
          setAvailableCategories(categories);
        } else {
          message.error("Không thể cập nhật món ăn: " + response.data.message);
        }
      } else {
        // Create new item
        const response = await axiosInstance.post("/api/menu/item", values);

        if (response.data.status === "Success") {
          message.success("Thêm món ăn mới thành công!");

          // Add the new item to the state
          const newItem = response.data.data;
          setMenuItems([...menuItems, newItem]);

          // Update categories if there's a new category
          if (
            newItem.category &&
            !availableCategories.includes(newItem.category)
          ) {
            setAvailableCategories([...availableCategories, newItem.category]);
          }
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

  // Handle delete item
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
        const updatedItems = menuItems.filter((item) => item._id !== itemId);
        setMenuItems(updatedItems);

        // Update categories
        const categories = [
          ...new Set(
            updatedItems
              .filter((item) => item.category)
              .map((item) => item.category)
          ),
        ];
        setAvailableCategories(categories);
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

  // Filter menu items based on search term and category filter
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Menu cards render
  const renderMenuCards = () => {
    if (loading && menus.length === 0) return <Spin size="large" />;

    if (!restaurant) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">Bạn chưa được gán cho nhà hàng nào</Text>
        </div>
      );
    }

    if (menus.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">Chưa có menu nào cho nhà hàng này</Text>
          <div style={{ marginTop: "10px" }}>
            <Button type="primary" disabled icon={<PlusOutlined />}>
              Tạo Menu Mới (Liên hệ Admin)
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
                cursor: "pointer",
              }}
              onClick={() => openPreviewModal(record)}
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
      ellipsis: true,
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
      filters: availableCategories.map((cat) => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
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
        className="staff-menu-management"
      >
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <MuiLink
            component={Link}
            to="/staff/dashboard"
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
            Quản lý Menu - {restaurant?.name || "Đang tải..."}
          </MuiTypography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => restaurant && fetchRestaurantMenus(restaurant._id)}
              loading={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className="menu-tabs"
        >
          <TabPane tab="Danh sách Menu" key="1">
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
                    <Space>
                      <Input.Search
                        placeholder="Tìm kiếm món ăn..."
                        allowClear
                        style={{ width: 300 }}
                        onSearch={setSearchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<SearchOutlined />}
                      />

                      {availableCategories.length > 0 && (
                        <Select
                          placeholder="Lọc theo danh mục"
                          style={{ width: 180 }}
                          value={categoryFilter}
                          onChange={setCategoryFilter}
                          allowClear
                          onClear={() => setCategoryFilter("")}
                        >
                          <Option value="">Tất cả danh mục</Option>
                          {availableCategories.map((category) => (
                            <Option key={category} value={category}>
                              {category}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Space>

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
                    emptyText:
                      searchTerm || categoryFilter
                        ? "Không tìm thấy món ăn nào phù hợp"
                        : "Chưa có món ăn nào trong menu này",
                  }}
                  bordered
                />
              </>
            )}
          </TabPane>
        </Tabs>

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
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  showSearch
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: "4px 0" }} />
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "nowrap",
                          padding: 8,
                        }}
                      >
                        <Input
                          style={{ flex: "auto" }}
                          placeholder="Nhập danh mục mới"
                          onPressEnter={(e) => {
                            e.preventDefault();
                            const value = e.target.value.trim();
                            if (value && !availableCategories.includes(value)) {
                              setAvailableCategories([
                                ...availableCategories,
                                value,
                              ]);
                              itemForm.setFieldsValue({ category: value });
                            }
                            e.target.value = "";
                          }}
                        />
                      </div>
                    </div>
                  )}
                >
                  {availableCategories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
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

        {/* Preview Modal */}
        <Modal
          visible={previewVisible}
          title={previewItem?.name || "Xem chi tiết món ăn"}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={700}
        >
          {previewItem && (
            <div className="food-item-preview">
              {previewItem.imageUrl && (
                <div className="preview-image-container">
                  <Image
                    src={previewItem.imageUrl}
                    alt={previewItem.name}
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              )}
              <div className="preview-details">
                <Title level={4}>{previewItem.name}</Title>

                {previewItem.category && (
                  <Tag color="blue">{previewItem.category}</Tag>
                )}

                <div className="preview-price">
                  <Title level={5}>
                    Giá: {previewItem.price?.toLocaleString()} VNĐ
                  </Title>
                </div>

                {previewItem.description && (
                  <div className="preview-description">
                    <Title level={5}>Mô tả:</Title>
                    <Text>{previewItem.description}</Text>
                  </div>
                )}

                <div className="preview-actions" style={{ marginTop: 24 }}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setPreviewVisible(false);
                        openItemModal(previewItem);
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button onClick={() => setPreviewVisible(false)}>
                      Đóng
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </Paper>
    </Container>
  );
};

export default StaffMenu;
