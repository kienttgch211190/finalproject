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
  const token = localStorage.getItem("accessToken");

  // Cấu hình request với token
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

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
        `/staff/restaurant/${staff._id}`,
        config
      );

      console.log("Staff restaurant response:", response.data);

      // Kiểm tra dữ liệu nhận được
      if (response.data.status === "Success") {
        // Kiểm tra cả hai trường hợp có thể xảy ra
        if (response.data.data && response.data.data.restaurant) {
          // Trường hợp 1: data.restaurant (như trong code cũ)
          setRestaurant(response.data.data.restaurant);
        } else if (
          response.data.data &&
          response.data.data[0] &&
          response.data.data[0].restaurant
        ) {
          // Trường hợp 2: data[0].restaurant (như trong console log)
          setRestaurant(response.data.data[0].restaurant);
        } else {
          message.error("Bạn chưa được gán cho nhà hàng nào");
        }
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
      // Sửa URL để khớp với router backend
      const response = await axiosInstance.get(
        `/menu/restaurant/${restaurantId}`,
        config
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
      // Sửa URL để khớp với router backend
      const response = await axiosInstance.get(`/menu/${menuId}/items`, config);

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
    setSearchTerm(""); // Reset search term
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

      // Staff không có quyền chỉnh sửa menu item theo RouterConfig
      message.warning(
        "Chức năng này chỉ dành cho Admin. Staff chỉ có thể xem menu."
      );
      setItemModalVisible(false);
      return;

      // Đoạn code dưới đây sẽ không được thực thi vì staff không có quyền
      if (isEditMode) {
        // Update existing item
        const response = await axiosInstance.put(
          `/menu/item/${values._id}`,
          values,
          config
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
        const response = await axiosInstance.post("/menu/item", values, config);

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
    // Staff không có quyền xóa menu item theo RouterConfig
    message.warning(
      "Chức năng này chỉ dành cho Admin. Staff chỉ có thể xem menu."
    );
    return;
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
      title: "Trạng thái",
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (isAvailable) => (
        <Tag color={isAvailable !== false ? "success" : "error"}>
          {isAvailable !== false ? "Có sẵn" : "Không có sẵn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => openPreviewModal(record)}
            type="default"
            size="small"
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() =>
              message.info(
                "Staff không được phép chỉnh sửa menu. Vui lòng liên hệ Admin."
              )
            }
            type="primary"
            size="small"
            disabled
          >
            Sửa
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
                      onClick={() =>
                        message.info(
                          "Staff không được phép thêm món ăn mới. Vui lòng liên hệ Admin."
                        )
                      }
                      disabled
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

                <div className="preview-status">
                  <Tag
                    color={
                      previewItem.isAvailable !== false ? "success" : "error"
                    }
                  >
                    {previewItem.isAvailable !== false
                      ? "Có sẵn"
                      : "Không có sẵn"}
                  </Tag>
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
                      type="default"
                      onClick={() => setPreviewVisible(false)}
                    >
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
