import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../contexts/AxiosCustom";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Rating,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  Restaurant as RestaurantIcon,
  DateRange,
  Schedule,
  AttachMoney,
  FilterList,
  People,
  LocationOn,
  Fastfood,
} from "@mui/icons-material";

// Import CSS
import "../../style/Homepage/Homepage.scss";

const Homepage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [filters, setFilters] = useState({
    cuisineType: "",
    priceRange: "",
    searchTerm: "",
  });
  const [reservationParams, setReservationParams] = useState({
    date: "",
    time: "",
    guests: 2,
  });
  const [showFilters, setShowFilters] = useState(!isMobile);

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
          let filteredRestaurants = restaurantsResponse.data.data;

          // Apply search term filter
          if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredRestaurants = filteredRestaurants.filter(
              (restaurant) =>
                restaurant.name.toLowerCase().includes(searchLower) ||
                restaurant.cuisineType?.toLowerCase().includes(searchLower) ||
                restaurant.address?.toLowerCase().includes(searchLower)
            );
          }

          setRestaurants(filteredRestaurants);
        }

        if (promotionsResponse.data.status === "Success") {
          setPromotions(promotionsResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.cuisineType, filters.priceRange, filters.searchTerm]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReservationParamChange = (event) => {
    const { name, value } = event.target;
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
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleStartReservation = (restaurantId) => {
    const { date, time, guests } = reservationParams;
    if (!date || !time) {
      toast.warning("Vui lòng chọn ngày và giờ đặt bàn");
      return;
    }
    navigate(`/reservation/new`, {
      state: {
        restaurantId,
        date,
        time,
        guests,
      },
    });
  };

  // Format price range for display
  const formatPriceRange = (range) => {
    switch (range) {
      case "low":
        return (
          <>
            <AttachMoney />
          </>
        );
      case "medium":
        return (
          <>
            <AttachMoney />
            <AttachMoney />
          </>
        );
      case "high":
        return (
          <>
            <AttachMoney />
            <AttachMoney />
            <AttachMoney />
          </>
        );
      default:
        return (
          <>
            <AttachMoney />
          </>
        );
    }
  };

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
    <Box className="homepage-container">
      {/* Hero Section */}
      <Box className="hero-section">
        <Container>
          <Typography variant="h3" component="h1" className="hero-title">
            Đặt bàn dễ dàng tại nhà hàng bạn yêu thích
          </Typography>
          <Typography variant="h6" className="hero-subtitle">
            Trải nghiệm ẩm thực tuyệt vời chỉ với vài cú nhấp chuột
          </Typography>

          <Paper elevation={3} className="search-container">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="Tìm kiếm nhà hàng..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  name="date"
                  value={reservationParams.date}
                  onChange={handleReservationParamChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  type="time"
                  name="time"
                  value={reservationParams.time}
                  onChange={handleReservationParamChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Schedule />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="guests-label">Số khách</InputLabel>
                  <Select
                    labelId="guests-label"
                    name="guests"
                    value={reservationParams.guests}
                    onChange={handleReservationParamChange}
                    startAdornment={<People sx={{ mr: 1 }} />}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} người
                      </MenuItem>
                    ))}
                    <MenuItem value={11}>10+ người</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  className="search-button"
                  startIcon={<Search />}
                  onClick={() => {
                    if (restaurants.length > 0) {
                      handleStartReservation(restaurants[0]._id);
                    } else {
                      toast.info("Không tìm thấy nhà hàng phù hợp");
                    }
                  }}
                >
                  Tìm bàn
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Main Content */}
      <Container className="main-content">
        {/* Promotions Section */}
        {promotions.length > 0 && (
          <Box mt={4} mb={6}>
            <Typography variant="h4" component="h2" gutterBottom>
              Khuyến mãi đặc biệt
            </Typography>
            <Grid container spacing={3}>
              {promotions.slice(0, 3).map((promotion) => (
                <Grid item xs={12} md={4} key={promotion._id}>
                  <Paper
                    elevation={3}
                    className="promotion-card"
                    onClick={() =>
                      handleRestaurantClick(promotion.restaurant._id)
                    }
                  >
                    <Box className="promotion-discount">
                      <Typography variant="h5">
                        {promotion.discountPercent}%
                      </Typography>
                    </Box>
                    <Box p={2}>
                      <Typography variant="h6" gutterBottom>
                        {promotion.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {promotion.description}
                      </Typography>
                      <Box mt={1} display="flex" alignItems="center">
                        <RestaurantIcon
                          sx={{ fontSize: 18, mr: 0.5 }}
                          color="primary"
                        />
                        <Typography variant="subtitle2">
                          {promotion.restaurant?.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        display="block"
                        color="textSecondary"
                      >
                        Có hiệu lực đến:{" "}
                        {new Date(promotion.endDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Filter Toggle Button (Mobile) */}
        {isMobile && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mb: 2 }}
          >
            {showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
          </Button>
        )}

        {/* Restaurant List Section */}
        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Nhà hàng
          </Typography>

          <Grid container spacing={3}>
            {/* Filter Sidebar */}
            {showFilters && (
              <Grid item xs={12} md={3} lg={2}>
                <Paper elevation={3} className="filter-sidebar">
                  <Typography variant="h6" gutterBottom>
                    Bộ lọc
                  </Typography>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Loại ẩm thực</InputLabel>
                    <Select
                      name="cuisineType"
                      value={filters.cuisineType}
                      onChange={handleFilterChange}
                      startAdornment={<Fastfood sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="vietnamese">Việt Nam</MenuItem>
                      <MenuItem value="italian">Ý</MenuItem>
                      <MenuItem value="japanese">Nhật Bản</MenuItem>
                      <MenuItem value="korean">Hàn Quốc</MenuItem>
                      <MenuItem value="chinese">Trung Hoa</MenuItem>
                      <MenuItem value="thai">Thái Lan</MenuItem>
                      <MenuItem value="french">Pháp</MenuItem>
                      <MenuItem value="american">Mỹ</MenuItem>
                      <MenuItem value="seafood">Hải sản</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Mức giá</InputLabel>
                    <Select
                      name="priceRange"
                      value={filters.priceRange}
                      onChange={handleFilterChange}
                      startAdornment={<AttachMoney sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="low">Thấp</MenuItem>
                      <MenuItem value="medium">Trung bình</MenuItem>
                      <MenuItem value="high">Cao</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleClearFilters}
                    sx={{ mt: 2 }}
                  >
                    Xóa bộ lọc
                  </Button>
                </Paper>
              </Grid>
            )}

            {/* Restaurant Cards */}
            <Grid
              item
              xs={12}
              md={showFilters ? 9 : 12}
              lg={showFilters ? 10 : 12}
            >
              {restaurants.length === 0 ? (
                <Paper elevation={3} className="no-results">
                  <Typography align="center">
                    Không tìm thấy nhà hàng phù hợp với yêu cầu của bạn.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {restaurants.map((restaurant) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={6}
                      lg={4}
                      key={restaurant._id}
                    >
                      <Card
                        className="restaurant-card"
                        onClick={() => handleRestaurantClick(restaurant._id)}
                      >
                        <CardMedia
                          component="img"
                          height="180"
                          image={`https://source.unsplash.com/random/?restaurant,${
                            restaurant.cuisineType || "food"
                          }`}
                          alt={restaurant.name}
                        />
                        <CardContent>
                          <Typography gutterBottom variant="h6" component="h3">
                            {restaurant.name}
                          </Typography>

                          <Box display="flex" alignItems="center" mb={1}>
                            <Rating
                              value={4.5}
                              precision={0.5}
                              size="small"
                              readOnly
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              ml={1}
                            >
                              4.5 (120)
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            <Fastfood
                              fontSize="small"
                              sx={{ verticalAlign: "middle", mr: 1 }}
                            />
                            {restaurant.cuisineType || "Đa dạng"}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            <LocationOn
                              fontSize="small"
                              sx={{ verticalAlign: "middle", mr: 1 }}
                            />
                            {restaurant.address}
                          </Typography>

                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mt={1}
                          >
                            <Chip
                              label={formatPriceRange(restaurant.priceRange)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {restaurant.openingTime} -{" "}
                                {restaurant.closingTime}
                              </Typography>
                            </Box>
                          </Box>

                          <Button
                            variant="contained"
                            fullWidth
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartReservation(restaurant._id);
                            }}
                          >
                            Đặt bàn
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Homepage;
