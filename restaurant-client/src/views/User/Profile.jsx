import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Tabs,
  Tab,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Home,
  Edit,
  Save,
  Cancel,
  History,
  AccountCircle,
} from "@mui/icons-material";
import { Table, Tag, Space, Spin, Empty } from "antd";
import moment from "moment";
import { Link } from "react-router-dom";
import axiosInstance from "../../contexts/AxiosCustom";

// Import CSS
import "../../style/User/Profile.scss";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  // Get user token from localStorage
  const token = localStorage.getItem("accessToken");
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // If user is customer, fetch reservations when user profile is loaded
  useEffect(() => {
    if (user && user._id && user.role === "customer") {
      fetchUserReservations();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "Success") {
        const userData = response.data.data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "", // Email will be disabled in the form
          phone: userData.phone || "",
          address: userData.address || "",
        });
      } else {
        showSnackbar("Không thể tải thông tin người dùng", "error");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showSnackbar("Có lỗi xảy ra khi tải thông tin người dùng", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReservations = async () => {
    try {
      setReservationsLoading(true);
      const response = await axiosInstance.get(
        `/reservation/user/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "Success") {
        setReservations(response.data.data || []);
      } else {
        console.error("Failed to fetch reservations:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user reservations:", error);
    } finally {
      setReservationsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditToggle = () => {
    if (editMode) {
      // If cancelling edit, reset form data to original values
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
    setEditMode(!editMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/user/update/${user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "Success") {
        // Update user state with new data
        setUser(response.data.data);

        // Update localStorage user data
        const updatedUserData = { ...userFromStorage };
        updatedUserData.name = response.data.data.name;
        updatedUserData.phone = response.data.data.phone;
        updatedUserData.address = response.data.data.address;
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        showSnackbar("Cập nhật thông tin thành công");
        setEditMode(false);
      } else {
        showSnackbar("Không thể cập nhật thông tin", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showSnackbar("Có lỗi xảy ra khi cập nhật thông tin", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "pending":
        return <Tag color="warning">Chờ xác nhận</Tag>;
      case "confirmed":
        return <Tag color="processing">Đã xác nhận</Tag>;
      case "completed":
        return <Tag color="success">Hoàn thành</Tag>;
      case "cancelled":
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const reservationColumns = [
    {
      title: "Nhà hàng",
      dataIndex: ["restaurant", "name"],
      key: "restaurant",
      render: (text, record) => text || "Không có thông tin",
    },
    {
      title: "Ngày đặt",
      dataIndex: "reservationDate",
      key: "date",
      render: (text) => moment(text).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        new Date(a.reservationDate) - new Date(b.reservationDate),
    },
    {
      title: "Giờ",
      dataIndex: "reservationTime",
      key: "time",
    },
    {
      title: "Số khách",
      dataIndex: "numGuests",
      key: "guests",
    },
    {
      title: "Bàn",
      dataIndex: ["table", "name"],
      key: "table",
      render: (text, record) => text || "Chưa xác định",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Chờ xác nhận", value: "pending" },
        { text: "Đã xác nhận", value: "confirmed" },
        { text: "Hoàn thành", value: "completed" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  if (loading && !user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 0, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleTabChange}
            aria-label="profile tabs"
            centered
            sx={{ bgcolor: "#f5f5f5" }}
          >
            <Tab
              label="Thông tin cá nhân"
              icon={<Person />}
              iconPosition="start"
            />
            {user?.role === "customer" && (
              <Tab
                label="Lịch sử đặt bàn"
                icon={<History />}
                iconPosition="start"
              />
            )}
          </Tabs>
        </Box>

        {/* Personal Info Tab */}
        <TabPanel value={value} index={0}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "primary.main",
                fontSize: "2.5rem",
                mb: 2,
              }}
            >
              {user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <AccountCircle />
              )}
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {user?.name || "Chưa cập nhật"}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ textTransform: "capitalize" }}
            >
              {user?.role === "customer"
                ? "Khách hàng"
                : user?.role === "staff"
                ? "Nhân viên"
                : user?.role === "admin"
                ? "Quản trị viên"
                : "Người dùng"}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  required
                  InputProps={{
                    startAdornment: (
                      <Person sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  disabled={true} // Email không được phép thay đổi
                  InputProps={{
                    startAdornment: (
                      <Email sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  required
                  InputProps={{
                    startAdornment: (
                      <Phone sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <Home sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                {!editMode ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={handleEditToggle}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleEditToggle}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Lưu"}
                    </Button>
                  </>
                )}
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        {/* Reservation History Tab - Only for Customers */}
        {user?.role === "customer" && (
          <TabPanel value={value} index={1}>
            <Typography variant="h6" gutterBottom>
              Lịch sử đặt bàn
            </Typography>

            {reservationsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <Spin size="large" />
              </Box>
            ) : reservations.length > 0 ? (
              <Table
                columns={reservationColumns}
                dataSource={reservations}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                bordered
              />
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Empty
                  description="Bạn chưa có đơn đặt bàn nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Button
                  variant="contained"
                  component={Link}
                  to="/home"
                  sx={{ mt: 2 }}
                >
                  Đặt bàn ngay
                </Button>
              </Box>
            )}
          </TabPanel>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
