import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Typography,
  Breadcrumbs,
  Box,
  Paper,
  Container,
  Button,
  Chip, // Thay thế Tag
  Stack, // Thay thế Space
  Alert, // Để hiển thị thông báo lỗi
} from "@mui/material";
import {
  ReloadOutlined,
  CalendarOutlined,
  PercentageOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  Table,
  Input,
  DatePicker,
  Button as AntButton,
  Spin,
  Empty,
  message, // Di chuyển message từ MUI sang Ant Design
  Space,
  Tag,
} from "antd";
import moment from "moment";
import { NavigateNext } from "@mui/icons-material";

import axiosInstance from "../../contexts/AxiosCustom";

const StaffPromotion = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [restaurant, setRestaurant] = useState(null);

  // Get staff info from localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");

  // Auth config
  const token = localStorage.getItem("accessToken");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Load data on component mount
  useEffect(() => {
    fetchStaffRestaurant();
  }, []);

  // Load promotions when restaurant is fetched
  useEffect(() => {
    if (restaurant?._id) {
      fetchPromotions();
    }
  }, [restaurant]);

  // Fetch staff's restaurant
  const fetchStaffRestaurant = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/staff/restaurant/${staff._id}`,
        config
      );

      if (response.data.status === "Success") {
        // Handle potential nested data structure
        if (response.data.data && response.data.data.restaurant) {
          setRestaurant(response.data.data.restaurant);
        } else if (
          response.data.data &&
          response.data.data[0] &&
          response.data.data[0].restaurant
        ) {
          setRestaurant(response.data.data[0].restaurant);
        } else {
          message.error("No restaurant assigned to this staff");
        }
      } else {
        message.error("Failed to fetch restaurant information");
      }
    } catch (error) {
      console.error("Error fetching staff restaurant:", error);
      message.error("Cannot load restaurant information");
    } finally {
      setLoading(false);
    }
  };

  // Fetch promotions for the restaurant
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      // Use the correct endpoint with restaurant ID
      const response = await axiosInstance.get(
        `/promotion/restaurant/${restaurant._id}`,
        config
      );

      if (response.data.status === "Success") {
        setPromotions(response.data.data || []);
      } else {
        message.error("Failed to load promotions");
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      message.error("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  // Check if a promotion is active
  const isPromotionActive = (promotion) => {
    const today = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return promotion.isActive && today >= startDate && today <= endDate;
  };

  // Handle search and filtering
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle date range filter
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateRange([null, null]);
  };

  // Filter promotions based on search and date range
  const filteredPromotions = promotions.filter((promo) => {
    // Search filter
    const matchesSearch = searchTerm
      ? promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Date range filter
    let matchesDateRange = true;
    if (dateRange[0] && dateRange[1]) {
      const promoStart = moment(promo.startDate);
      const promoEnd = moment(promo.endDate);
      const filterStart = moment(dateRange[0]);
      const filterEnd = moment(dateRange[1]);

      // Check if date ranges overlap
      matchesDateRange =
        promoStart.isSameOrBefore(filterEnd) &&
        promoEnd.isSameOrAfter(filterStart);
    }

    return matchesSearch && matchesDateRange;
  });

  // Column definition for the table
  const columns = [
    {
      title: "Khuyến mãi",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <strong>{text || record.title}</strong>
          <div style={{ marginTop: 4, color: "rgba(0, 0, 0, 0.45)" }}>
            {record.description || "Không có mô tả"}
          </div>
        </div>
      ),
    },
    {
      title: "Chiết khấu",
      dataIndex: "discountPercent",
      key: "discountPercent",
      render: (value) => (
        <Space>
          <PercentageOutlined />
          <span>{value || 0}%</span>
        </Space>
      ),
    },
    {
      title: "Thời gian",
      key: "period",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <div>
            <CalendarOutlined /> Bắt đầu:{" "}
            {moment(record.startDate).format("DD/MM/YYYY")}
          </div>
          <div>
            <CalendarOutlined /> Kết thúc:{" "}
            {moment(record.endDate).format("DD/MM/YYYY")}
          </div>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={isPromotionActive(record) ? "success" : "error"}>
          {isPromotionActive(record) ? "ĐANG HOẠT ĐỘNG" : "HẾT HẠN"}
        </Tag>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" style={{ marginTop: 24, marginBottom: 24 }}>
      <Paper elevation={3} style={{ padding: 24, borderRadius: "8px" }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            to="/staff/dashboard"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Dashboard
          </Link>
          <Typography color="textPrimary">Khuyến mãi</Typography>
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
            Khuyến mãi {restaurant?.name ? `- ${restaurant.name}` : ""}
          </Typography>
          <AntButton
            type="default"
            icon={<ReloadOutlined />}
            onClick={fetchPromotions}
            loading={loading}
          >
            Làm mới
          </AntButton>
        </Box>

        {/* Restaurant Info */}
        {restaurant && (
          <Card style={{ marginBottom: 16, padding: 16 }}>
            <Typography variant="h6">{restaurant.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {restaurant.address}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {restaurant.cuisineType} • {restaurant.openingTime || "08:00"} -{" "}
              {restaurant.closingTime || "22:00"}
            </Typography>
          </Card>
        )}

        {/* Search and Filters */}
        <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Input.Search
            placeholder="Tìm kiếm khuyến mãi..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
          <AntButton icon={<FilterOutlined />} onClick={clearFilters}>
            Xóa bộ lọc
          </AntButton>
        </Box>

        {/* Promotions Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : filteredPromotions.length > 0 ? (
          <Table
            dataSource={filteredPromotions}
            columns={columns}
            rowKey={(record) => record._id || Math.random().toString(36)}
            pagination={{ pageSize: 10 }}
            bordered
          />
        ) : (
          <Empty
            description={
              searchTerm || (dateRange[0] && dateRange[1])
                ? "Không tìm thấy khuyến mãi nào phù hợp với tiêu chí"
                : "Không tìm thấy khuyến mãi nào cho nhà hàng này"
            }
          />
        )}
      </Paper>
    </Container>
  );
};

export default StaffPromotion;
