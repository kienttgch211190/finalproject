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
  Restaurant,
  EventNote,
  Menu as MenuIcon,
  MenuBook,
  ExitToApp,
  AccountCircle,
  LocalDining,
  TableRestaurant,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../contexts/AxiosCustom";
import { toast } from "react-toastify";

// Import CSS
import "../../style/Staff/Dashboard.scss";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    restaurant: null,
    todayReservations: [],
    pendingReservations: [],
    activePromotions: [],
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get staff info from localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch staff's restaurant info
        const staffResponse = await axios.get(`/staff/restaurant/${staff._id}`);
        const restaurantId = staffResponse.data.data?.restaurant?._id;

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
          axios.get(`/restaurant/${restaurantId}`),
          axios.get(`/reservation/restaurant/${restaurantId}/today`),
          axios.get(`/reservation/restaurant/${restaurantId}/pending`),
          axios.get(`/promotion/restaurant/${restaurantId}/active`),
        ]);

        setDashboardData({
          restaurant: restaurantResponse.data.data,
          todayReservations: todayReservationsResponse.data.data || [],
          pendingReservations: pendingReservationsResponse.data.data || [],
          activePromotions: activePromotionsResponse.data.data || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(
          error.message || "Không thể tải dữ liệu. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [staff._id]);

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
          {staff.name || "Staff"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {staff.email || "staff@example.com"}
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button selected component={Link} to="/staff/dashboard">
          <ListItemIcon>
            <DashboardIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Bảng điều khiển" />
        </ListItem>
        <ListItem button component={Link} to="/staff/restaurant">
          <ListItemIcon>
            <Restaurant />
          </ListItemIcon>
          <ListItemText primary="Thông tin nhà hàng" />
        </ListItem>
        <ListItem button component={Link} to="/staff/reservations">
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Đặt bàn" />
        </ListItem>
        <ListItem button component={Link} to="/staff/tables">
          <ListItemIcon>
            <TableRestaurant />
          </ListItemIcon>
          <ListItemText primary="Quản lý bàn" />
        </ListItem>
        <ListItem button component={Link} to="/staff/menu">
          <ListItemIcon>
            <MenuBook />
          </ListItemIcon>
          <ListItemText primary="Thực đơn" />
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
    <Box className="staff-dashboard">
      <AppBar position="fixed" className="staff-appbar">
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
            {dashboardData.restaurant?.name || "Nhà Hàng"}
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
            {/* Restaurant Info Card */}
            <Grid item xs={12}>
              <Card className="restaurant-info-card">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Restaurant sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {dashboardData.restaurant?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dashboardData.restaurant?.address}
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1" color="text.secondary">
                        Giờ mở cửa: {dashboardData.restaurant?.openingTime} -{" "}
                        {dashboardData.restaurant?.closingTime}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1" color="text.secondary">
                        Loại ẩm thực:{" "}
                        {dashboardData.restaurant?.cuisineType || "Đa dạng"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1" color="text.secondary">
                        Liên hệ: {dashboardData.restaurant?.phone}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card className="summary-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Lượt đặt bàn hôm nay
                  </Typography>
                  <Typography variant="h3" className="summary-number">
                    {dashboardData.todayReservations.length}
                  </Typography>
                  <Button
                    variant="text"
                    component={Link}
                    to="/staff/reservations"
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
                    Đặt bàn chờ xác nhận
                  </Typography>
                  <Typography variant="h3" className="summary-number">
                    {dashboardData.pendingReservations.length}
                  </Typography>
                  <Button
                    variant="text"
                    component={Link}
                    to="/staff/reservations/pending"
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
                    Khuyến mãi đang áp dụng
                  </Typography>
                  <Typography variant="h3" className="summary-number">
                    {dashboardData.activePromotions.length}
                  </Typography>
                  <Button
                    variant="text"
                    component={Link}
                    to="/staff/promotions"
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Today's Reservations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Đặt bàn hôm nay
                </Typography>
                <List>
                  {dashboardData.todayReservations.length > 0 ? (
                    dashboardData.todayReservations.map(
                      (reservation, index) => (
                        <React.Fragment key={reservation._id}>
                          <ListItem>
                            <ListItemIcon>
                              <AssignmentTurnedIn />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${
                                reservation.customer?.name || "Khách hàng"
                              } - ${new Date(
                                reservation.dateTime
                              ).toLocaleTimeString("vi-VN")}`}
                              secondary={`${
                                reservation.numberOfGuests
                              } khách - Bàn ${
                                reservation.table?.tableNumber || "N/A"
                              }`}
                            />
                            {getReservationStatusChip(reservation.status)}
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1 }}
                              component={Link}
                              to={`/staff/reservation/${reservation._id}`}
                            >
                              Chi tiết
                            </Button>
                          </ListItem>
                          {index <
                            dashboardData.todayReservations.length - 1 && (
                            <Divider />
                          )}
                        </React.Fragment>
                      )
                    )
                  ) : (
                    <ListItem>
                      <ListItemText primary="Không có đặt bàn nào hôm nay" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Pending Reservations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Đặt bàn chờ xác nhận
                </Typography>
                <List>
                  {dashboardData.pendingReservations.length > 0 ? (
                    dashboardData.pendingReservations.map(
                      (reservation, index) => (
                        <React.Fragment key={reservation._id}>
                          <ListItem>
                            <ListItemIcon>
                              <LocalDining />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${
                                reservation.customer?.name || "Khách hàng"
                              }`}
                              secondary={`${new Date(
                                reservation.dateTime
                              ).toLocaleDateString("vi-VN")} - ${new Date(
                                reservation.dateTime
                              ).toLocaleTimeString("vi-VN")} - ${
                                reservation.numberOfGuests
                              } khách`}
                            />
                            <Box>
                              <Button
                                size="small"
                                color="success"
                                variant="contained"
                                sx={{ mr: 1 }}
                                onClick={() => {
                                  // Handle confirm action
                                  toast.info("Chức năng đang phát triển");
                                }}
                              >
                                Xác nhận
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="contained"
                                onClick={() => {
                                  // Handle reject action
                                  toast.info("Chức năng đang phát triển");
                                }}
                              >
                                Từ chối
                              </Button>
                            </Box>
                          </ListItem>
                          {index <
                            dashboardData.pendingReservations.length - 1 && (
                            <Divider />
                          )}
                        </React.Fragment>
                      )
                    )
                  ) : (
                    <ListItem>
                      <ListItemText primary="Không có đặt bàn nào đang chờ xác nhận" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Active Promotions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Khuyến mãi đang áp dụng
                </Typography>
                <Grid container spacing={2}>
                  {dashboardData.activePromotions.length > 0 ? (
                    dashboardData.activePromotions.map((promotion) => (
                      <Grid item xs={12} md={4} key={promotion._id}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {promotion.title}
                            </Typography>
                            <Typography variant="body2">
                              {promotion.description}
                            </Typography>
                            <Box
                              mt={2}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Chip
                                label={`Giảm ${promotion.discountPercent}%`}
                                color="primary"
                              />
                              <Typography variant="caption">
                                Hết hạn:{" "}
                                {new Date(promotion.endDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography>
                        Không có khuyến mãi nào đang áp dụng
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default StaffDashboard;
