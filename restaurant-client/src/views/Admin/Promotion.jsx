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

// Import axios instance
import axiosInstance from "../../contexts/AxiosCustom";

const PromotionPage = () => {
  // State
  const [promotions, setPromotions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [form] = Form.useForm();

  // Fetch promotions on component mount
  useEffect(() => {
    fetchPromotions();
    fetchRestaurants();
  }, []);

  // Fetch all promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      // Get all restaurants first to fetch their promotions
      const restaurantsResponse = await axiosInstance.get("/restaurant", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (restaurantsResponse.data.status === "Success") {
        const restaurants = restaurantsResponse.data.data || [];
        
        // For each restaurant, fetch its promotions
        const promotionsPromises = restaurants.map(restaurant => 
          axiosInstance.get(`/promotion/restaurant/${restaurant._id}?includeExpired=true`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        );
        
        const promotionsResponses = await Promise.all(promotionsPromises);
        
        // Combine all promotions into a single array
        let allPromotions = [];
        promotionsResponses.forEach((response, index) => {
          if (response.data.status === "Success") {
            // Add restaurant information to each promotion
            const promotionsWithRestaurant = (response.data.data || []).map(promo => ({
              ...promo,
              restaurantName: restaurants[index].name
            }));
            allPromotions = [...allPromotions, ...promotionsWithRestaurant];
          }
        });
        
        setPromotions(allPromotions);
      } else {
        message.error("Không thể tải danh sách nhà hàng");
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      message.error("Không thể tải danh sách khuyến mãi: " + (error.response?.data?.message || error.message));
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
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.status === "Success") {
        setRestaurants(response.data.data || []);
      } else {
        message.error("Không thể tải danh sách nhà hàng");
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      // Format values
      const formattedData = {
        restaurant: values.restaurant,
        title: values.name,
        description: values.description || "",
        discountPercent: values.type === "percentage" ? values.value : values.value,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        isActive: true
      };
      
      if (selectedPromotion) {
        // Update promotion
        const response = await axiosInstance.put(
          `/promotion/${selectedPromotion._id}`,
          formattedData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.status === "Success") {
          message.success("Cập nhật khuyến mãi thành công!");
          fetchPromotions(); // Refresh data
          setIsModalOpen(false);
        } else {
          message.error("Không thể cập nhật khuyến mãi: " + response.data.message);
        }
      } else {
        // Create promotion
        const response = await axiosInstance.post(
          "/promotion",
          formattedData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.status === "Success") {
          message.success("Tạo khuyến mãi mới thành công!");
          fetchPromotions(); // Refresh data
          setIsModalOpen(false);
        } else {
          message.error("Không thể tạo khuyến mãi mới: " + response.data.message);
        }
      }
    } catch (error) {
      console.error("Error saving promotion:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await axiosInstance.delete(`/promotion/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.status === "Success") {
        message.success("Xóa khuyến mãi thành công!");
        setPromotions(promotions.filter(promo => promo._id !== id));
      } else {
        message.error("Không thể xóa khuyến mãi: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Check if promotion is active
  const isPromotionActive = (promotion) => {
    const currentDate = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    return promotion.isActive && startDate <= currentDate && endDate >= currentDate;
  };

  // Table columns
  const columns = [
    {
      title: "Nhà hàng",
      dataIndex: "restaurantName",
      key: "restaurantName",
      render: (text, record) => 
        record.restaurant?.name || text || "Không có thông tin",
    },
    {
      title: "Tên Khuyến mãi",
      dataIndex: "title",
      key: "title",
      filteredValue: searchTerm ? [searchTerm] : null,
      onFilter: (value, record) =>
        (record.title?.toLowerCase() || "").includes(value.toLowerCase()) ||
        (record.restaurantName?.toLowerCase() || "").includes(value.toLowerCase()),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountPercent",
      key: "discountPercent",
      render: (value) => `${value}%`,
    },
    {
      title: "Thời gian",
      key: "period",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <small>
            Từ: {moment(record.startDate).format("DD/MM/YYYY")}
          </small>
          <small>
            Đến: {moment(record.endDate).format("DD/MM/YYYY")}
          </small>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={isPromotionActive(record) ? "green" : "red"}>
          {isPromotionActive(record) ? "ĐANG HOẠT ĐỘNG" : "HẾT HẠN"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedPromotion(record);
              form.setFieldsValue({
                restaurant: record.restaurant?._id || record.restaurant,
                name: record.title,
                description: record.description || "",
                type: "percentage", // Always percentage in your model
                value: record.discountPercent,
                startDate: moment(record.startDate),
                endDate: moment(record.endDate),
              });
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Filter promotions by search term
  const filteredPromotions = searchTerm
    ? promotions.filter(
        (promo) =>
          promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : promotions;

  return (
    <Container maxWidth="lg" style={{ marginTop: 24, marginBottom: 24 }}>
      <Paper elevation={3} style={{ padding: 24, borderRadius: "8px" }}>
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
          <Typography color="textPrimary">Quản lý Khuyến Mãi</Typography>
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
            Quản lý Khuyến Mãi
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setSelectedPromotion(null);
                setIsModalOpen(true);
              }}
            >
              Thêm Khuyến Mãi
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchPromotions}
              loading={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên khuyến mãi, nhà hàng..."
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
          dataSource={filteredPromotions}
          rowKey="_id"
          loading={loading}
          bordered
          pagination={{ pageSize: 5 }}
          style={{ marginTop: 16 }}
        />

        {/* Form Modal */}
        <Modal
          title={
            selectedPromotion ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ type: "percentage" }}
          >
            <Form.Item
              name="restaurant"
              label="Nhà hàng"
              rules={[{ required: true, message: "Vui lòng chọn nhà hàng" }]}
            >
              <Select 
                placeholder="Chọn nhà hàng" 
                disabled={selectedPromotion}
              >
                {restaurants.map(restaurant => (
                  <Select.Option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Tên khuyến mãi"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên khuyến mãi" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="Loại khuyến mãi"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại" }]}
            >
              <Select
                options={[
                  { label: "Phần trăm", value: "percentage" },
                ]}
                disabled // Always percentage in your model
              />
            </Form.Item>

            <Form.Item
              label="Phần trăm giảm giá"
              name="value"
              rules={[
                { required: true, message: "Vui lòng nhập giá trị" },
                { type: "number", min: 1, max: 100, message: "Giá trị từ 1-100%" }
              ]}
            >
              <InputNumber min={1} max={100} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Thời gian áp dụng" required>
              <Space.Compact style={{ display: 'flex' }}>
                <Form.Item
                  name="startDate"
                  rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
                  style={{ marginBottom: 0, width: '45%' }}
                >
                  <DatePicker 
                    placeholder="Ngày bắt đầu" 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
                <span style={{ margin: "0 8px", display: 'inline-flex', alignItems: 'center' }}>đến</span>
                <Form.Item
  name="endDate"
  rules={[
    { required: true, message: "Chọn ngày kết thúc" },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || !getFieldValue('startDate')) {
          return Promise.resolve();
        }
        // Use moment's isAfter or isSameOrAfter correctly
        if (moment(value).isSameOrAfter(getFieldValue('startDate'))) {
          return Promise.resolve();
        }
        return Promise.reject(
          "Ngày kết thúc phải sau ngày bắt đầu"
        );
      },
    }),
  ]}
  style={{ marginBottom: 0, width: '45%' }}
>
  <DatePicker 
    placeholder="Ngày kết thúc" 
    style={{ width: '100%' }}
    format="DD/MM/YYYY"
  />
</Form.Item>
                  
                  
              </Space.Compact>
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
                {selectedPromotion ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>
      </Paper>
    </Container>
  );
};

export default PromotionPage;