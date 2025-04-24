import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Avatar,
} from "antd";
import { Link } from "react-router-dom";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LockOutlined,
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
import "../../style/Admin/UserMana.scss";

const { Option } = Select;
const { TextArea } = Input;

const UserMana = () => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  // Thêm state cho current user
  const [currentUser, setCurrentUser] = useState(null);

  // Role labels for better display
  const roleLabels = {
    admin: "Admin",
    staff: "Staff",
    customer: "Customer",
  };

  // Role colors for tags
  const roleColors = {
    admin: "error",
    staff: "processing",
    customer: "success",
  };

  useEffect(() => {
    fetchUsers();

    // Lấy thông tin người dùng hiện tại từ localStorage
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/user");

      if (response.data.status === "Success") {
        setUsers(response.data.data || []);
      } else {
        message.error("Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUser(user);

    form.setFieldsValue({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "customer",
      password: "", // Empty for security
    });

    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);

    form.resetFields();
    form.setFieldsValue({
      role: "customer",
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const userData = { ...values };

      // Don't send empty password in edit mode
      if (isEditMode && !userData.password) {
        delete userData.password;
      }

      if (isEditMode && selectedUser) {
        // Update existing user
        const response = await axiosInstance.put(
          `/api/user/${selectedUser._id}`,
          userData
        );

        if (response.data.status === "Success") {
          message.success("Cập nhật người dùng thành công!");
          // Update user in state
          setUsers(
            users.map((u) =>
              u._id === selectedUser._id ? response.data.data : u
            )
          );
          setIsModalOpen(false);
        } else {
          message.error(
            "Không thể cập nhật người dùng: " + response.data.message
          );
        }
      } else {
        // Create new user
        const response = await axiosInstance.post("/api/user/signup", userData);

        if (response.data.status === "Success") {
          message.success("Tạo người dùng mới thành công!");
          // Add new user to state if the data is returned
          if (response.data.data) {
            setUsers([...users, response.data.data]);
          } else {
            // Otherwise refresh the list
            fetchUsers();
          }
          setIsModalOpen(false);
        } else {
          message.error("Không thể tạo người dùng: " + response.data.message);
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setLoading(true);

      // Update user role
      const response = await axiosInstance.put(`/api/user/${userId}/role`, {
        role: newRole,
      });

      if (response.data.status === "Success") {
        message.success("Cập nhật vai trò người dùng thành công!");
        // Update user role in state
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
      } else {
        message.error(
          "Không thể cập nhật vai trò người dùng: " + response.data.message
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa người dùng này? Dữ liệu đã xóa không thể khôi phục."
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.delete(`/api/user/${userId}`);

      if (response.data.status === "Success") {
        message.success("Xóa người dùng thành công!");
        // Remove user from state
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        message.error("Không thể xóa người dùng: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  );

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "?";
  };

  // Table columns
  const columns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          {record.image ? (
            <Avatar src={record.image} size={40} />
          ) : (
            <Avatar size={40} style={{ backgroundColor: "#1976d2" }}>
              {getInitials(record.name)}
            </Avatar>
          )}
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.name}</Typography.Text>
            <Typography.Text type="secondary">{record.email}</Typography.Text>
          </Space>
        </Space>
      ),
      filteredValue: [searchTerm],
      onFilter: () => true, // Filter is applied in the filteredUsers logic
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <Space>
          <PhoneOutlined />
          <span>{record.phone || "Chưa cập nhật"}</span>
        </Space>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => address || "Chưa cập nhật",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role, record) =>
        currentUser?.role === "admin" ? (
          <Select
            value={role}
            style={{ width: 120 }}
            onChange={(value) => handleRoleChange(record._id, value)}
            disabled={record._id === currentUser?._id}
          >
            <Option value="admin">
              <Tag color="error">Admin</Tag>
            </Option>
            <Option value="staff">
              <Tag color="processing">Staff</Tag>
            </Option>
            <Option value="customer">
              <Tag color="success">Customer</Tag>
            </Option>
          </Select>
        ) : (
          <Tag color={roleColors[role] || "default"}>
            {roleLabels[role] || role}
          </Tag>
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
            disabled={
              record.role === "admin" || record._id === currentUser?._id
            }
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
        className="user-management"
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
          <Typography color="textPrimary">Quản lý Người Dùng</Typography>
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
            Quản lý Người Dùng
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Thêm người dùng
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              loading={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 16 }}
          locale={{
            emptyText: searchTerm
              ? "Không tìm thấy người dùng nào phù hợp"
              : "Chưa có người dùng nào",
          }}
        />

        {/* Form Modal */}
        <Modal
          title={isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
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
              role: "customer",
            }}
          >
            <Form.Item
              name="name"
              label="Họ tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên người dùng" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ tên người dùng"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không đúng định dạng" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
                disabled={isEditMode}
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
                name="phone"
                label="Số điện thoại"
                style={{ width: "48%" }}
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                />
              </Form.Item>

              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                style={{ width: "48%" }}
              >
                <Select
                  placeholder="Chọn vai trò"
                  disabled={
                    currentUser?.role !== "admin" ||
                    (isEditMode && selectedUser?._id === currentUser?._id)
                  }
                >
                  <Option value="admin">Admin</Option>
                  <Option value="staff">Staff</Option>
                  <Option value="customer">Customer</Option>
                </Select>
              </Form.Item>
            </Space>

            <Form.Item name="address" label="Địa chỉ">
              <TextArea
                rows={3}
                placeholder="Nhập địa chỉ người dùng"
                prefix={<HomeOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                isEditMode
                  ? "Mật khẩu mới (để trống nếu không đổi)"
                  : "Mật khẩu"
              }
              rules={[
                !isEditMode && {
                  required: true,
                  message: "Vui lòng nhập mật khẩu",
                },
                {
                  validator: (_, value) => {
                    if (value && value.length < 6) {
                      return Promise.reject("Mật khẩu phải có ít nhất 6 ký tự");
                    }
                    return Promise.resolve();
                  },
                },
              ].filter(Boolean)}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={
                  isEditMode
                    ? "Nhập mật khẩu mới hoặc để trống"
                    : "Nhập mật khẩu"
                }
              />
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
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>
      </Paper>
    </Container>
  );
};

export default UserMana;
