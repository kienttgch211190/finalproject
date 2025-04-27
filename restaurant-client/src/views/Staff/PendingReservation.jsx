import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Typography,
  Card,
  Spin,
  message,
  Divider,
  Badge,
  Tooltip,
  Empty,
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  TableOutlined,
} from "@ant-design/icons";
import moment from "moment";

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
import "../../style/Staff/Reservation.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const PendingReservation = () => {
  // States
  const [pendingReservations, setPendingReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  // Lấy thông tin staff từ localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchStaffRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant?._id) {
      fetchPendingReservations();
      fetchTables(restaurant._id);
    }
  }, [restaurant]);

  // Fetch thông tin nhà hàng của staff
  const fetchStaffRestaurant = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/staff/restaurant/${staff._id}`,
        config
      );

      if (
        response.data.status === "Success" &&
        response.data.data &&
        ((response.data.data.length > 0 && response.data.data[0].restaurant) ||
          response.data.data.restaurant)
      ) {
        // Xử lý cả hai cấu trúc phản hồi có thể có
        const restaurantData = response.data.data.restaurant
          ? response.data.data.restaurant
          : response.data.data[0].restaurant;

        setRestaurant(restaurantData);
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

  // Fetch đặt bàn đang chờ xác nhận
  const fetchPendingReservations = async () => {
    if (!restaurant?._id) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/reservation/restaurant/${restaurant._id}/pending`,
        config
      );

      if (response.data.status === "Success") {
        // Xử lý dữ liệu lồng nhau
        const reservationData = response.data.data || [];
        setPendingReservations(reservationData);
      } else {
        message.error("Không thể tải thông tin đặt bàn đang chờ xác nhận");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin đặt bàn:", error);
      message.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách bàn
  const fetchTables = async (restaurantId) => {
    if (!restaurantId) return;

    try {
      const response = await axiosInstance.get(
        `/table/restaurant/${restaurantId}`,
        config
      );
      if (response.data.status === "Success") {
        setTables(response.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bàn:", error);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/reservation/status/${id}`,
        {
          status: newStatus,
        },
        config
      );

      if (response.data.status === "Success") {
        message.success(
          `Cập nhật trạng thái thành ${
            newStatus === "confirmed" ? "Đã xác nhận" : "Đã hủy"
          }`
        );

        // Update reservations state - remove from list
        setPendingReservations(
          pendingReservations.filter((res) => res._id !== id)
        );
      } else {
        message.error("Không thể cập nhật trạng thái");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  // Handle table assignment change
  const handleTableChange = async (reservationId, tableId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/reservation/update/${reservationId}`,
        {
          table: tableId,
        },
        config
      );

      if (response.data.status === "Success") {
        message.success("Cập nhật bàn thành công");

        // Update local state
        setPendingReservations(
          pendingReservations.map((res) =>
            res._id === reservationId
              ? { ...res, table: tables.find((t) => t._id === tableId) }
              : res
          )
        );
      } else {
        message.error("Không thể cập nhật bàn");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bàn:", error);
      message.error("Có lỗi xảy ra khi cập nhật bàn");
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận đơn đặt bàn
  const confirmReservation = (id) => {
    confirm({
      title: "Xác nhận đơn đặt bàn",
      icon: <CheckCircleOutlined style={{ color: "#1890ff" }} />,
      content: "Bạn có chắc chắn muốn xác nhận đơn đặt bàn này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        handleStatusChange(id, "confirmed");
      },
    });
  };

  // Hủy đơn đặt bàn
  const cancelReservation = (id) => {
    confirm({
      title: "Hủy đơn đặt bàn",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: "Bạn có chắc chắn muốn hủy đơn đặt bàn này không?",
      okText: "Hủy đơn",
      okType: "danger",
      cancelText: "Quay lại",
      onOk() {
        handleStatusChange(id, "cancelled");
      },
    });
  };
  // View reservation details
  const viewReservationDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalVisible(true);
  };

  // Filter reservations based on search term
  const filteredReservations = pendingReservations.filter((reservation) => {
    const matchesSearch = searchTerm
      ? (reservation.user?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (reservation.user?.phone || "").includes(searchTerm) ||
        (reservation.table?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (reservation.specialRequest || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    return matchesSearch;
  });

  // Table columns
  const columns = [
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.user?.name || "Khách không có tên"}</Text>
          {record.user?.phone && (
            <Text type="secondary">
              <PhoneOutlined /> {record.user.phone}
            </Text>
          )}
        </Space>
      ),
      filteredValue: searchTerm ? [searchTerm] : null,
      onFilter: () => true, // Filter is applied in filteredReservations
    },
    {
      title: "Thời gian",
      key: "dateTime",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            <CalendarOutlined />{" "}
            {moment(record.reservationDate).format("DD/MM/YYYY")}
          </Text>
          <Text type="secondary">
            <ClockCircleOutlined /> {record.reservationTime}
          </Text>
        </Space>
      ),
      sorter: (a, b) => {
        const dateA = moment(`${a.reservationDate} ${a.reservationTime}`);
        const dateB = moment(`${b.reservationDate} ${b.reservationTime}`);
        return dateA.valueOf() - dateB.valueOf();
      },
      defaultSortOrder: "ascend",
    },
    {
      title: "Số khách",
      dataIndex: "numGuests",
      key: "numGuests",
      render: (guests) => (
        <Space>
          <UserOutlined />
          <span>{guests} người</span>
        </Space>
      ),
      sorter: (a, b) => a.numGuests - b.numGuests,
    },
    {
      title: "Bàn",
      key: "table",
      render: (_, record) => (
        <Select
          value={record.table?._id}
          style={{ width: 130 }}
          onChange={(tableId) => handleTableChange(record._id, tableId)}
          placeholder="Chọn bàn"
        >
          {tables.map((table) => (
            <Option key={table._id} value={table._id}>
              <TableOutlined /> {table.name} ({table.capacity} người)
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "specialRequest",
      key: "specialRequest",
      render: (text) => {
        if (!text) return <Text type="secondary">Không có</Text>;

        return (
          <Tooltip title={text}>
            <div
              style={{
                width: 150,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <MessageOutlined /> {text}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        return (
          <Space size="small">
            <Button
              key="view"
              icon={<EyeOutlined />}
              onClick={() => viewReservationDetails(record)}
              type="link"
            />
            <Button
              key="confirm"
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => confirmReservation(record._id)}
            >
              Xác nhận
            </Button>
            <Button
              key="cancel"
              type="primary"
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => cancelReservation(record._id)}
            >
              Hủy
            </Button>
          </Space>
        );
      },
    },
  ];

  if (loading && !restaurant) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: 24, marginBottom: 24 }}>
      <Paper
        elevation={3}
        style={{ padding: 24, borderRadius: "8px" }}
        className="staff-reservation-management"
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
          <MuiLink
            component={Link}
            to="/staff/reservations"
            color="inherit"
            underline="hover"
          >
            Đặt bàn
          </MuiLink>
          <MuiTypography color="textPrimary">Chờ xác nhận</MuiTypography>
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
            Đơn đặt bàn chờ xác nhận{" "}
            {restaurant?.name ? `- ${restaurant.name}` : ""}
          </MuiTypography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => (window.location.href = "/staff/reservations")}
            >
              Quay lại Đặt bàn
            </Button>
          </Box>
        </Box>

        {/* Restaurant Info Card */}
        {restaurant && (
          <Card className="restaurant-info-card" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div className="restaurant-name">
                <Title level={5}>{restaurant.name}</Title>
                <Text type="secondary">{restaurant.address}</Text>
              </div>

              <Space size="large">
                <Text>
                  <ClockCircleOutlined /> Giờ mở cửa: {restaurant.openingTime} -{" "}
                  {restaurant.closingTime}
                </Text>
                <Text>
                  <PhoneOutlined /> {restaurant.phone || "Chưa có SĐT"}
                </Text>
              </Space>
            </Space>
          </Card>
        )}

        {/* Search */}
        <div className="filter-controls" style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên, SĐT, bàn..."
            allowClear
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Badge count={pendingReservations.length} color="warning">
            <Title level={5} style={{ margin: 0 }}>
              Đang chờ xác nhận
            </Title>
          </Badge>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredReservations}
          rowKey="_id"
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 16 }}
          locale={{
            emptyText: searchTerm ? (
              "Không tìm thấy đặt bàn nào phù hợp"
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <p>Không có đơn đặt bàn nào đang chờ xác nhận</p>
                    <Button
                      type="primary"
                      onClick={() =>
                        (window.location.href = "/staff/reservations")
                      }
                    >
                      Xem tất cả đơn đặt bàn
                    </Button>
                  </div>
                }
              />
            ),
          }}
        />

        {/* Reservation Detail Modal */}
        <Modal
          title="Chi tiết đặt bàn"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={700}
        >
          {selectedReservation && (
            <div className="reservation-detail">
              <div className="detail-section">
                <Title level={5}>Thông tin khách hàng</Title>
                <div className="detail-grid">
                  <div className="detail-item">
                    <Text type="secondary">Tên khách hàng:</Text>
                    <Text strong>{selectedReservation.user?.name}</Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Số điện thoại:</Text>
                    <Text>{selectedReservation.user?.phone || "Không có"}</Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Email:</Text>
                    <Text>{selectedReservation.user?.email || "Không có"}</Text>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="detail-section">
                <Title level={5}>Thông tin đặt bàn</Title>
                <div className="detail-grid">
                  <div className="detail-item">
                    <Text type="secondary">Ngày đặt:</Text>
                    <Text strong>
                      {moment(selectedReservation.reservationDate).format(
                        "DD/MM/YYYY"
                      )}
                    </Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Giờ đặt:</Text>
                    <Text strong>{selectedReservation.reservationTime}</Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Số lượng khách:</Text>
                    <Text>{selectedReservation.numGuests} người</Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Bàn:</Text>
                    <Text>
                      {selectedReservation.table?.name || "Chưa chọn bàn"}
                    </Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Trạng thái:</Text>
                    <Tag color="warning" icon={<ClockCircleOutlined />}>
                      Chờ xác nhận
                    </Tag>
                  </div>

                  {selectedReservation.createdAt && (
                    <div className="detail-item">
                      <Text type="secondary">Thời gian tạo:</Text>
                      <Text>
                        {moment(selectedReservation.createdAt).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </Text>
                    </div>
                  )}
                </div>
              </div>

              {selectedReservation.specialRequest && (
                <>
                  <Divider />
                  <div className="detail-section">
                    <Title level={5}>Yêu cầu đặc biệt</Title>
                    <div className="special-request">
                      {selectedReservation.specialRequest}
                    </div>
                  </div>
                </>
              )}

              <Divider />

              <div className="detail-actions">
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      confirmReservation(selectedReservation._id);
                      setIsModalVisible(false);
                    }}
                  >
                    Xác nhận đặt bàn
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      cancelReservation(selectedReservation._id);
                      setIsModalVisible(false);
                    }}
                  >
                    Hủy đặt bàn
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Modal>
      </Paper>
    </Container>
  );
};

export default PendingReservation;
