import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  TimePicker,
  Tag,
  Space,
  message,
  Image,
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
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  DollarOutlined,
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
import "../../style/Admin/RestaurantMana.scss";

const { Option } = Select;
const { TextArea } = Input;

const priceRangeLabels = {
  low: "Giá rẻ",
  medium: "Vừa phải",
  high: "Cao cấp",
};

const priceRangeColors = {
  low: "success",
  medium: "processing",
  high: "warning",
};

const RestaurantMana = () => {
  // States
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [form] = Form.useForm();

  // Cuisine types for dropdown
  const cuisineTypes = [
    "Việt Nam",
    "Ý",
    "Nhật Bản",
    "Hàn Quốc",
    "Trung Quốc",
    "Thái Lan",
    "Pháp",
    "Hải sản",
    "Đồ nướng",
    "Buffet",
    "Fast food",
    "Chay",
    "Khác",
  ];

  // Load restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/restaurant");

      if (response.data.status === "Success") {
        setRestaurants(response.data.data || []);
      } else {
        message.error("Không thể tải danh sách nhà hàng");
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      message.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (restaurant) => {
    setSelectedRestaurant(restaurant);

    form.setFieldsValue({
      name: restaurant.name,
      address: restaurant.address,
      cuisineType: restaurant.cuisineType,
      description: restaurant.description || "",
      openingTime: moment(restaurant.openingTime, "HH:mm"),
      closingTime: moment(restaurant.closingTime, "HH:mm"),
      priceRange: restaurant.priceRange || "medium",
      phone: restaurant.phone || "",
      imageUrl: restaurant.imageUrl || "",
    });

    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedRestaurant(null);
    form.resetFields();
    form.setFieldsValue({
      priceRange: "medium",
      openingTime: moment("08:00", "HH:mm"),
      closingTime: moment("22:00", "HH:mm"),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formattedValues = {
        ...values,
        openingTime: values.openingTime?.format("HH:mm") || "08:00",
        closingTime: values.closingTime?.format("HH:mm") || "22:00",
      };

      if (selectedRestaurant) {
        const token = localStorage.getItem("accessToken");
        const response = await axiosInstance.put(
          `/restaurant/update/${selectedRestaurant._id}`,
          formattedValues,
          {
             headers: {
                      Authorization: `Bearer ${token}`, 
              },
          }
        );

        if (response.data.status === "Success") {
          message.success("Cập nhật nhà hàng thành công");
          setRestaurants(
            restaurants.map((r) =>
              r._id === selectedRestaurant._id ? response.data.data : r
            )
          );
          setIsModalOpen(false);
        } else {
          message.error("Không thể cập nhật nhà hàng");
        }
      } else {
        // Create mode
        const response = await axiosInstance.post(
          "/restaurant/create",
          formattedValues,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.data.status === "Success") {
          message.success("Tạo nhà hàng mới thành công");
          setRestaurants([...restaurants, response.data.data]);
          setIsModalOpen(false);
        } else {
          message.error("Không thể tạo nhà hàng mới");
        }
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa nhà hàng này? Tất cả dữ liệu liên quan cũng sẽ bị xóa."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/restaurant/delete/${id}`,
        {
          headers: {
             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
           },
       }
      );

      if (response.data.status === "Success") {
        message.success("Xóa nhà hàng thành công");
        setRestaurants(restaurants.filter((r) => r._id !== id));
      } else {
        message.error("Không thể xóa nhà hàng");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  // Filter restaurants by search term
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (restaurant.name || "").toLowerCase().includes(searchLower) ||
      (restaurant.address || "").toLowerCase().includes(searchLower) ||
      (restaurant.cuisineType || "").toLowerCase().includes(searchLower)
    );
  });

  // Table columns
  const columns = [
    {
      title: "Nhà hàng",
      key: "restaurant",
      render: (_, record) => (
        <Space>
          {record.imageUrl ? (
            <Image
              src={record.imageUrl}
              alt={record.name}
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                borderRadius: 4,
              }}
              fallback="data:image/png;base64,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"
            />
          ) : (
            <ShopOutlined style={{ fontSize: 24, marginRight: 8 }} />
          )}
          <span>{record.name}</span>
        </Space>
      ),
      filteredValue: [searchTerm],
      onFilter: () => true, // Filter is applied in the filteredRestaurants logic
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <Space>
          <EnvironmentOutlined />
          <span>{address}</span>
        </Space>
      ),
    },
    {
      title: "Loại ẩm thực",
      dataIndex: "cuisineType",
      key: "cuisineType",
    },
    {
      title: "Giờ hoạt động",
      key: "operationHours",
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          <span>
            {record.openingTime || "08:00"} - {record.closingTime || "22:00"}
          </span>
        </Space>
      ),
    },
    {
      title: "Mức giá",
      dataIndex: "priceRange",
      key: "priceRange",
      render: (priceRange) => (
        <Tag color={priceRangeColors[priceRange || "medium"]}>
          {priceRangeLabels[priceRange || "medium"]}
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
        className="restaurant-management"
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
          <Typography color="textPrimary">Quản lý Nhà hàng</Typography>
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
            Quản lý Nhà hàng
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Tạo nhà hàng
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchRestaurants}
              loading={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên nhà hàng, địa chỉ hoặc loại ẩm thực..."
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
          dataSource={filteredRestaurants}
          rowKey="_id"
          loading={loading}
          bordered
          pagination={{ pageSize: 7 }}
          style={{ marginTop: 16 }}
          locale={{
            emptyText: searchTerm
              ? "Không tìm thấy nhà hàng nào phù hợp"
              : "Chưa có nhà hàng nào",
          }}
        />

        {/* Form Modal */}
        <Modal
          title={selectedRestaurant ? "Chỉnh sửa nhà hàng" : "Tạo nhà hàng mới"}
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
              priceRange: "medium",
            }}
          >
            <Form.Item
              name="name"
              label="Tên nhà hàng"
              rules={[
                { required: true, message: "Vui lòng nhập tên nhà hàng" },
              ]}
            >
              <Input
                prefix={<ShopOutlined />}
                placeholder="Nhập tên nhà hàng"
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input
                prefix={<EnvironmentOutlined />}
                placeholder="Nhập địa chỉ nhà hàng"
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
                name="cuisineType"
                label="Loại ẩm thực"
                rules={[
                  { required: true, message: "Vui lòng chọn loại ẩm thực" },
                ]}
                style={{ width: "48%" }}
              >
                <Select placeholder="Chọn loại ẩm thực">
                  {cuisineTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="priceRange"
                label="Mức giá"
                rules={[{ required: true, message: "Vui lòng chọn mức giá" }]}
                style={{ width: "48%" }}
              >
                <Select placeholder="Chọn mức giá">
                  <Option value="low">
                    <Tag color="success">Giá rẻ</Tag>
                  </Option>
                  <Option value="medium">
                    <Tag color="processing">Vừa phải</Tag>
                  </Option>
                  <Option value="high">
                    <Tag color="warning">Cao cấp</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Space>

            <Space
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Form.Item
                name="openingTime"
                label="Giờ mở cửa"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ mở cửa" },
                ]}
                style={{ width: "48%" }}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="closingTime"
                label="Giờ đóng cửa"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ đóng cửa" },
                ]}
                style={{ width: "48%" }}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Space>

            <Form.Item name="phone" label="Số điện thoại">
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại nhà hàng"
              />
            </Form.Item>

            <Form.Item name="imageUrl" label="URL hình ảnh">
              <Input placeholder="Nhập URL hình ảnh nhà hàng" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} placeholder="Nhập mô tả về nhà hàng" />
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
                {selectedRestaurant ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>
      </Paper>
    </Container>
  );
};

export default RestaurantMana;
