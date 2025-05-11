import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Descriptions,
  Image,
  Tag,
  Space,
  Spin,
  message,
  Tabs,
  Divider,
  Statistic,
  Rate,
  Alert,
  Modal,
  Form,
  Input,
  TimePicker,
  Select,
} from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  ArrowLeftOutlined,
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PictureOutlined,
  TeamOutlined,
  TableOutlined,
  MenuOutlined,
  UserOutlined,
  PieChartOutlined,
  CalendarOutlined,
  DollarOutlined,
  StarOutlined,
} from "@ant-design/icons";

// Material-UI components for breadcrumbs
import {
  Box,
  Typography as MuiTypography,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Container,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

// Custom axios instance
import axiosInstance from "../../contexts/AxiosCustom";

// Import CSS
import "../../style/Staff/RestaurantInfo.scss";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const RestaurantInfo = () => {
  // States
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalTables: 0,
    totalMenuItems: 0,
    averageRating: 0,
    dailyReservations: [],
    monthlyRevenue: [],
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Lấy thông tin staff từ localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");

  // Cuisine types for dropdown
  const cuisineTypes = [
    "Việt Nam",
    "Ý",
    "Nhật Bản",
    "Hàn Quốc",
    "Trung Quốc",
    "Thái Lan",
    "Pháp",
    "Hải sản",
    "Đồ nướng",
    "Buffet",
    "Fast food",
    "Chay",
    "Khác",
  ];

  // Price range options
  const priceRangeOptions = [
    { value: "low", label: "Giá rẻ" },
    { value: "medium", label: "Vừa phải" },
    { value: "high", label: "Cao cấp" },
  ];

  // Fetch restaurant data when component mounts
  useEffect(() => {
    fetchRestaurantData();
  }, []);

  // Fetch restaurant data
  const fetchRestaurantData = async () => {
    try {
      setLoading(true);

      // Fetch staff's restaurant info
      const staffResponse = await axiosInstance.get(
        `/staff/restaurant/${staff._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("Staff response:", staffResponse);

      // Check if the response has data and restaurant info
      if (
        staffResponse.data.status === "Success" &&
        staffResponse.data.data &&
        staffResponse.data.data.length > 0 &&
        staffResponse.data.data[0].restaurant
      ) {
        const restaurantId = staffResponse.data.data[0].restaurant._id;
        console.log("Restaurant ID:", restaurantId);

        // Fetch detailed restaurant data
        const restaurantResponse = await axiosInstance.get(
          `/restaurant/detail/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        console.log("Restaurant response:", restaurantResponse);

        if (restaurantResponse.data.status === "Success") {
          setRestaurant(restaurantResponse.data.data);

          // Fetch additional stats
          fetchRestaurantStats(restaurantId);
        } else {
          throw new Error("Không thể lấy thông tin nhà hàng");
        }
      } else {
        message.error("Bạn chưa được gán cho nhà hàng nào");
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      message.error("Không thể tải thông tin nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch restaurant statistics
  // Fetch restaurant statistics - Thay thế hàm mock data hiện tại
  const fetchRestaurantStats = async (restaurantId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Tạo các promises cho các API calls cần thiết
      const [
        tablesResponse,
        reservationsResponse,
        menuResponse,
        reviewStatsResponse,
      ] = await Promise.all([
        // 1. Lấy danh sách bàn để đếm tổng số
        axiosInstance.get(`/table/restaurant/${restaurantId}`, config),

        // 2. Lấy tất cả đơn đặt bàn để đếm tổng số
        axiosInstance.get(`/reservation/restaurant/${restaurantId}`, config),

        // 3. Lấy menu của nhà hàng để đếm món ăn
        axiosInstance.get(`/menu/restaurant/${restaurantId}`, config),

        // 4. Lấy thống kê đánh giá của nhà hàng
        axiosInstance.get(`/review/stats/restaurant/${restaurantId}`, config),
      ]);

      // Xử lý tổng số bàn
      const totalTables =
        tablesResponse.data.status === "Success"
          ? tablesResponse.data.data.length
          : 0;

      // Xử lý tổng số đơn đặt bàn
      const totalReservations =
        reservationsResponse.data.status === "Success"
          ? reservationsResponse.data.data.length
          : 0;

      // Xử lý tổng số món ăn
      let totalMenuItems = 0;
      if (menuResponse.data.status === "Success") {
        const menus = menuResponse.data.data || [];

        // Lấy tổng số món ăn từ tất cả các menu
        if (menus.length > 0) {
          // Lấy tổng số món ăn từ tất cả menu
          const menuItemsPromises = menus.map((menu) =>
            axiosInstance.get(`/menu/${menu._id}/items`, config)
          );

          const menuItemsResponses = await Promise.all(menuItemsPromises);

          // Tính tổng số món ăn
          totalMenuItems = menuItemsResponses.reduce((total, response) => {
            if (response.data.status === "Success") {
              return total + (response.data.data?.length || 0);
            }
            return total;
          }, 0);
        }
      }

      // Xử lý đánh giá trung bình
      const averageRating =
        reviewStatsResponse.data.status === "Success"
          ? reviewStatsResponse.data.data.averageRating || 0
          : 0;

      // Cập nhật state với dữ liệu thống kê thực tế
      setStats({
        totalReservations,
        totalTables,
        totalMenuItems,
        averageRating,
        // Bạn có thể thêm dữ liệu biểu đồ ở đây nếu có endpoints phù hợp
        dailyReservations: [],
        monthlyRevenue: [],
      });

      // Nếu muốn có dữ liệu biểu đồ, bạn cần thêm các API calls và xử lý dữ liệu phù hợp
      // Ví dụ: lấy đặt bàn theo ngày hoặc doanh thu theo tháng
    } catch (error) {
      console.error("Error fetching restaurant statistics:", error);
      message.error("Không thể tải thống kê nhà hàng");

      // Fallback với dữ liệu mặc định khi lỗi
      setStats({
        totalReservations: 0,
        totalTables: 0,
        totalMenuItems: 0,
        averageRating: 0,
        dailyReservations: [],
        monthlyRevenue: [],
      });
    }
  };

  // Handle edit form submit
  const handleEditSubmit = async (values) => {
    try {
      // Format times
      const formattedValues = {
        ...values,
        openingTime: values.openingTime.format("HH:mm"),
        closingTime: values.closingTime.format("HH:mm"),
      };

      setLoading(true);
      const response = await axiosInstance.put(
        `/api/restaurant/${restaurant._id}`,
        formattedValues
      );

      if (response.data.status === "Success") {
        message.success("Cập nhật thông tin nhà hàng thành công");
        setRestaurant(response.data.data);
        setIsEditModalVisible(false);
      } else {
        message.error("Không thể cập nhật thông tin nhà hàng");
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    form.setFieldsValue({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      cuisineType: restaurant.cuisineType,
      priceRange: restaurant.priceRange || "medium",
      description: restaurant.description,
      openingTime: restaurant.openingTime
        ? moment(restaurant.openingTime, "HH:mm")
        : moment("08:00", "HH:mm"),
      closingTime: restaurant.closingTime
        ? moment(restaurant.closingTime, "HH:mm")
        : moment("22:00", "HH:mm"),
      imageUrl: restaurant.imageUrl,
    });

    setIsEditModalVisible(true);
  };

  // Price range tag mapping
  const getPriceRangeTag = (priceRange) => {
    switch (priceRange) {
      case "low":
        return <Tag color="success">Giá rẻ</Tag>;
      case "high":
        return <Tag color="warning">Cao cấp</Tag>;
      default:
        return <Tag color="processing">Vừa phải</Tag>;
    }
  };

  if (loading && !restaurant) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải thông tin nhà hàng..." />
      </div>
    );
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: 24, marginBottom: 24 }}>
      <Paper
        elevation={3}
        style={{ padding: 24, borderRadius: "8px" }}
        className="restaurant-info"
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
          <MuiTypography color="textPrimary">Thông tin nhà hàng</MuiTypography>
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
            Thông tin nhà hàng
          </MuiTypography>
          <Box sx={{ display: "flex", gap: 2 }}>
          </Box>
        </Box>

        {/* Restaurant not found */}
        {!restaurant && !loading && (
          <Alert
            message="Không tìm thấy thông tin nhà hàng"
            description="Bạn chưa được gán vào bất kỳ nhà hàng nào. Vui lòng liên hệ quản trị viên để được hỗ trợ."
            type="warning"
            showIcon
          />
        )}

        {/* Restaurant info */}
        {restaurant && (
          <>
            {/* Restaurant header */}
            <Card className="restaurant-header-card">
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} md={8}>
                  {restaurant.imageUrl ? (
                    <Image
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="restaurant-image"
                      fallback="data:image/png;base64,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"
                    />
                  ) : (
                    <div className="restaurant-image-placeholder">
                      <PictureOutlined style={{ fontSize: 64 }} />
                      <Text>No Image</Text>
                    </div>
                  )}
                </Col>
                <Col xs={24} md={16}>
                  <div className="restaurant-header-info">
                    <Title level={2}>{restaurant.name}</Title>
                    <Space size={[0, 8]} wrap>
                      <Tag icon={<ShopOutlined />} color="blue">
                        {restaurant.cuisineType || "Chưa phân loại"}
                      </Tag>
                      {getPriceRangeTag(restaurant.priceRange)}
                      {stats.averageRating > 0 && (
                        <Tag icon={<StarOutlined />} color="gold">
                          {stats.averageRating.toFixed(1)}/5
                        </Tag>
                      )}
                    </Space>

                    <Divider style={{ margin: "16px 0" }} />

                    <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                      <Descriptions.Item
                        label={
                          <>
                            <EnvironmentOutlined /> Địa chỉ
                          </>
                        }
                      >
                        {restaurant.address}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <>
                            <PhoneOutlined /> Liên hệ
                          </>
                        }
                      >
                        {restaurant.phone || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <>
                            <ClockCircleOutlined /> Giờ hoạt động
                          </>
                        }
                      >
                        {restaurant.openingTime || "08:00"} -{" "}
                        {restaurant.closingTime || "22:00"}
                      </Descriptions.Item>
                    </Descriptions>

                    <Space style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={openEditModal}
                      >
                        Cập nhật thông tin
                      </Button>
                      <Button
                        type="default"
                        icon={<TableOutlined />}
                        onClick={() => (window.location.href = "/staff/tables")}
                      >
                        Quản lý bàn
                      </Button>
                      <Button
                        type="default"
                        icon={<MenuOutlined />}
                        onClick={() => (window.location.href = "/staff/menu")}
                      >
                        Quản lý menu
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Restaurant stats */}
            <Row
              gutter={[16, 16]}
              className="restaurant-stats"
              style={{ marginTop: 24 }}
            >
              <Col xs={24} sm={12} md={6}>
                <Card className="stat-card reservations">
                  <Statistic
                    title="Tổng đơn đặt bàn"
                    value={stats.totalReservations}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                  <Button type="link" size="small" href="/staff/reservations">
                    Xem chi tiết
                  </Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="stat-card tables">
                  <Statistic
                    title="Tổng số bàn"
                    value={stats.totalTables}
                    prefix={<TableOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                  <Button type="link" size="small" href="/staff/tables">
                    Xem chi tiết
                  </Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="stat-card menu-items">
                  <Statistic
                    title="Tổng món ăn"
                    value={stats.totalMenuItems}
                    prefix={<MenuOutlined />}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                  <Button type="link" size="small" href="/staff/menu">
                    Xem chi tiết
                  </Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="stat-card rating">
                  <Statistic
                    title="Đánh giá trung bình"
                    value={stats.averageRating}
                    precision={1}
                    prefix={<StarOutlined />}
                    suffix="/ 5"
                    valueStyle={{ color: "#faad14" }}
                  />
                  <Rate
                    disabled
                    defaultValue={stats.averageRating}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Restaurant details tabs */}
            <Card style={{ marginTop: 24 }}>
              <Tabs defaultActiveKey="1" className="restaurant-detail-tabs">
                <TabPane tab="Thông tin chi tiết" key="1">
                  <div className="restaurant-description">
                    <Title level={4}>Mô tả</Title>
                    <Paragraph>
                      {restaurant.description || "Không có thông tin mô tả."}
                    </Paragraph>
                  </div>

                  <Divider />

                  <div className="restaurant-details">
                    <Title level={4}>Thông tin chi tiết</Title>
                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
                      <Descriptions.Item label="Tên nhà hàng">
                        {restaurant.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại ẩm thực">
                        {restaurant.cuisineType}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ">
                        {restaurant.address}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {restaurant.phone || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giờ mở cửa">
                        {restaurant.openingTime || "08:00"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giờ đóng cửa">
                        {restaurant.closingTime || "22:00"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Mức giá">
                        {getPriceRangeTag(restaurant.priceRange)}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </TabPane>
                <TabPane tab="Quản lý" key="2">
                  <Title level={4}>Quản lý nhà hàng</Title>
                  <Paragraph>
                    Từ đây, bạn có thể truy cập nhanh đến các tính năng quản lý
                    nhà hàng khác nhau:
                  </Paragraph>

                  <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                    <Col xs={24} sm={12} md={8}>
                      <Card
                        hoverable
                        className="management-card"
                        onClick={() => (window.location.href = "/staff/tables")}
                      >
                        <TableOutlined className="card-icon" />
                        <Title level={4}>Quản lý bàn</Title>
                        <Text>
                          Thêm, sửa, xóa bàn và theo dõi trạng thái bàn
                        </Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card
                        hoverable
                        className="management-card"
                        onClick={() => (window.location.href = "/staff/menu")}
                      >
                        <MenuOutlined className="card-icon" />
                        <Title level={4}>Quản lý menu</Title>
                        <Text>
                          Thêm, sửa, xóa món ăn và danh mục trong menu
                        </Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card
                        hoverable
                        className="management-card"
                        onClick={() =>
                          (window.location.href = "/staff/reservations")
                        }
                      >
                        <CalendarOutlined className="card-icon" />
                        <Title level={4}>Quản lý đặt bàn</Title>
                        <Text>Xác nhận, hủy và theo dõi đơn đặt bàn</Text>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </Card>
          </>
        )}

        {/* Edit Modal */}
        <Modal
          title="Cập nhật thông tin nhà hàng"
          visible={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          destroyOnClose
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
            <Form.Item
              name="name"
              label="Tên nhà hàng"
              rules={[
                { required: true, message: "Vui lòng nhập tên nhà hàng" },
              ]}
            >
              <Input
                prefix={<ShopOutlined />}
                placeholder="Nhập tên nhà hàng"
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input
                prefix={<EnvironmentOutlined />}
                placeholder="Nhập địa chỉ nhà hàng"
              />
            </Form.Item>

            <Space
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Form.Item
                name="cuisineType"
                label="Loại ẩm thực"
                rules={[
                  { required: true, message: "Vui lòng chọn loại ẩm thực" },
                ]}
                style={{ width: "100%" }}
              >
                <Select placeholder="Chọn loại ẩm thực">
                  {cuisineTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="priceRange"
                label="Mức giá"
                rules={[{ required: true, message: "Vui lòng chọn mức giá" }]}
                style={{ width: "100%" }}
              >
                <Select placeholder="Chọn mức giá">
                  {priceRangeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            <Space
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Form.Item
                name="openingTime"
                label="Giờ mở cửa"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ mở cửa" },
                ]}
                style={{ width: "100%" }}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="closingTime"
                label="Giờ đóng cửa"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ đóng cửa" },
                ]}
                style={{ width: "100%" }}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Space>

            <Form.Item name="phone" label="Số điện thoại">
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại nhà hàng"
              />
            </Form.Item>

            <Form.Item name="imageUrl" label="URL hình ảnh">
              <Input
                prefix={<PictureOutlined />}
                placeholder="Nhập URL hình ảnh nhà hàng"
              />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} placeholder="Nhập mô tả về nhà hàng" />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </div>
          </Form>
        </Modal>
      </Paper>
    </Container>
  );
};

export default RestaurantInfo;
