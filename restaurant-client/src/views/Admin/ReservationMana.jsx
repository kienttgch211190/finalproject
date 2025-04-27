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
  Tooltip,
  Popconfirm,
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
  InfoCircleOutlined,
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
  const [tableLoading, setTableLoading] = useState(false);

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

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.get("/reservation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.get("/restaurant", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      setTableLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.get(
        `/table/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "Success") {
        setTables(response.data.data || []);
      } else {
        message.error("Không thể tải thông tin bàn");
        setTables([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bàn:", error);
      setTables([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch available tables for a specific reservation
  const fetchAvailableTables = async (
    restaurantId,
    reservationDate,
    reservationTime,
    numGuests,
    excludeTableId = null
  ) => {
    if (!restaurantId || !reservationDate || !reservationTime || !numGuests)
      return [];

    try {
      setTableLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.post(
        "/reservation/available-tables",
        {
          restaurantId,
          reservationDate: moment(reservationDate).format("YYYY-MM-DD"),
          reservationTime: moment(reservationTime).format("HH:mm"),
          numGuests,
          excludeTableId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "Success") {
        return response.data.data || [];
      } else {
        message.warning("Không tìm thấy bàn trống phù hợp");
        return [];
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bàn trống:", error);
      return [];
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/user/get-all-users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.data.status === "Success") {
        const customers = (response.data.data || []).filter(
          (user) => user.role === "customer"
        );
        setUsers(customers);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Format date and time properly
      const formattedValues = {
        ...values,
        reservationDate: moment(values.reservationDate).format("YYYY-MM-DD"),
        reservationTime: moment(values.reservationTime).format("HH:mm"),
      };

      // Hiển thị log để debug
      console.log("Submitting reservation data:", formattedValues);

      if (selectedReservation) {
        // Edit mode
        const response = await axiosInstance.put(
          `/reservation/update/${selectedReservation._id}`,
          formattedValues,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (response.data.status === "Success") {
          message.success("Cập nhật đặt bàn thành công!");
          fetchReservations();
          setIsModalOpen(false);
        } else {
          message.error("Không thể cập nhật đặt bàn: " + response.data.message);
        }
      } else {
        // Create mode - Kiểm tra tất cả các trường bắt buộc
        if (
          !formattedValues.user ||
          !formattedValues.restaurant ||
          !formattedValues.table ||
          !formattedValues.reservationDate ||
          !formattedValues.reservationTime ||
          !formattedValues.numGuests
        ) {
          message.error("Vui lòng điền đầy đủ thông tin đặt bàn");
          setLoading(false);
          return;
        }

        // Đảm bảo numGuests là số
        formattedValues.numGuests = parseInt(formattedValues.numGuests);

        const response = await axiosInstance.post(
          "/reservation/create",
          formattedValues,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.data.status === "Success") {
          message.success("Tạo đặt bàn thành công!");
          fetchReservations();
          setIsModalOpen(false);
        } else {
          message.error("Không thể tạo đặt bàn: " + response.data.message);
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);

      // Hiển thị chi tiết lỗi từ server nếu có
      if (error.response && error.response.data) {
        console.log("Server error details:", error.response.data);
        message.error("Lỗi: " + (error.response.data.message || error.message));
      } else {
        message.error("Có lỗi xảy ra: " + error.message);
      }
    } finally {
      setLoading(false);
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
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
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
        message.error(
          "Không thể cập nhật trạng thái: " + response.data.message
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete reservation
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.delete(`/reservation/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "Success") {
        message.success("Xóa đặt bàn thành công");
        // Update local state to remove the deleted reservation
        setReservations((prevReservations) =>
          prevReservations.filter((res) => res._id !== id)
        );
      } else {
        message.error(
          "Không thể xóa đặt bàn: " + (response.data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      message.error(
        "Có lỗi xảy ra khi xóa đặt bàn: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with existing reservation data
  const openEditModal = async (reservation) => {
    setSelectedReservation(reservation);

    try {
      // Load tables for this restaurant first
      if (reservation.restaurant?._id) {
        await fetchTables(reservation.restaurant._id);
      }

      // Now set form values
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

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error preparing edit modal:", error);
      message.error("Không thể mở form chỉnh sửa");
    }
  };

  // Open create modal with default values
  const openCreateModal = () => {
    setSelectedReservation(null);

    // Reset form with default values
    form.resetFields();
    form.setFieldsValue({
      numGuests: 1,
      reservationDate: moment(),
      reservationTime: moment("12:00", "HH:mm"),
      status: "pending",
    });

    setIsModalOpen(true);
  };

  // Handle restaurant change in form
  const handleRestaurantChange = async (value) => {
    form.setFieldsValue({ table: undefined });
    await fetchTables(value);
  };

  // Handle form field changes that require fetching available tables
  const handleReservationParamChange = async () => {
    const restaurantId = form.getFieldValue("restaurant");
    const reservationDate = form.getFieldValue("reservationDate");
    const reservationTime = form.getFieldValue("reservationTime");
    const numGuests = form.getFieldValue("numGuests");

    if (!restaurantId || !reservationDate || !reservationTime || !numGuests) {
      return;
    }

    // If editing, we want to include the current table in available options
    const excludeTableId = selectedReservation?.table?._id;

    // Fetch available tables
    const availableTables = await fetchAvailableTables(
      restaurantId,
      reservationDate,
      reservationTime,
      numGuests,
      excludeTableId
    );

    if (availableTables.length > 0) {
      setTables(availableTables);
    } else {
      message.warning(
        "Không có bàn trống phù hợp vào thời điểm này. Các bàn hiện tại có thể đã được đặt."
      );
    }
  };

  // Table columns
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: ["user", "name"],
      key: "userName",
      render: (text) => text || "N/A",
      filteredValue: searchTerm ? [searchTerm] : null,
      onFilter: (value, record) => {
        const searchLower = value.toLowerCase();
        return (
          (record.user?.name || "").toLowerCase().includes(searchLower) ||
          (record.user?.email || "").toLowerCase().includes(searchLower) ||
          (record.restaurant?.name || "").toLowerCase().includes(searchLower) ||
          (record.specialRequest || "").toLowerCase().includes(searchLower)
        );
      },
    },
    {
      title: "Liên hệ",
      dataIndex: ["user", "email"],
      key: "userContact",
      render: (email, record) => (
        <div>
          <div>{email || "N/A"}</div>
          <small>{record.user?.phone || "N/A"}</small>
        </div>
      ),
    },
    {
      title: "Nhà hàng",
      dataIndex: ["restaurant", "name"],
      key: "restaurantName",
      render: (text) => text || "N/A",
    },
    {
      title: "Bàn",
      dataIndex: ["table", "name"],
      key: "tableName",
      render: (text, record) =>
        text || `Bàn ${record.table?.tableNumber || "N/A"}`,
    },
    {
      title: "Ngày đặt",
      dataIndex: "reservationDate",
      key: "reservationDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        moment(a.reservationDate).unix() - moment(b.reservationDate).unix(),
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
      filters: [
        { text: "Đang chờ", value: "pending" },
        { text: "Xác nhận", value: "confirmed" },
        { text: "Hủy bỏ", value: "cancelled" },
        { text: "Hoàn thành", value: "completed" },
      ],
      onFilter: (value, record) => record.status === value,
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
          <Popconfirm
            title="Xóa đặt bàn"
            description="Bạn có chắc chắn muốn xóa đơn đặt bàn này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              icon={<DeleteOutlined />}
              type="primary"
              danger
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
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
            placeholder="Tìm kiếm theo tên khách hàng, email, nhà hàng..."
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
                onChange={handleRestaurantChange}
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
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  onChange={handleReservationParamChange}
                />
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
                  onChange={handleReservationParamChange}
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
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                onChange={handleReservationParamChange}
              />
            </Form.Item>

            <Form.Item
              name="table"
              label={
                <span>
                  Bàn{" "}
                  <Tooltip title="Chọn nhà hàng, ngày, giờ và số khách để xem bàn trống">
                    <InfoCircleOutlined />
                  </Tooltip>
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn bàn" }]}
            >
              <Select
                placeholder={
                  tableLoading ? "Đang tải bàn trống..." : "Chọn bàn"
                }
                disabled={
                  !form.getFieldValue("restaurant") ||
                  tableLoading ||
                  tables.length === 0
                }
                showSearch
                optionFilterProp="children"
                loading={tableLoading}
                notFoundContent={
                  tableLoading ? "Đang tải..." : "Không có bàn trống"
                }
              >
                {tables.map((table) => (
                  <Option key={table._id} value={table._id}>
                    {table.name || `Bàn ${table.tableNumber || ""}`} (Sức chứa:{" "}
                    {table.capacity} người)
                  </Option>
                ))}
              </Select>
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
