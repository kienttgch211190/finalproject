import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  TimePicker,
  Tag,
  Space,
  message,
  Card,
  Tabs,
  Badge,
  Tooltip,
  Typography,
  Divider,
} from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserOutlined,
  TableOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
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
import "../../style/Staff/Reservation.scss";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { confirm } = Modal;

const ReservationMana = () => {
  // States
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [form] = Form.useForm();
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [tableFilter, setTableFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());

  // Lấy thông tin staff từ localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");

  // Status configurations
  const statusConfig = {
    pending: {
      label: "Chờ xác nhận",
      color: "warning",
      icon: <ClockCircleOutlined />,
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "processing",
      icon: <CheckCircleOutlined />,
    },
    cancelled: {
      label: "Đã hủy",
      color: "error",
      icon: <CloseCircleOutlined />,
    },
    completed: {
      label: "Hoàn thành",
      color: "success",
      icon: <CheckCircleOutlined />,
    },
  };

  // Load restaurant của staff khi component mount
  useEffect(() => {
    fetchStaffRestaurant();
  }, []);

  // Load reservations khi có restaurant
  useEffect(() => {
    if (restaurant?._id) {
      fetchReservations();
      fetchTables(restaurant._id);
    }
  }, [restaurant, activeTab]);


   const token = localStorage.getItem("accessToken");
        
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, 
      },  
    };

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

  // Fetch đặt bàn theo restaurant và filter
  const fetchReservations = async () => {
    if (!restaurant?._id) return;

    try {
      setLoading(true);
      let endpoint = `/reservation/restaurant/${restaurant._id}`;

      // Áp dụng filter theo tab
      if (activeTab !== "all") {
        endpoint += `/${activeTab}`;
      }

      // Filter theo ngày nếu có
      if (dateFilter) {
        const formattedDate = moment(dateFilter).format("YYYY-MM-DD");
        endpoint += `?date=${formattedDate}`;
      }

      const response = await axiosInstance.get(endpoint, config);

      if (response.data.status === "Success") {
        setReservations(response.data.data || []);
      } else {
        message.error("Không thể tải thông tin đặt bàn");
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
        `/table/byRestaurant/${restaurantId}`, config
      );
      if (response.data.status === "Success") {
        setTables(response.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bàn:", error);
    }
  };

  // Handle tab change
  const handleTabChange = (activeKey) => {
    setActiveTab(activeKey);
    setSearchTerm("");
    setTableFilter(null);
    setDateFilter(null);
  };

  // Handle date filter
  const handleDateFilter = (date) => {
    setDateFilter(date);
    setSelectedDate(date);
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/reservation/status/${id}`,
        {
          status: newStatus,
        },config
      );

      if (response.data.status === "Success") {
        message.success(
          `Cập nhật trạng thái thành ${statusConfig[newStatus]?.label}`
        );

        // Update reservations state
        setReservations(
          reservations.map((res) =>
            res._id === id ? { ...res, status: newStatus } : res
          )
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

  // Hoàn thành đơn đặt bàn
  const completeReservation = (id) => {
    confirm({
      title: "Hoàn thành đơn đặt bàn",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      content: "Xác nhận khách hàng đã đến và hoàn thành đơn đặt bàn?",
      okText: "Hoàn thành",
      cancelText: "Hủy",
      onOk() {
        handleStatusChange(id, "completed");
      },
    });
  };

  // Handle table assignment change
  const handleTableChange = async (reservationId, tableId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/reservation/${reservationId}`,
        {
          table: tableId,
        }
      );

      if (response.data.status === "Success") {
        message.success("Cập nhật bàn thành công");

        // Update local state
        setReservations(
          reservations.map((res) =>
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

  // View reservation details
  const viewReservationDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalVisible(true);
  };

  // Filter reservations based on table filter and search term
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = searchTerm
      ? (reservation.customer?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (reservation.customer?.phone || "").includes(searchTerm) ||
        (reservation.table?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (reservation.specialRequest || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    const matchesTableFilter = tableFilter
      ? reservation.table?._id === tableFilter
      : true;

    return matchesSearch && matchesTableFilter;
  });

  // Count reservations by status
  const getStatusCounts = () => {
    const counts = {
      all: reservations.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    reservations.forEach((res) => {
      if (counts[res.status] !== undefined) {
        counts[res.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Table columns
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: ["customer", "name"],
      key: "customerName",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text || "Khách không có tên"}</Text>
          {record.customer?.phone && (
            <Text type="secondary">
              <PhoneOutlined /> {record.customer.phone}
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
            <CalendarOutlined /> {moment(record.dateTime).format("DD/MM/YYYY")}
          </Text>
          <Text type="secondary">
            <ClockCircleOutlined /> {moment(record.dateTime).format("HH:mm")}
          </Text>
        </Space>
      ),
      sorter: (a, b) =>
        moment(a.dateTime).valueOf() - moment(b.dateTime).valueOf(),
      defaultSortOrder: "ascend",
    },
    {
      title: "Số khách",
      dataIndex: "numberOfGuests",
      key: "numberOfGuests",
      render: (guests) => (
        <Space>
          <UserOutlined />
          <span>{guests} người</span>
        </Space>
      ),
      sorter: (a, b) => a.numberOfGuests - b.numberOfGuests,
    },
    {
      title: "Bàn",
      key: "table",
      render: (_, record) => (
        <Select
          value={record.table?._id}
          style={{ width: 130 }}
          onChange={(tableId) => handleTableChange(record._id, tableId)}
          disabled={
            record.status === "cancelled" ||
            record.status === "completed" ||
            tables.length === 0
          }
          placeholder="Chọn bàn"
        >
          {tables.map((table) => (
            <Option key={table._id} value={table._id}>
              <TableOutlined /> {table.name} ({table.capacity} người)
            </Option>
          ))}
        </Select>
      ),
      filters: tables.map((table) => ({ text: table.name, value: table._id })),
      onFilter: (value, record) => record.table?._id === value,
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={statusConfig[status]?.color || "default"}
          icon={statusConfig[status]?.icon}
        >
          {statusConfig[status]?.label || status}
        </Tag>
      ),
      filters: [
        { text: "Chờ xác nhận", value: "pending" },
        { text: "Đã xác nhận", value: "confirmed" },
        { text: "Đã hủy", value: "cancelled" },
        { text: "Hoàn thành", value: "completed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        // Action buttons based on current status
        let actions = [];

        // View button always available
        actions.push(
          <Button
            key="view"
            icon={<EyeOutlined />}
            onClick={() => viewReservationDetails(record)}
            type="link"
          />
        );

        if (record.status === "pending") {
          actions.push(
            <Button
              key="confirm"
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => confirmReservation(record._id)}
            >
              Xác nhận
            </Button>
          );

          actions.push(
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
          );
        }

        if (record.status === "confirmed") {
          actions.push(
            <Button
              key="complete"
              type="primary"
              size="small"
              onClick={() => completeReservation(record._id)}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Hoàn thành
            </Button>
          );

          actions.push(
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
          );
        }

        return <Space size="small">{actions}</Space>;
      },
    },
  ];

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
          <MuiTypography color="textPrimary">Quản lý Đặt Bàn</MuiTypography>
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
            Quản lý Đặt Bàn {restaurant?.name ? `- ${restaurant.name}` : ""}
          </MuiTypography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => fetchReservations()}
              loading={loading}
            >
              Làm mới
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

        {/* Tabs & Filters */}
        <div className="reservation-filters">
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane
              tab={
                <Badge count={statusCounts.all} size="small" offset={[10, 0]}>
                  <span>Tất cả</span>
                </Badge>
              }
              key="all"
            />
            <TabPane
              tab={
                <Badge
                  count={statusCounts.pending}
                  size="small"
                  color="#faad14"
                  offset={[10, 0]}
                >
                  <span>Chờ xác nhận</span>
                </Badge>
              }
              key="pending"
            />
            <TabPane
              tab={
                <Badge
                  count={statusCounts.confirmed}
                  size="small"
                  color="#1890ff"
                  offset={[10, 0]}
                >
                  <span>Đã xác nhận</span>
                </Badge>
              }
              key="confirmed"
            />
            <TabPane
              tab={
                <Badge
                  count={statusCounts.completed}
                  size="small"
                  color="#52c41a"
                  offset={[10, 0]}
                >
                  <span>Đã hoàn thành</span>
                </Badge>
              }
              key="completed"
            />
            <TabPane
              tab={
                <Badge
                  count={statusCounts.cancelled}
                  size="small"
                  color="#ff4d4f"
                  offset={[10, 0]}
                >
                  <span>Đã hủy</span>
                </Badge>
              }
              key="cancelled"
            />
          </Tabs>

          <div className="filter-controls">
            <Space size="middle">
              <Input.Search
                placeholder="Tìm kiếm theo tên, SĐT, bàn..."
                allowClear
                onSearch={setSearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />

              <DatePicker
                placeholder="Lọc theo ngày"
                value={dateFilter}
                onChange={handleDateFilter}
                format="DD/MM/YYYY"
                allowClear
                style={{ width: 150 }}
              />

              <Select
                placeholder="Lọc theo bàn"
                style={{ width: 150 }}
                allowClear
                onChange={setTableFilter}
                value={tableFilter}
              >
                {tables.map((table) => (
                  <Option key={table._id} value={table._id}>
                    <TableOutlined /> {table.name}
                  </Option>
                ))}
              </Select>

              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchTerm("");
                  setTableFilter(null);
                  setDateFilter(null);
                  setSelectedDate(moment());
                }}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </div>
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
            emptyText:
              searchTerm || tableFilter || dateFilter
                ? "Không tìm thấy đặt bàn nào phù hợp"
                : "Chưa có đặt bàn nào",
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
                    <Text strong>{selectedReservation.customer?.name}</Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Số điện thoại:</Text>
                    <Text>
                      {selectedReservation.customer?.phone || "Không có"}
                    </Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Email:</Text>
                    <Text>
                      {selectedReservation.customer?.email || "Không có"}
                    </Text>
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
                      {moment(selectedReservation.dateTime).format(
                        "DD/MM/YYYY"
                      )}
                    </Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Giờ đặt:</Text>
                    <Text strong>
                      {moment(selectedReservation.dateTime).format("HH:mm")}
                    </Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Số lượng khách:</Text>
                    <Text>{selectedReservation.numberOfGuests} người</Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Bàn:</Text>
                    <Text>
                      {selectedReservation.table?.name || "Chưa chọn bàn"}
                    </Text>
                  </div>

                  <div className="detail-item">
                    <Text type="secondary">Trạng thái:</Text>
                    <Tag
                      color={statusConfig[selectedReservation.status]?.color}
                      icon={statusConfig[selectedReservation.status]?.icon}
                    >
                      {statusConfig[selectedReservation.status]?.label ||
                        selectedReservation.status}
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
                  {selectedReservation.status === "pending" && (
                    <>
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
                    </>
                  )}

                  {selectedReservation.status === "confirmed" && (
                    <>
                      <Button
                        type="primary"
                        style={{
                          background: "#52c41a",
                          borderColor: "#52c41a",
                        }}
                        onClick={() => {
                          completeReservation(selectedReservation._id);
                          setIsModalVisible(false);
                        }}
                      >
                        Hoàn thành đặt bàn
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
                    </>
                  )}
                </Space>
              </div>
            </div>
          )}
        </Modal>
      </Paper>
    </Container>
  );
};

export default ReservationMana;
