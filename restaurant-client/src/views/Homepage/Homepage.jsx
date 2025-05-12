import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Rate,
  Tag,
  Spin,
  Divider,
  Badge,
  Empty,
  Space,
  Drawer,
  message,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  DollarOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  FilterOutlined,
  ClearOutlined,
  FireOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "../../contexts/AxiosCustom";
import moment from "moment";

// Import CSS
import "../../style/Homepage/Homepage.scss";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Search } = Input;
const { Option } = Select;

const Homepage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [promotions, setPromotions] = useState([]);
  console.log("promotions", promotions);
  const [filters, setFilters] = useState({
    cuisineType: "",
    priceRange: "",
    searchTerm: "",
  });
  const [reservationParams, setReservationParams] = useState({
    date: moment(),
    time: moment(),
    guests: 2,
  });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Get user information from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurants with optional filters
        const params = {};
        if (filters.cuisineType) params.cuisineType = filters.cuisineType;
        if (filters.priceRange) params.priceRange = filters.priceRange;

        const [restaurantsResponse, promotionsResponse] = await Promise.all([
          axios.get(`/restaurant`, { params }),
          axios.get(`/promotion/active`),
        ]);

        if (restaurantsResponse.data.status === "Success") {
          let filteredRestaurants = restaurantsResponse.data.data || [];

          // Apply search term filter
          if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredRestaurants = filteredRestaurants.filter(
              (restaurant) =>
                restaurant.name?.toLowerCase().includes(searchLower) ||
                restaurant.cuisineType?.toLowerCase().includes(searchLower) ||
                restaurant.address?.toLowerCase().includes(searchLower)
            );
          }

          setRestaurants(filteredRestaurants);
        }

        if (promotionsResponse.data.status === "Success") {
          setPromotions(promotionsResponse.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setRestaurants([]);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.cuisineType, filters.priceRange, filters.searchTerm]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
    message.success("Đăng xuất thành công!");
  };

  const handleReservationParamChange = (name, value) => {
    setReservationParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      cuisineType: "",
      priceRange: "",
      searchTerm: "",
    });
    message.success("Đã xóa tất cả bộ lọc");
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleStartReservation = (restaurantId) => {
    const { date, time, guests } = reservationParams;

    if (!date || !time) {
      message.warning("Vui lòng chọn ngày và giờ đặt bàn");
      return;
    }

    navigate(`/reservation/new`, {
      state: {
        restaurantId,
        date: date.format("YYYY-MM-DD"),
        time: time.format("HH:mm"),
        guests,
      },
    });
  };

  // Format price range for display
  const renderPriceRange = (range) => {
    switch (range) {
      case "low":
        return <DollarOutlined style={{ color: "#52c41a" }} />;
      case "medium":
        return (
          <>
            <DollarOutlined style={{ color: "#1890ff" }} />
            <DollarOutlined style={{ color: "#1890ff" }} />
          </>
        );
      case "high":
        return (
          <>
            <DollarOutlined style={{ color: "#f5222d" }} />
            <DollarOutlined style={{ color: "#f5222d" }} />
            <DollarOutlined style={{ color: "#f5222d" }} />
          </>
        );
      default:
        return <DollarOutlined style={{ color: "#1890ff" }} />;
    }
  };

  const renderPriceRangeTag = (priceRange) => {
    const priceRangeConfig = {
      low: { color: "success", text: "Giá rẻ" },
      medium: { color: "processing", text: "Giá vừa phải" },
      high: { color: "error", text: "Cao cấp" },
    };

    const config = priceRangeConfig[priceRange] || priceRangeConfig.medium;

    return (
      <Tag color={config.color} icon={<DollarOutlined />}>
        {config.text}
      </Tag>
    );
  };

  // Cuisine type options
  const cuisineTypeOptions = [
    { value: "Việt Nam", label: "Việt Nam" },
    { value: "italian", label: "Ý" },
    { value: "japanese", label: "Nhật Bản" },
    { value: "korean", label: "Hàn Quốc" },
    { value: "chinese", label: "Trung Hoa" },
    { value: "thai", label: "Thái Lan" },
    { value: "french", label: "Pháp" },
    { value: "american", label: "Mỹ" },
    { value: "seafood", label: "Hải sản" },
  ];

  // Price range options
  const priceRangeOptions = [
    { value: "low", label: "Thấp" },
    { value: "medium", label: "Trung bình" },
    { value: "high", label: "Cao" },
  ];

  // Guest count options
  const guestCountOptions = Array.from({ length: 10 }, (_, i) => i + 1).concat([
    { value: 11, label: "10+" },
  ]);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <Layout className="homepage-layout">
      {/* Header với nút đăng xuất */}
      <Header className="homepage-header">
        <div className="header-content">
          <div className="logo">
            <Title level={3} style={{ color: "white", margin: 0 }}>
              RestaurantBooking
            </Title>
          </div>
          <div className="user-actions">
            {user && user._id ? (
              <Space>
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  style={{ color: "white" }}
                  onClick={() => navigate("/user/profile")}
                >
                  {user.name || "Tài khoản"}
                </Button>
                <Button type="primary" danger onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </Space>
            ) : (
              <Space>
                <Button type="primary" ghost onClick={() => navigate("/login")}>
                  Đăng nhập
                </Button>
                <Button type="primary" onClick={() => navigate("/register")}>
                  Đăng ký
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Header>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <Title className="hero-title">
            Đặt bàn dễ dàng tại nhà hàng bạn yêu thích
          </Title>
          <Paragraph className="hero-subtitle">
            Trải nghiệm ẩm thực tuyệt vời chỉ với vài cú nhấp chuột
          </Paragraph>
          <Card className="search-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8} lg={6}>
                <Search
                  placeholder="Tìm kiếm nhà hàng..."
                  allowClear
                  value={filters.searchTerm}
                  onChange={(e) =>
                    handleFilterChange("searchTerm", e.target.value)
                  }
                />
              </Col>

              <Col xs={24} sm={12} md={4} lg={4}>
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Ngày đặt bàn"
                  format="DD/MM/YYYY"
                  value={reservationParams.date}
                  onChange={(date) =>
                    handleReservationParamChange("date", date)
                  }
                  disabledDate={(current) => {
                    // Không cho phép chọn ngày trong quá khứ
                    return current && current < moment().startOf("day");
                  }}
                />
              </Col>

              <Col xs={12} sm={6} md={4} lg={4}>
                <TimePicker
                  style={{ width: "100%" }}
                  placeholder="Giờ đặt bàn"
                  format="HH:mm"
                  value={reservationParams.time}
                  onChange={(time) =>
                    handleReservationParamChange("time", time)
                  }
                />
              </Col>

              <Col xs={12} sm={6} md={4} lg={4}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Số khách"
                  value={reservationParams.guests}
                  onChange={(value) =>
                    handleReservationParamChange("guests", value)
                  }
                >
                  {guestCountOptions.map((guests, index) => (
                    <Option
                      key={index}
                      value={typeof guests === "object" ? guests.value : guests}
                    >
                      {typeof guests === "object"
                        ? guests.label
                        : `${guests} người`}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={4} lg={6}>
                <Button
                  type="primary"
                  block
                  icon={<SearchOutlined />}
                  onClick={() => {
                    if (restaurants.length > 0) {
                      handleStartReservation(restaurants[0]._id);
                    } else {
                      message.info("Không tìm thấy nhà hàng phù hợp");
                    }
                  }}
                  className="search-button"
                >
                  Tìm bàn
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Content className="main-content">
        {/* Promotions Section */}
        {promotions.length > 0 && (
          <div className="section-container">
            <Title level={2} className="section-title">
              <FireOutlined /> Khuyến mãi đặc biệt
            </Title>

            <Row gutter={[24, 24]}>
              {promotions.slice(0, 3).map((promotion) => (
                <Col xs={24} sm={12} md={8} key={promotion._id}>
                  <Badge.Ribbon
                    text={`-${promotion.discountPercent || 0}%`}
                    color="#ff4d4f"
                    className="promotion-ribbon"
                  >
                    <Card
                      hoverable
                      className="promotion-card"
                      onClick={() =>
                        handleRestaurantClick(promotion.restaurant?._id)
                      }
                      cover={
                        <div className="promotion-cover">
                          <img
                            alt={promotion.name}
                            src="https://t3.ftcdn.net/jpg/03/24/73/92/360_F_324739203_keeq8udvv0P2h1MLYJ0GLSlTBagoXS48.jpg"
                          />
                        </div>
                      }
                    >
                      <Meta
                        title={promotion.name}
                        description={promotion.description || "Không có mô tả"}
                      />
                      <div className="promotion-details">
                        <Space>
                          <ShopOutlined />
                          <Text strong>
                            {promotion.restaurant?.name || "Nhà hàng"}
                          </Text>
                        </Space>
                        <div className="promotion-expiry">
                          <CalendarOutlined /> Hết hạn:{" "}
                          {moment(promotion.endDate).format("DD/MM/YYYY")}
                        </div>
                      </div>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Mobile Filter Button */}
        <div className="mobile-filter-button">
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => setShowFilterDrawer(true)}
            size="large"
          >
            Bộ lọc
          </Button>
        </div>

        {/* Restaurant List Section */}
        <div className="section-container">
          <div className="section-header">
            <Title level={2} className="section-title">
              <ShopOutlined /> Nhà hàng
            </Title>

            <div className="desktop-filters">
              <Space size="middle">
                <Select
                  placeholder="Loại ẩm thực"
                  style={{ width: 150 }}
                  value={filters.cuisineType}
                  onChange={(value) => handleFilterChange("cuisineType", value)}
                  allowClear
                >
                  {cuisineTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>

                <Select
                  placeholder="Mức giá"
                  style={{ width: 130 }}
                  value={filters.priceRange}
                  onChange={(value) => handleFilterChange("priceRange", value)}
                  allowClear
                >
                  {priceRangeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>

                <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              </Space>
            </div>
          </div>

          {restaurants.length === 0 ? (
            <Empty
              description="Không tìm thấy nhà hàng phù hợp với yêu cầu của bạn"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {restaurants.map((restaurant) => (
                <Col xs={24} sm={12} md={8} lg={6} key={restaurant._id}>
                  <Card
                    hoverable
                    className="restaurant-card"
                    onClick={() => handleRestaurantClick(restaurant._id)}
                    cover={
                      <div className="restaurant-image">
                        <img
                          alt={restaurant.name}
                          src="https://t3.ftcdn.net/jpg/03/24/73/92/360_F_324739203_keeq8udvv0P2h1MLYJ0GLSlTBagoXS48.jpg"
                        />
                      </div>
                    }
                    actions={[
                      <Button
                        type="primary"
                        block
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartReservation(restaurant._id);
                        }}
                      >
                        Đặt bàn
                      </Button>,
                    ]}
                  >
                    <Meta
                      title={restaurant.name}
                      description={
                        <div className="restaurant-info">
                          {/* Rating */}
                          <div className="restaurant-rating">
                            <Rate
                              disabled
                              defaultValue={4.5}
                              style={{ fontSize: "14px" }}
                            />
                            <Text
                              type="secondary"
                              style={{ fontSize: "12px", marginLeft: "8px" }}
                            >
                              4.5 (120)
                            </Text>
                          </div>

                          {/* Cuisine Type */}
                          <div className="restaurant-cuisine">
                            <MenuOutlined />{" "}
                            <Text type="secondary">
                              {restaurant.cuisineType || "Đa dạng"}
                            </Text>
                          </div>

                          {/* Address */}
                          <div className="restaurant-address">
                            <EnvironmentOutlined />
                            <Text type="secondary" ellipsis>
                              {restaurant.address}
                            </Text>
                          </div>

                          {/* Price and Time */}
                          <div className="restaurant-footer">
                            <span className="price-tag">
                              {renderPriceRangeTag(restaurant.priceRange)}
                            </span>
                            <span className="time-info">
                              <ClockCircleOutlined />{" "}
                              {restaurant.openingTime || "08:00"} -{" "}
                              {restaurant.closingTime || "22:00"}
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Filter Drawer for Mobile */}
        <Drawer
          title="Bộ lọc"
          placement="right"
          onClose={() => setShowFilterDrawer(false)}
          visible={showFilterDrawer}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div>
              <Text strong>Loại ẩm thực</Text>
              <Select
                placeholder="Chọn loại ẩm thực"
                style={{ width: "100%", marginTop: 8 }}
                value={filters.cuisineType}
                onChange={(value) => handleFilterChange("cuisineType", value)}
                allowClear
              >
                {cuisineTypeOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Text strong>Mức giá</Text>
              <Select
                placeholder="Chọn mức giá"
                style={{ width: "100%", marginTop: 8 }}
                value={filters.priceRange}
                onChange={(value) => handleFilterChange("priceRange", value)}
                allowClear
              >
                {priceRangeOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

            <Button block onClick={handleClearFilters} icon={<ClearOutlined />}>
              Xóa bộ lọc
            </Button>

            <Button
              type="primary"
              block
              onClick={() => setShowFilterDrawer(false)}
            >
              Áp dụng
            </Button>
          </Space>
        </Drawer>
      </Content>
    </Layout>
  );
};

export default Homepage;
