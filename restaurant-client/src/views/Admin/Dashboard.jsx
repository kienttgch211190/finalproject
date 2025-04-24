import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Card,
  Typography,
  Space,
  Table,
  Button,
  Input,
  Row,
  Col,
  Statistic,
  Divider,
  Tag,
  Avatar,
  Spin,
  List,
  Tooltip,
  message,
} from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  ShopOutlined,
  BookOutlined,
  GiftOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CalendarOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  RiseOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../contexts/AxiosCustom";
import moment from "moment";

// Import SCSS
import "../../style/Admin/Dashboard.scss";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userCount: 0,
    restaurantCount: 0,
    reservationCount: 0,
    recentReservations: [],
    topRestaurants: [],
  });

  // Get admin info from localStorage
  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
    message.success("Đăng xuất thành công!");
  };

  // Get status tag for a reservation
  const getReservationStatusTag = (status) => {
    switch (status) {
      case "pending":
        return <Tag color="warning">Chờ xác nhận</Tag>;
      case "confirmed":
        return <Tag color="processing">Đã xác nhận</Tag>;
      case "cancelled":
        return <Tag color="error">Đã hủy</Tag>;
      case "completed":
        return <Tag color="success">Hoàn thành</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data
      const [
        usersResponse,
        restaurantsResponse,
        reservationsResponse,
        recentReservationsResponse,
        topRestaurantsResponse,
      ] = await Promise.all([
        axios.get("/api/user/count"),
        axios.get("/api/restaurant/count"),
        axios.get("/api/reservation/count"),
        axios.get("/api/reservation/recent"),
        axios.get("/api/restaurant/top"),
      ]).catch((error) => {
        console.error("Error in Promise.all:", error);
        // Fall back to mock data if API endpoints are not ready
        return [
          { data: { count: 120 } },
          { data: { count: 25 } },
          { data: { count: 350 } },
          {
            data: {
              data: [
                {
                  _id: "1",
                  customer: { name: "Nguyễn Văn A" },
                  restaurant: { name: "Nhà hàng ABC" },
                  dateTime: new Date().toISOString(),
                  numberOfGuests: 4,
                  status: "confirmed",
                },
                {
                  _id: "2",
                  customer: { name: "Trần Thị B" },
                  restaurant: { name: "Nhà hàng XYZ" },
                  dateTime: new Date().toISOString(),
                  numberOfGuests: 2,
                  status: "pending",
                },
                {
                  _id: "3",
                  customer: { name: "Lê Văn C" },
                  restaurant: { name: "Nhà hàng 123" },
                  dateTime: new Date().toISOString(),
                  numberOfGuests: 6,
                  status: "confirmed",
                },
              ],
            },
          },
          {
            data: {
              data: [
                {
                  _id: "101",
                  name: "Nhà hàng ABC",
                  reservationCount: 150,
                  averageRating: 4.8,
                },
                {
                  _id: "102",
                  name: "Nhà hàng XYZ",
                  reservationCount: 120,
                  averageRating: 4.6,
                },
                {
                  _id: "103",
                  name: "Nhà hàng 123",
                  reservationCount: 100,
                  averageRating: 4.5,
                },
              ],
            },
          },
        ];
      });

      setDashboardData({
        userCount: usersResponse.data.count || 0,
        restaurantCount: restaurantsResponse.data.count || 0,
        reservationCount: reservationsResponse.data.count || 0,
        recentReservations: recentReservationsResponse.data.data || [],
        topRestaurants: topRestaurantsResponse.data.data || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error(
        "Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau."
      );

      // Set mock data if API fails
      setDashboardData({
        userCount: 120,
        restaurantCount: 25,
        reservationCount: 350,
        recentReservations: [
          {
            _id: "1",
            customer: { name: "Nguyễn Văn A" },
            restaurant: { name: "Nhà hàng ABC" },
            dateTime: new Date().toISOString(),
            numberOfGuests: 4,
            status: "confirmed",
          },
          {
            _id: "2",
            customer: { name: "Trần Thị B" },
            restaurant: { name: "Nhà hàng XYZ" },
            dateTime: new Date().toISOString(),
            numberOfGuests: 2,
            status: "pending",
          },
        ],
        topRestaurants: [
          {
            _id: "101",
            name: "Nhà hàng ABC",
            reservationCount: 150,
            averageRating: 4.8,
          },
          {
            _id: "102",
            name: "Nhà hàng XYZ",
            reservationCount: 120,
            averageRating: 4.6,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <Layout className="admin-dashboard">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sider"
        width={250}
        breakpoint="lg"
        collapsedWidth={80}
      >
        <div className="logo">
          {collapsed ? <ShopOutlined /> : <span>Restaurant Admin</span>}
        </div>

        {/* Admin Profile */}
        <div className="admin-profile">
          <Avatar size={collapsed ? 40 : 64} icon={<UserOutlined />} />
          {!collapsed && (
            <div className="admin-info">
              <Text strong>{admin.name || "Admin"}</Text>
              <Text type="secondary">{admin.email || "admin@example.com"}</Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: <Link to="/admin/dashboard">Bảng điều khiển</Link>,
            },
            {
              key: "users",
              icon: <TeamOutlined />,
              label: <Link to="/admin/users">Quản lý người dùng</Link>,
            },
            {
              key: "restaurants",
              icon: <ShopOutlined />,
              label: <Link to="/admin/restaurants">Quản lý nhà hàng</Link>,
            },
            {
              key: "menus",
              icon: <BookOutlined />,
              label: <Link to="/admin/menus">Quản lý thực đơn</Link>,
            },
            {
              key: "reservations",
              icon: <CalendarOutlined />,
              label: <Link to="/admin/reservations">Quản lý đặt bàn</Link>,
            },
            {
              key: "promotions",
              icon: <GiftOutlined />,
              label: <Link to="/admin/promotions">Quản lý khuyến mãi</Link>,
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Đăng xuất",
              onClick: handleLogout,
            },
          ]}
        />
      </Sider>

      {/* Main Content */}
      <Layout>
        {/* Header */}
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger-button"
          />
          <div className="header-title">
            <Title level={4} style={{ margin: 0 }}>
              Bảng Điều Khiển Admin
            </Title>
          </div>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
              loading={loading}
            >
              Làm mới dữ liệu
            </Button>
          </div>
        </Header>

        {/* Dashboard Content */}
        <Content className="admin-content">
          {/* Stats Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className="stat-card users">
                <Statistic
                  title="Tổng người dùng"
                  value={dashboardData.userCount}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
                <Button type="link" size="small" href="/admin/users">
                  Xem chi tiết
                </Button>
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card restaurants">
                <Statistic
                  title="Tổng nhà hàng"
                  value={dashboardData.restaurantCount}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
                <Button type="link" size="small" href="/admin/restaurants">
                  Xem chi tiết
                </Button>
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card reservations">
                <Statistic
                  title="Tổng đặt bàn"
                  value={dashboardData.reservationCount}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: "#fa8c16" }}
                />
                <Button type="link" size="small" href="/admin/reservations">
                  Xem chi tiết
                </Button>
              </Card>
            </Col>
          </Row>

          {/* Recent Reservations & Top Restaurants */}
          <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>Đặt bàn gần đây</span>
                  </Space>
                }
                extra={
                  <Button type="link" href="/admin/reservations">
                    Xem tất cả
                  </Button>
                }
                className="dashboard-card"
              >
                <List
                  dataSource={dashboardData.recentReservations}
                  renderItem={(reservation) => (
                    <List.Item
                      key={reservation._id}
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          href={`/admin/reservations/${reservation._id}`}
                          icon={<EyeOutlined />}
                        >
                          Chi tiết
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <span>
                              {reservation.customer?.name || "Khách hàng"} -
                              {reservation.restaurant?.name || "Nhà hàng"}
                            </span>
                            {getReservationStatusTag(
                              reservation.status || "pending"
                            )}
                          </Space>
                        }
                        description={`${moment(reservation.dateTime).format(
                          "DD/MM/YYYY HH:mm"
                        )} - ${reservation.numberOfGuests} khách`}
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: "Không có đặt bàn gần đây" }}
                />
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <RiseOutlined />
                    <span>Nhà hàng nổi bật</span>
                  </Space>
                }
                extra={
                  <Button type="link" href="/admin/restaurants">
                    Xem tất cả
                  </Button>
                }
                className="dashboard-card"
              >
                <List
                  dataSource={dashboardData.topRestaurants}
                  renderItem={(restaurant) => (
                    <List.Item
                      key={restaurant._id}
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          href={`/admin/restaurants/${restaurant._id}`}
                          icon={<EyeOutlined />}
                        >
                          Chi tiết
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={restaurant.name}
                        description={
                          <Space>
                            <Tag icon={<CalendarOutlined />} color="blue">
                              {restaurant.reservationCount || 0} đặt bàn
                            </Tag>
                            <Tag icon={<StarOutlined />} color="gold">
                              {restaurant.averageRating || "N/A"}/5
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: "Không có dữ liệu nhà hàng" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Card
            title={
              <Space>
                <PlusOutlined />
                <span>Thao tác nhanh</span>
              </Space>
            }
            className="dashboard-card"
            style={{ marginTop: "20px" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<TeamOutlined />}
                  href="/admin/users/new"
                  block
                  size="large"
                >
                  Thêm người dùng mới
                </Button>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<ShopOutlined />}
                  href="/admin/restaurants/new"
                  block
                  size="large"
                >
                  Thêm nhà hàng mới
                </Button>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<GiftOutlined />}
                  href="/admin/promotions/new"
                  block
                  size="large"
                >
                  Tạo khuyến mãi mới
                </Button>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<BookOutlined />}
                  href="/admin/reports"
                  block
                  size="large"
                >
                  Xem báo cáo
                </Button>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
