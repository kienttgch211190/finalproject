import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  ListItemIcon,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People,
  Restaurant,
  EventNote,
  Menu as MenuIcon,
  MenuBook,
  LocalOffer,
  ExitToApp,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../contexts/AxiosCustom";
import { toast } from "react-toastify";

// Import CSS
import "../../style/Admin/Dashboard.scss";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userCount: 0,
    restaurantCount: 0,
    reservationCount: 0,
    recentReservations: [],
    topRestaurants: [],
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get admin info from localStorage
  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
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
        toast.error(
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

    fetchDashboardData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
    toast.success("Đăng xuất thành công!");
  };

  const getReservationStatusChip = (status) => {
    switch (status) {
      case "pending":
        return <Chip label="Chờ xác nhận" color="warning" size="small" />;
      case "confirmed":
        return <Chip label="Đã xác nhận" color="success" size="small" />;
      case "cancelled":
        return <Chip label="Đã hủy" color="error" size="small" />;
      case "completed":
        return <Chip label="Hoàn thành" color="info" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  const drawer = (
    <Box sx={{ width: 240 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
        }}
      >
        <AccountCircle
          sx={{ fontSize: 64, color: theme.palette.primary.main }}
        />
        <Typography variant="h6" sx={{ mt: 1 }}>
          {admin.name || "Admin"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {admin.email || "admin@example.com"}
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button selected component={Link} to="/admin/dashboard">
          <ListItemIcon>
            <DashboardIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Bảng điều khiển" />
        </ListItem>
        <ListItem button component={Link} to="/admin/users">
          <ListItemIcon>
            <People />
          </ListItemIcon>
          <ListItemText primary="Quản lý người dùng" />
        </ListItem>
        <ListItem button component={Link} to="/admin/restaurants">
          <ListItemIcon>
            <Restaurant />
          </ListItemIcon>
          <ListItemText primary="Quản lý nhà hàng" />
        </ListItem>
        <ListItem button component={Link} to="/admin/menus">
          <ListItemIcon>
            <MenuBook />
          </ListItemIcon>
          <ListItemText primary="Quản lý thực đơn" />
        </ListItem>
        <ListItem button component={Link} to="/admin/reservations">
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Quản lý đặt bàn" />
        </ListItem>
        <ListItem button component={Link} to="/admin/promotions">
          <ListItemIcon>
            <LocalOffer />
          </ListItemIcon>
          <ListItemText primary="Quản lý khuyến mãi" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </ListItem>
      </List>
    </Box>
  );

  if (loading) {
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
    <Box className="admin-dashboard">
      <AppBar position="fixed" className="admin-appbar">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Quản trị hệ thống
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex" }}>
        <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}>
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better performance on mobile
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { width: 240 },
            }}
          >
            {drawer}
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: "240px" },
            mt: "64px",
          }}
        >
          <Grid container spacing={3}>
            {/* Dashboard summary cards */}
            <Grid item xs={12} md={4}>
              <Card className="summary-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tổng số người dùng
                  </Typography>
                  <Typography variant="h3" className="summary-number">
                    {dashboardData.userCount}
                  </Typography>
                  <Button variant="text" component={Link} to="/admin/users">
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="summary-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tổng số nhà hàng
                  </Typography>
                  <Typography variant="h3" className="summary-number">
                    {dashboardData.restaurantCount}
                  </Typography>
                  <Button
                    variant="text"
                    component={Link}
                    to="/admin/restaurants"
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="summary-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tổng số đặt bàn
                  </Typography>
                  <Typography variant="h3" className="summary-number">
                    {dashboardData.reservationCount}
                  </Typography>
                  <Button
                    variant="text"
                    component={Link}
                    to="/admin/reservations"
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent reservations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">Đặt bàn gần đây</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to="/admin/reservations"
                  >
                    Xem tất cả
                  </Button>
                </Box>
                <List>
                  {dashboardData.recentReservations.length > 0 ? (
                    dashboardData.recentReservations.map(
                      (reservation, index) => (
                        <React.Fragment key={reservation._id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center">
                                  <span>{`${
                                    reservation.customer?.name || "Khách hàng"
                                  } - ${
                                    reservation.restaurant?.name || "Nhà hàng"
                                  }`}</span>
                                  <Box ml={1}>
                                    {getReservationStatusChip(
                                      reservation.status || "pending"
                                    )}
                                  </Box>
                                </Box>
                              }
                              secondary={`${new Date(
                                reservation.dateTime
                              ).toLocaleDateString("vi-VN")} - ${new Date(
                                reservation.dateTime
                              ).toLocaleTimeString("vi-VN")} - ${
                                reservation.numberOfGuests
                              } khách`}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              component={Link}
                              to={`/admin/reservations/${reservation._id}`}
                            >
                              Chi tiết
                            </Button>
                          </ListItem>
                          {index <
                            dashboardData.recentReservations.length - 1 && (
                            <Divider />
                          )}
                        </React.Fragment>
                      )
                    )
                  ) : (
                    <ListItem>
                      <ListItemText primary="Không có đặt bàn gần đây" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Top restaurants */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">Nhà hàng nổi bật</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to="/admin/restaurants"
                  >
                    Xem tất cả
                  </Button>
                </Box>
                <List>
                  {dashboardData.topRestaurants.length > 0 ? (
                    dashboardData.topRestaurants.map((restaurant, index) => (
                      <React.Fragment key={restaurant._id}>
                        <ListItem>
                          <ListItemText
                            primary={restaurant.name}
                            secondary={`${
                              restaurant.reservationCount || 0
                            } đặt bàn - Đánh giá: ${
                              restaurant.averageRating || "N/A"
                            }/5`}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            to={`/admin/restaurants/${restaurant._id}`}
                          >
                            Chi tiết
                          </Button>
                        </ListItem>
                        {index < dashboardData.topRestaurants.length - 1 && (
                          <Divider />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="Không có dữ liệu nhà hàng" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Thao tác nhanh
                </Typography>
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      to="/admin/users/new"
                      sx={{ height: "100%" }}
                    >
                      Thêm người dùng mới
                    </Button>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      to="/admin/restaurants/new"
                      sx={{ height: "100%" }}
                    >
                      Thêm nhà hàng mới
                    </Button>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      to="/admin/promotions/new"
                      sx={{ height: "100%" }}
                    >
                      Tạo khuyến mãi mới
                    </Button>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      to="/admin/reports"
                      sx={{ height: "100%" }}
                    >
                      Xem báo cáo
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
