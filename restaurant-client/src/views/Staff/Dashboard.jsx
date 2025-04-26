import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Card,
  Typography,
  Space,
  Button,
  Row,
  Col,
  Spin,
  List,
  Avatar,
  Tag,
  Divider,
  Badge,
  Statistic,
  Calendar,
  Tooltip,
  message,
} from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  CalendarOutlined,
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TableOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../contexts/AxiosCustom";
import moment from "moment";

// Import CSS
import "../../style/Staff/Dashboard.scss";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    restaurant: null,
    todayReservations: [],
    pendingReservations: [],
    activePromotions: [],
  });

  console.log("Dashboard data:", dashboardData.todayReservations);

  // Get staff info from localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const token = localStorage.getItem("accessToken");
      
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, 
    },  
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
  
      // Fetch staff's restaurant info
      const staffResponse = await axios.get(
        `/staff/restaurant/${staff._id}`,
        config
      );
      const restaurantId = staffResponse.data?.data?.[0]?.restaurant?._id;
  
      if (!restaurantId) {
        throw new Error("Bạn chưa được gán cho nhà hàng nào");
      }
         
      // Fetch restaurant data
      const [
        restaurantResponse,
        todayReservationsResponse,
        pendingReservationsResponse,
        activePromotionsResponse,
      ] = await Promise.all([
        axios.get(`/restaurant/detail/${restaurantId}`, config),
        axios.get(`/reservation/restaurant/${restaurantId}/today`, config).catch(() => ({ data: { status: "Success", data: [] } })),
        axios.get(`/reservation/restaurant/${restaurantId}/pending`, config).catch(() => ({ data: { status: "Success", data: [] } })),
        axios.get(`/promotion/restaurant/${restaurantId}/active`, config).catch(() => ({ data: { status: "Success", data: [] } })),
      ]);
  
      // Use the actual response data without any mock fallbacks
      setDashboardData({
        restaurant: restaurantResponse.data.data,
        todayReservations: todayReservationsResponse.data.data || [],
        pendingReservations: pendingReservationsResponse.data.data || [],
        activePromotions: activePromotionsResponse.data.data || [],
      });
  
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error(
        error.message || "Không thể tải dữ liệu. Vui lòng thử lại sau."
      );
      
      // Don't set mock data, just initialize with empty values
      setDashboardData({
        restaurant: null,
        todayReservations: [],
        pendingReservations: [],
        activePromotions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
    message.success("Đăng xuất thành công!");
  };

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

  const handleConfirmReservation = (reservationId) => {
    message.info("Chức năng này đang được phát triển");
  };

  const handleCancelReservation = (reservationId) => {
    message.info("Chức năng này đang được phát triển");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <Layout className="staff-dashboard">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="staff-sider"
        width={250}
        breakpoint="lg"
        collapsedWidth={80}
      >
        <div className="logo">
          {collapsed ? <ShopOutlined /> : <span>Staff Portal</span>}
        </div>

        {/* Staff Profile */}
        <div className="staff-profile">
          <Avatar size={collapsed ? 40 : 64} icon={<UserOutlined />} />
          {!collapsed && (
            <div className="staff-info">
              <Text strong>{staff.name || "Staff"}</Text>
              <Text type="secondary">{staff.email || "staff@example.com"}</Text>
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
              label: <Link to="/staff/dashboard">Tổng quan</Link>,
            },
            {
              key: "restaurant",
              icon: <ShopOutlined />,
              label: <Link to="/staff/restaurant">Nhà hàng</Link>,
            },
            {
              key: "reservations",
              icon: <CalendarOutlined />,
              label: <Link to="/staff/reservations">Đơn đặt bàn</Link>,
            },
            {
              key: "tables",
              icon: <TableOutlined />,
              label: <Link to="/staff/tables">Quản lý bàn</Link>,
            },
            {
              key: "menu",
              icon: <MenuOutlined />,
              label: <Link to="/staff/menu">Thực đơn</Link>,
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
        <Header className="staff-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger-button"
          />
          <div className="header-title">
            <Title level={4} style={{ margin: 0 }}>
              {dashboardData.restaurant?.name || "Dashboard Nhân Viên"}
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
        <Content className="staff-content">
          {/* Restaurant Info Card */}
          <Card
            className="restaurant-info-card"
            title={
              <Space>
                <ShopOutlined />
                <span>Thông tin nhà hàng</span>
              </Space>
            }
          >
            <Row gutter={[16, 24]}>
              <Col xs={24} md={12}>
                <Space align="start">
                  <EnvironmentOutlined
                    style={{ fontSize: "18px", color: "#1890ff" }}
                  />
                  <div>
                    <Text type="secondary">Địa chỉ:</Text>
                    <div>
                      {dashboardData.restaurant?.address || "Chưa cập nhật"}
                    </div>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space align="start">
                  <UserOutlined
                    style={{ fontSize: "18px", color: "#1890ff" }}
                  />
                  <div>
                    <Text type="secondary">Tên nhà hàng:</Text>
                    <div>
                      {dashboardData.restaurant?.name || "Chưa cập nhật"}
                    </div>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space align="start">
                  <ClockCircleOutlined
                    style={{ fontSize: "18px", color: "#1890ff" }}
                  />
                  <div>
                    <Text type="secondary">Giờ hoạt động:</Text>
                    <div>
                      {dashboardData.restaurant?.openingTime || "08:00"} -
                      {dashboardData.restaurant?.closingTime || "22:00"}
                    </div>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space align="start">
                  <InfoCircleOutlined
                    style={{ fontSize: "18px", color: "#1890ff" }}
                  />
                  <div>
                    <Text type="secondary">Loại ẩm thực:</Text>
                    <div>
                      {dashboardData.restaurant?.cuisineType || "Đa dạng"}
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={8}>
              <Card className="stat-card reservations">
                <Statistic
                  title="Đặt bàn hôm nay"
                  value={dashboardData.todayReservations.length}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
                <Button type="link" size="small" href="/staff/reservations">
                  Xem chi tiết
                </Button>
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card pending">
                <Statistic
                  title="Chờ xác nhận"
                  value={dashboardData.pendingReservations.length}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
                <Button
                  type="link"
                  size="small"
                  href="/staff/reservations/pending"
                >
                  Xem chi tiết
                </Button>
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card promotions">
                <Statistic
                  title="Khuyến mãi hiện có"
                  value={dashboardData.activePromotions.length}
                  prefix={<PercentageOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
                <Button type="link" size="small" href="/staff/promotions">
                  Xem chi tiết
                </Button>
              </Card>
            </Col>
          </Row>

          {/* Reservation Lists */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>Đặt bàn hôm nay</span>
                  </Space>
                }
                extra={
                  <Button type="link" href="/staff/reservations">
                    Xem tất cả
                  </Button>
                }
                className="dashboard-card"
              >
                <List
                  dataSource={dashboardData.todayReservations}
                  renderItem={(reservation) => (
                    <List.Item
                      key={reservation._id}
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          href={`/staff/reservation/${reservation._id}`}
                          icon={<EyeOutlined />}
                        >
                          Chi tiết
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <span>
                              {reservation.user?.name || "Khách hàng"}
                            </span>
                            {getReservationStatusTag(
                              reservation.status || "pending"
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text>
                              {moment(reservation.reservationDate).format(
                                "DD/MM/YYYY"
                              )} - {reservation.reservationTime}
                            </Text>
                            <Text>
                              {reservation.numGuests || 2} khách - Bàn{" "}
                              {reservation.table?.tableNumber || "Chưa xác định"}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: "Không có đặt bàn nào hôm nay" }}
                />
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined />
                    <span>Đang chờ xác nhận</span>
                  </Space>
                }
                extra={
                  <Button type="link" href="/staff/reservations/pending">
                    Xem tất cả
                  </Button>
                }
                className="dashboard-card pending-card"
              >
                <List
                  dataSource={dashboardData.pendingReservations}
                  renderItem={(reservation) => (
                    <List.Item
                      key={reservation._id}
                      actions={[
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          onClick={() =>
                            handleConfirmReservation(reservation._id)
                          }
                        >
                          Xác nhận
                        </Button>,
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<CloseCircleOutlined />}
                          onClick={() =>
                            handleCancelReservation(reservation._id)
                          }
                        >
                          Từ chối
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <span>
                            {reservation.customer?.name || "Khách hàng"}
                          </span>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text>
                              {moment(reservation.reservationDate).format(
                                "DD/MM/YYYY"
                              )} - {(reservation.reservationTime)}
                            </Text>
                            <Text>{reservation?.[0]?.numGuests} khách</Text>
                            </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{
                    emptyText: "Không có đặt bàn nào đang chờ xác nhận",
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Promotions */}
          <Card
            title={
              <Space>
                <PercentageOutlined />
                <span>Khuyến mãi hiện có</span>
              </Space>
            }
            extra={
              <Button type="link" href="/staff/promotions">
                Xem tất cả
              </Button>
            }
            className="dashboard-card"
            style={{ marginTop: 16 }}
          >
            {dashboardData.activePromotions.length > 0 ? (
              <Row gutter={[16, 16]}>
                {dashboardData.activePromotions.map((promotion) => (
                  <Col xs={24} sm={12} md={8} key={promotion._id}>
                    <Card className="promotion-card">
                      <div className="promotion-discount">
                        {promotion.type === "percentage"
                          ? `${promotion.value}%`
                          : `${promotion.value.toLocaleString()}đ`}
                      </div>
                      <div className="promotion-content">
                        <Title level={5}>{promotion.name}</Title>
                        <Text type="secondary">
                          {promotion.description || "Không có mô tả"}
                        </Text>
                        <div className="promotion-date">
                          <CalendarOutlined /> Hết hạn:{" "}
                          {moment(promotion.endDate).format("DD/MM/YYYY")}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="empty-promotions">
                <Text type="secondary">
                  Không có khuyến mãi nào đang được áp dụng
                </Text>
              </div>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffDashboard;
