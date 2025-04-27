import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Spin,
  Image,
  Tag,
  Space,
  Tabs,
  Rate,
  Divider,
  Empty,
  Form,
  DatePicker,
  TimePicker,
  InputNumber,
  message,
  List,
  Avatar,
  Alert,
  Badge,
  Tooltip,
} from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  MenuOutlined,
  TableOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import axiosInstance from "../../contexts/AxiosCustom";

// Import CSS
import "../../style/Customer/RestaurantDetail.scss";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [menu, setMenu] = useState([]);
  const [form] = Form.useForm();

  // States cho đặt bàn
  const [reservationParams, setReservationParams] = useState({
    date: moment().add(1, "days"),
    time: moment().hour(19).minute(0).second(0),
    guests: 2,
  });

  // States cho bàn
  const [availableTables, setAvailableTables] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Lấy thông tin người dùng từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/restaurant/detail/${id}`);

        if (response.data.status === "Success") {
          setRestaurant(response.data.data);
          // Tải menu và đánh giá nếu có
          fetchMenu(id);
          fetchReviews(id);
        } else {
          message.error("Không thể tải thông tin nhà hàng");
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        message.error("Có lỗi xảy ra khi tải thông tin");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  const fetchMenu = async (restaurantId) => {
    try {
      const response = await axiosInstance.get(
        `/menu/restaurant/${restaurantId}`
      );
      if (response.data.status === "Success") {
        setMenu(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const fetchReviews = async (restaurantId) => {
    try {
      const response = await axiosInstance.get(
        `/review/restaurant/${restaurantId}`
      );
      if (response.data.status === "Success") {
        setReviews(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleReservationParamChange = (name, value) => {
    setReservationParams((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset selected table when parameters change
    setSelectedTable(null);
  };

  const fetchAvailableTables = async () => {
    const { date, time, guests } = reservationParams;

    if (!date || !time || !guests) {
      return;
    }

    try {
      setTableLoading(true);
      const response = await axiosInstance.post(
        "/reservation/available-tables",
        {
          restaurantId: id,
          reservationDate: date.format("YYYY-MM-DD"), // Đảm bảo định dạng chuẩn YYYY-MM-DD
          reservationTime: time.format("HH:mm"),
          numGuests: guests,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "Success") {
        setAvailableTables(response.data.data || []);
        console.log("Available tables:", response.data.data);
      } else {
        message.error("Không thể tải thông tin bàn trống");
        setAvailableTables([]);
      }
    } catch (error) {
      console.error("Error fetching available tables:", error);
      setAvailableTables([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Gọi fetchAvailableTables khi thông số đặt bàn thay đổi
  useEffect(() => {
    fetchAvailableTables();
  }, [
    reservationParams.date,
    reservationParams.time,
    reservationParams.guests,
  ]);

  // Xử lý chọn bàn
  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleStartReservation = () => {
    const { date, time, guests } = reservationParams;

    if (!date || !time) {
      message.warning("Vui lòng chọn ngày và giờ đặt bàn");
      return;
    }

    if (!selectedTable) {
      message.warning("Vui lòng chọn bàn để đặt");
      return;
    }

    if (!user || !user._id) {
      message.warning("Vui lòng đăng nhập để đặt bàn");
      // Có thể chuyển hướng đến trang đăng nhập
      return;
    }

    navigate("/reservation/new", {
      state: {
        restaurantId: id,
        date: date.format("YYYY-MM-DD"),
        time: time.format("HH:mm"),
        guests,
        restaurantName: restaurant?.name || "",
        tableId: selectedTable?._id,
        tableName: selectedTable?.name,
      },
    });
  };

  // Render bàn có sẵn
  const renderAvailableTables = () => {
    if (tableLoading) {
      return <Spin size="small" tip="Đang tìm bàn trống..." />;
    }

    if (availableTables.length === 0) {
      return (
        <Alert
          message="Không có bàn trống"
          description="Không tìm thấy bàn nào phù hợp với thời gian và số lượng khách. Vui lòng thử lại với thời gian khác."
          type="info"
          showIcon
        />
      );
    }

    return (
      <div className="available-tables">
        <Divider orientation="left">Bàn có sẵn</Divider>
        <List
          size="small"
          dataSource={availableTables}
          renderItem={(table) => (
            <List.Item
              onClick={() => handleTableSelect(table)}
              className={`table-item ${
                selectedTable?._id === table._id ? "selected" : ""
              }`}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<TableOutlined />}
                    style={{
                      backgroundColor:
                        selectedTable?._id === table._id
                          ? "#1890ff"
                          : "#f0f0f0",
                    }}
                  />
                }
                title={table.name || `Bàn ${table.tableNumber}`}
                description={`Sức chứa: ${table.capacity} người`}
              />
              {selectedTable?._id === table._id && (
                <Tag color="blue">Đã chọn</Tag>
              )}
            </List.Item>
          )}
        />
      </div>
    );
  };

  // Price range tag mapping
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

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải thông tin nhà hàng..." />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Empty
        description="Không tìm thấy nhà hàng"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => navigate("/home")}>
          Quay lại trang chủ
        </Button>
      </Empty>
    );
  }

  return (
    <Layout className="restaurant-detail-layout">
      <Content className="restaurant-detail-content">
        {/* Header Section */}
        <div className="restaurant-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/home")}
            className="back-button"
          >
            Quay lại
          </Button>
          <div className="restaurant-cover">
            <Image
              src={
                restaurant.imageUrl ||
                `https://source.unsplash.com/random/?restaurant,${
                  restaurant.cuisineType || "food"
                }`
              }
              alt={restaurant.name}
              fallback="data:image/png;base64,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"
            />
          </div>

          <Card className="restaurant-info-card">
            <Title level={2}>{restaurant.name}</Title>
            <Space size={[0, 8]} wrap>
              <Tag icon={<ShopOutlined />} color="blue">
                {restaurant.cuisineType || "Chưa phân loại"}
              </Tag>
              {renderPriceRangeTag(restaurant.priceRange)}
              {reviews.length > 0 && (
                <Tag
                  icon={
                    <Rate
                      disabled
                      defaultValue={4.5}
                      style={{ fontSize: "12px" }}
                    />
                  }
                >
                  4.5/5 ({reviews.length})
                </Tag>
              )}
            </Space>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24} md={16}>
                <div className="restaurant-details">
                  <Paragraph>
                    <EnvironmentOutlined /> {restaurant.address}
                  </Paragraph>
                  <Paragraph>
                    <PhoneOutlined />{" "}
                    {restaurant.phone || "Chưa cập nhật số điện thoại"}
                  </Paragraph>
                  <Paragraph>
                    <ClockCircleOutlined /> Giờ mở cửa:{" "}
                    {restaurant.openingTime || "08:00"} -{" "}
                    {restaurant.closingTime || "22:00"}
                  </Paragraph>

                  {restaurant.description && (
                    <div className="restaurant-description">
                      <Title level={5}>Giới thiệu</Title>
                      <Paragraph>{restaurant.description}</Paragraph>
                    </div>
                  )}
                </div>
              </Col>

              <Col xs={24} md={8}>
                <Card className="reservation-card" title="Đặt bàn">
                  <Form
                    layout="vertical"
                    form={form}
                    initialValues={reservationParams}
                  >
                    <Form.Item label="Ngày đặt bàn" required>
                      <DatePicker
                        style={{ width: "100%" }}
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
                    </Form.Item>

                    <Form.Item label="Giờ đặt bàn" required>
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        minuteStep={15}
                        value={reservationParams.time}
                        onChange={(time) =>
                          handleReservationParamChange("time", time)
                        }
                      />
                    </Form.Item>

                    <Form.Item label="Số khách" required>
                      <InputNumber
                        style={{ width: "100%" }}
                        min={1}
                        max={20}
                        value={reservationParams.guests}
                        onChange={(value) =>
                          handleReservationParamChange("guests", value)
                        }
                        addonAfter={<UserOutlined />}
                      />
                    </Form.Item>

                    {/* Hiển thị danh sách bàn có sẵn */}
                    {renderAvailableTables()}

                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handleStartReservation}
                      className="reservation-button"
                      disabled={!selectedTable}
                    >
                      {selectedTable ? "Đặt bàn đã chọn" : "Đặt bàn ngay"}
                    </Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Tabs for menu and reviews */}
        <div className="restaurant-tabs">
          <Tabs defaultActiveKey="menu" type="card">
            <TabPane
              tab={
                <span>
                  <MenuOutlined /> Thực đơn
                </span>
              }
              key="menu"
            >
              {menu.length === 0 ? (
                <Empty description="Nhà hàng chưa cập nhật thực đơn" />
              ) : (
                <div className="menu-list">
                  {menu.map((menuCategory) => (
                    <div key={menuCategory._id} className="menu-category">
                      <Title level={4}>{menuCategory.name}</Title>
                      <Divider />
                      <Row gutter={[16, 16]}>
                        {menuCategory.items && menuCategory.items.length > 0 ? (
                          menuCategory.items.map((item) => (
                            <Col xs={24} sm={12} md={8} key={item._id}>
                              <Card
                                hoverable
                                className="menu-item-card"
                                cover={
                                  item.imageUrl && (
                                    <img alt={item.name} src={item.imageUrl} />
                                  )
                                }
                              >
                                <Card.Meta
                                  title={item.name}
                                  description={
                                    <>
                                      <div className="menu-item-price">
                                        {item.price?.toLocaleString()} đ
                                      </div>
                                      <div className="menu-item-description">
                                        {item.description || "Không có mô tả"}
                                      </div>
                                    </>
                                  }
                                />
                              </Card>
                            </Col>
                          ))
                        ) : (
                          <Col span={24}>
                            <Empty description="Không có món ăn nào trong danh mục này" />
                          </Col>
                        )}
                      </Row>
                    </div>
                  ))}
                </div>
              )}
            </TabPane>

            <TabPane
              tab={
                <span>
                  <Rate disabled defaultValue={1} count={1} /> Đánh giá
                </span>
              }
              key="reviews"
            >
              {reviews.length === 0 ? (
                <Empty description="Chưa có đánh giá nào cho nhà hàng này" />
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <Card key={review._id} className="review-card">
                      <div className="review-header">
                        <div className="review-user">
                          <UserOutlined /> {review.user?.name || "Ẩn danh"}
                        </div>
                        <div className="review-rating">
                          <Rate disabled defaultValue={review.rating} />
                        </div>
                      </div>
                      <div className="review-date">
                        {moment(review.createdAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                      <div className="review-content">
                        {review.comment || "Không có bình luận"}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default RestaurantDetail;
