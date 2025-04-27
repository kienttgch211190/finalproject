import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Switch,
  Space,
  Card,
  message,
  Tooltip,
} from "antd";
import { Link } from "react-router-dom";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TableOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
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
import "../../style/Staff/TableMana.scss";

const { Option } = Select;

const TableMana = () => {
  // State
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [form] = Form.useForm();
  const [restaurant, setRestaurant] = useState(null);
  const [tableAreas, setTableAreas] = useState([
    "Trong nhà",
    "Ngoài trời",
    "Tầng 1",
    "Tầng 2",
    "VIP",
    "Ban công",
    "Khu vực hút thuốc",
    "Khu vực không hút thuốc",
  ]);

  // Lấy thông tin staff từ localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Lấy thông tin nhà hàng của staff
    const fetchStaffRestaurant = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/staff/restaurant/${staff._id}`
        );

        if (
          response.data.status === "Success" &&
          response.data.data?.restaurant
        ) {
          setRestaurant(response.data.data.restaurant);
          // Sau khi có restaurant ID, lấy danh sách bàn
          fetchTables(response.data.data.restaurant._id);
        } else {
          message.error("Bạn chưa được gán cho nhà hàng nào");
        }
      } catch (error) {
        console.error("Error fetching staff restaurant:", error);
        message.error("Không thể lấy thông tin nhà hàng");
      }
    };

    fetchStaffRestaurant();
  }, [staff._id]);

  const fetchTables = async (restaurantId) => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/table/byRestaurant/${restaurantId}`
      );

      if (response.data.status === "Success") {
        setTables(response.data.data || []);
      } else {
        message.error("Không thể tải danh sách bàn");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      message.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedTable(null);

    form.resetFields();
    form.setFieldsValue({
      isAvailable: true,
      restaurant: restaurant?._id,
      area: "Trong nhà",
    });

    setIsModalOpen(true);
  };

  const openEditModal = (table) => {
    setSelectedTable(table);

    form.setFieldsValue({
      name: table.name,
      capacity: table.capacity,
      area: table.area || "Trong nhà",
      isAvailable: table.isAvailable,
      description: table.description,
      restaurant: table.restaurant || restaurant?._id,
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    if (!restaurant?._id) {
      message.error("Không có thông tin nhà hàng");
      return;
    }

    try {
      setLoading(true);

      // Đảm bảo có restaurantId
      const tableData = {
        ...values,
        restaurant: restaurant._id,
      };

      if (selectedTable) {
        // Edit mode
        const response = await axiosInstance.put(
          `/api/table/${selectedTable._id}`,
          tableData
        );

        if (response.data.status === "Success") {
          message.success("Cập nhật bàn thành công!");
          // Update table in state
          setTables(
            tables.map((t) =>
              t._id === selectedTable._id ? response.data.data : t
            )
          );
          setIsModalOpen(false);
        } else {
          message.error("Không thể cập nhật bàn: " + response.data.message);
        }
      } else {
        // Create mode
        const response = await axiosInstance.post("/api/table", tableData);

        if (response.data.status === "Success") {
          message.success("Tạo bàn mới thành công!");

          if (response.data.data) {
            setTables([...tables, response.data.data]);
          } else {
            // Nếu không có data, refresh danh sách
            fetchTables(restaurant._id);
          }
          setIsModalOpen(false);
        } else {
          message.error("Không thể tạo bàn mới: " + response.data.message);
        }
      }
    } catch (error) {
      console.error("Error saving table:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tableId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa bàn này? Dữ liệu đã xóa không thể khôi phục."
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.delete(`/api/table/${tableId}`);

      if (response.data.status === "Success") {
        message.success("Xóa bàn thành công!");
        // Remove table from state
        setTables(tables.filter((table) => table._id !== tableId));
      } else {
        message.error("Không thể xóa bàn: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (tableId, currentAvailability) => {
    try {
      const response = await axiosInstance.patch(
        `/api/table/${tableId}/availability`,
        {
          isAvailable: !currentAvailability,
        }
      );

      if (response.data.status === "Success") {
        setTables(
          tables.map((table) =>
            table._id === tableId
              ? { ...table, isAvailable: !currentAvailability }
              : table
          )
        );

        message.success(
          `Bàn ${response.data.data.name} đã ${
            !currentAvailability ? "sẵn sàng" : "không sẵn sàng"
          }`
        );
      } else {
        message.error("Không thể cập nhật trạng thái bàn");
      }
    } catch (error) {
      console.error("Error updating table availability:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  // Filter tables based on search term
  const filteredTables = tables.filter(
    (table) =>
      table.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.capacity?.toString().includes(searchTerm)
  );

  // Table columns
  const columns = [
    {
      title: "Tên bàn",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <TableOutlined />
          <span>{text}</span>
        </Space>
      ),
      filteredValue: [searchTerm],
      onFilter: () => true, // Filter is applied in the filteredTables logic
    },
    {
      title: "Khu vực",
      dataIndex: "area",
      key: "area",
      render: (area) => area || "Trong nhà",
    },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) => (
        <Space>
          <UserOutlined />
          <span>{capacity} người</span>
        </Space>
      ),
      sorter: (a, b) => a.capacity - b.capacity,
    },
    {
      title: "Trạng thái",
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (isAvailable, record) => (
        <Switch
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
          checked={isAvailable}
          onChange={() => handleToggleAvailability(record._id, isAvailable)}
        />
      ),
      filters: [
        { text: "Sẵn sàng", value: true },
        { text: "Không sẵn sàng", value: false },
      ],
      onFilter: (value, record) => record.isAvailable === value,
      render: (isAvailable) => (
        <Tag color={isAvailable ? "success" : "error"}>
          {isAvailable ? "Sẵn sàng" : "Không sẵn sàng"}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (description) =>
        description ? (
          <Tooltip placement="topLeft" title={description}>
            {description}
          </Tooltip>
        ) : (
          <span className="text-muted">Không có mô tả</span>
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
        className="table-management"
      >
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <MuiLink
            component={Link}
            to="/staff/dashboard"
            color="inherit"
            underline="hover"
          >
            Dashboard
          </MuiLink>
          <Typography color="textPrimary">Quản lý Bàn</Typography>
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
            Quản lý Bàn {restaurant?.name ? `- ${restaurant.name}` : ""}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              disabled={!restaurant}
            >
              Thêm bàn mới
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => restaurant && fetchTables(restaurant._id)}
              loading={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Restaurant Info */}
        {restaurant && (
          <Card className="restaurant-info-card" style={{ marginBottom: 16 }}>
            <Typography.Title level={5}>Thông tin nhà hàng</Typography.Title>
            <Typography.Paragraph>
              <strong>Tên:</strong> {restaurant.name}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Địa chỉ:</strong> {restaurant.address}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Loại hình:</strong> {restaurant.cuisineType}
            </Typography.Paragraph>
          </Card>
        )}

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên bàn, khu vực hoặc sức chứa..."
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
          dataSource={filteredTables}
          rowKey="_id"
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 16 }}
          locale={{
            emptyText: searchTerm
              ? "Không tìm thấy bàn nào phù hợp"
              : restaurant
              ? "Chưa có bàn nào trong nhà hàng này"
              : "Bạn chưa được gán nhà hàng nào",
          }}
        />

        {/* Form Modal */}
        <Modal
          title={selectedTable ? "Chỉnh sửa bàn" : "Thêm bàn mới"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isAvailable: true,
              area: "Trong nhà",
            }}
          >
            <Form.Item name="restaurant" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên bàn"
              rules={[{ required: true, message: "Vui lòng nhập tên bàn" }]}
            >
              <Input
                prefix={<TableOutlined />}
                placeholder="Nhập tên bàn (VD: Bàn 1, VIP-1,...)"
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
                name="capacity"
                label="Sức chứa"
                rules={[
                  { required: true, message: "Vui lòng nhập sức chứa" },
                  {
                    type: "number",
                    min: 1,
                    message: "Sức chứa phải lớn hơn 0",
                  },
                ]}
                style={{ width: "48%" }}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Nhập số người"
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              <Form.Item name="area" label="Khu vực" style={{ width: "48%" }}>
                <Select placeholder="Chọn khu vực">
                  {tableAreas.map((area) => (
                    <Option key={area} value={area}>
                      {area}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            <Form.Item
              name="isAvailable"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Sẵn sàng"
                unCheckedChildren="Không sẵn sàng"
              />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea
                rows={3}
                placeholder="Nhập mô tả chi tiết về bàn (nếu có)"
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
                {selectedTable ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>
      </Paper>
    </Container>
  );
};

export default TableMana;
