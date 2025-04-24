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
} from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

// Material-UI components for breadcrumbs
import {
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Container,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

// Custom axios instance
import axiosInstance from "../../contexts/AxiosCustom";

// Import CSS
import "../../style/Admin/ReservationMana.scss";

const { Option } = Select;
const { TextArea } = Input;

const ReservationMana = () => {
  // States
  const [reservations, setReservations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [form] = Form.useForm();

  // Status configurations
  const statusConfig = {
    pending: { label: "Đang chờ", color: "warning" },
    confirmed: { label: "Xác nhận", color: "processing" },
    cancelled: { label: "Hủy bỏ", color: "error" },
    completed: { label: "Hoàn thành", color: "success" },
  };

  // Load initial data
  useEffect(() => {
    fetchReservations();
    fetchRestaurants();
    fetchUsers();
  }, []);

  // Load tables when restaurant changes in form
  useEffect(() => {
    const restaurantId = form.getFieldValue("restaurant");
    if (restaurantId) {
      fetchTables(restaurantId);
    }
  }, [form.getFieldValue("restaurant")]);

  // Fetch reservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/reservation");
      if (response.data.status === "Success") {
        setReservations(response.data.data || []);
      } else {
        message.error("Không thể tải thông tin đặt bàn");
      }
    } catch (error) {
      message.error("Lỗi khi tải thông tin đặt bàn");
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch restaurants
  const fetchRestaurants = async () => {
    try {
      const response = await axiosInstance.get("/api/restaurant");
      if (response.data.status === "Success") {
        setRestaurants(response.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhà hàng:", error);
    }
  };

  // Fetch tables for a specific restaurant
  const fetchTables = async (restaurantId) => {
    if (!restaurantId) return;

    try {
      const response = await axiosInstance.get(
        `/api/table/byRestaurant/${restaurantId}`
      );
      if (response.data.status === "Success") {
        setTables(response.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bàn:", error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/user");
      if (response.data.status === "Success") {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        reservationDate: values.reservationDate.format("YYYY-MM-DD"),
        reservationTime: values.reservationTime.format("HH:mm"),
      };

      if (selectedReservation) {
        // Edit mode
        const response = await axiosInstance.put(
          `/api/reservation/${selectedReservation._id}`,
          formattedValues
        );
        if (response.data.status === "Success") {
          message.success("Cập nhật đặt bàn thành công!");
          fetchReservations();
          setIsModalOpen(false);
        } else {
          message.error("Không thể cập nhật đặt bàn");
        }
      } else {
        // Create mode
        const response = await axiosInstance.post(
          "/api/reservation",
          formattedValues
        );
        if (response.data.status === "Success") {
          message.success("Tạo đặt bàn thành công!");
          fetchReservations();
          setIsModalOpen(false);
        } else {
          message.error("Không thể tạo đặt bàn");
        }
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/api/reservation/status/${id}`,
        {
          status: newStatus,
        }
      );

      if (response.data.status === "Success") {
        message.success("Cập nhật trạng thái thành công");
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

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/reservation/${id}`);
      if (response.data.status === "Success") {
        message.success("Xóa đặt bàn thành công");
        setReservations(reservations.filter((res) => res._id !== id));
      } else {
        message.error("Không thể xóa đặt bàn");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa đặt bàn");
    }
  };

  // Open edit modal
  const openEditModal = (reservation) => {
    setSelectedReservation(reservation);

    form.setFieldsValue({
      user: reservation.user?._id,
      restaurant: reservation.restaurant?._id,
      table: reservation.table?._id,
      numGuests: reservation.numGuests,
      reservationDate: moment(reservation.reservationDate),
      reservationTime: moment(reservation.reservationTime, "HH:mm"),
      specialRequest: reservation.specialRequest || "",
      status: reservation.status,
    });

    // Load tables for this restaurant
    if (reservation.restaurant?._id) {
      fetchTables(reservation.restaurant._id);
    }

    setIsModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setSelectedReservation(null);

    form.setFieldsValue({
      user: undefined,
      restaurant: undefined,
      table: undefined,
      numGuests: 1,
      reservationDate: moment(),
      reservationTime: moment("12:00", "HH:mm"),
      specialRequest: "",
      status: "pending",
    });

    setIsModalOpen(true);
  };

  // Table columns
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: ["user", "name"],
      key: "userName",
      render: (text) => text || "N/A",
      filteredValue: [searchTerm],
      onFilter: (value, record) => {
        const searchLower = value.toLowerCase();
        return (
          (record.user?.name || "").toLowerCase().includes(searchLower) ||
          (record.restaurant?.name || "").toLowerCase().includes(searchLower) ||
          (record.specialRequest || "").toLowerCase().includes(searchLower)
        );
      },
    },
    {
      title: "Nhà hàng",
      dataIndex: ["restaurant", "name"],
      key: "restaurantName",
      render: (text) => text || "N/A",
    },
    {
      title: "Ngày đặt",
      dataIndex: "reservationDate",
      key: "reservationDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ",
      dataIndex: "reservationTime",
      key: "reservationTime",
    },
    {
      title: "Số khách",
      dataIndex: "numGuests",
      key: "numGuests",
      render: (num) => `${num} người`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: "100%" }}
          onChange={(value) => handleStatusChange(record._id, value)}
          disabled={loading}
        >
          <Option value="pending">
            <Tag color="warning">Đang chờ</Tag>
          </Option>
          <Option value="confirmed">
            <Tag color="processing">Xác nhận</Tag>
          </Option>
          <Option value="cancelled">
            <Tag color="error">Hủy bỏ</Tag>
          </Option>
          <Option value="completed">
            <Tag color="success">Hoàn thành</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            type="primary"
            size="small"
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
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
        className="reservation-management"
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
          <Typography color="textPrimary">Quản lý Đặt Bàn</Typography>
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
          <Typography variant="h4" component="h1" gutterBottom>
            Quản lý Đặt Bàn
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Tạo đặt bàn
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchReservations}
              loading={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên khách hàng, nhà hàng..."
            allowClear
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={reservations}
          rowKey="_id"
          loading={loading}
          bordered
          pagination={{ pageSize: 7 }}
          style={{ marginTop: 16 }}
          locale={{
            emptyText: searchTerm
              ? "Không tìm thấy đặt bàn nào phù hợp"
              : "Chưa có đặt bàn nào",
          }}
        />

        {/* Form Modal */}
        <Modal
          title={selectedReservation ? "Chỉnh sửa đặt bàn" : "Tạo đặt bàn mới"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              numGuests: 1,
              status: "pending",
            }}
          >
            <Form.Item
              name="user"
              label="Khách hàng"
              rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
            >
              <Select
                placeholder="Chọn khách hàng"
                showSearch
                optionFilterProp="children"
              >
                {users.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="restaurant"
              label="Nhà hàng"
              rules={[{ required: true, message: "Vui lòng chọn nhà hàng" }]}
            >
              <Select
                placeholder="Chọn nhà hàng"
                onChange={(value) => {
                  form.setFieldsValue({ table: undefined });
                  fetchTables(value);
                }}
                showSearch
                optionFilterProp="children"
              >
                {restaurants.map((restaurant) => (
                  <Option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="table"
              label="Bàn"
              rules={[{ required: true, message: "Vui lòng chọn bàn" }]}
            >
              <Select
                placeholder="Chọn bàn"
                disabled={
                  !form.getFieldValue("restaurant") || tables.length === 0
                }
                showSearch
                optionFilterProp="children"
              >
                {tables.map((table) => (
                  <Option key={table._id} value={table._id}>
                    {table.name} (Sức chứa: {table.capacity})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Space
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Form.Item
                name="reservationDate"
                label="Ngày đặt bàn"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                style={{ width: "48%" }}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                name="reservationTime"
                label="Giờ đặt bàn"
                rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
                style={{ width: "48%" }}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={15}
                />
              </Form.Item>
            </Space>

            <Form.Item
              name="numGuests"
              label="Số lượng khách"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng khách" },
                {
                  type: "number",
                  min: 1,
                  message: "Số lượng khách phải lớn hơn 0",
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="pending">
                  <Tag color="warning">Đang chờ</Tag>
                </Option>
                <Option value="confirmed">
                  <Tag color="processing">Xác nhận</Tag>
                </Option>
                <Option value="cancelled">
                  <Tag color="error">Hủy bỏ</Tag>
                </Option>
                <Option value="completed">
                  <Tag color="success">Hoàn thành</Tag>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item name="specialRequest" label="Yêu cầu đặc biệt">
              <TextArea rows={3} placeholder="Nhập yêu cầu đặc biệt nếu có" />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedReservation ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>
      </Paper>
    </Container>
  );
};

export default ReservationMana;
