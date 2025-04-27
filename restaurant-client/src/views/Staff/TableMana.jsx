import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Switch,
  Space,
  Card,
  message,
  Tooltip,
  Typography,
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
} from "@ant-design/icons";

// Material-UI components for breadcrumbs
import {
  Box,
  Typography as MuiTypography,
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

const TableMana = () => {
  // State
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [form] = Form.useForm();
  const [restaurant, setRestaurant] = useState(null);

  // Lấy thông tin staff từ localStorage
  const staff = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    // Lấy thông tin nhà hàng của staff
    const fetchStaffRestaurant = async () => {
      try {
        const response = await axiosInstance.get(
          `staff/restaurant/${staff._id}`,
          config
        );

        if (response.data.status === "Success" && response.data.data) {
          setRestaurant(response.data.data[0].restaurant);
          fetchTables(response.data.data[0].restaurant._id);
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
        `/table/restaurant/${restaurantId}`,
        config
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
      restaurant: restaurant?._id,
      isAvailable: true,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (table) => {
    setSelectedTable(table);

    form.setFieldsValue({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      isAvailable: table.isAvailable !== false, // Đảm bảo giá trị luôn là boolean
      restaurant: table.restaurant || restaurant?._id,
    });

    setIsModalOpen(true);
  };

  // Sửa hàm handleSubmit để khớp với cấu trúc dữ liệu backend
  const handleSubmit = async (values) => {
    if (!restaurant?._id) {
      message.error("Không có thông tin nhà hàng");
      return;
    }

    try {
      setLoading(true);

      // Đảm bảo có restaurantId và đóng gói dữ liệu phù hợp với model backend
      const tableData = {
        restaurant: restaurant._id,
        tableNumber: values.tableNumber,
        capacity: values.capacity.toString(),
        isAvailable: values.isAvailable !== false,
      };

      console.log("Table data:", tableData);

      if (selectedTable) {
        // Edit mode
        const response = await axiosInstance.put(
          `/table/${selectedTable._id}`,
          tableData,
          config
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
        const response = await axiosInstance.post("/table", tableData, config);

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

      const response = await axiosInstance.delete(`/table/${tableId}`, config);

      if (response.data.status === "Success") {
        message.success("Xóa bàn thành công!");
        // Remove table from state
        setTables(tables.filter((table) => table._id !== tableId));
      } else {
        message.error("Không thể xóa bàn: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      if (error.response?.data?.message?.includes("reservation")) {
        message.error("Không thể xóa bàn đã có đặt trước");
      } else {
        message.error(
          "Lỗi: " + (error.response?.data?.message || error.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (tableId, isAvailable) => {
    try {
      // Cập nhật trạng thái sẵn sàng
      const response = await axiosInstance.put(
        `/table/${tableId}`,
        { isAvailable: !isAvailable },
        config
      );

      if (response.data.status === "Success") {
        setTables(
          tables.map((table) =>
            table._id === tableId
              ? { ...table, isAvailable: !isAvailable }
              : table
          )
        );

        message.success(
          `Bàn ${response.data.data.tableNumber} đã ${
            !isAvailable ? "sẵn sàng" : "không sẵn sàng"
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
      table.tableNumber
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      table.capacity?.toString().includes(searchTerm)
  );

  // Table columns
  const columns = [
    {
      title: "Mã bàn",
      dataIndex: "tableNumber",
      key: "tableNumber",
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
          <MuiTypography color="textPrimary">Quản lý Bàn</MuiTypography>
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
          <MuiTypography variant="h4" component="h1" gutterBottom>
            Quản lý Bàn {restaurant?.name ? `- ${restaurant.name}` : ""}
          </MuiTypography>
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
            placeholder="Tìm kiếm theo mã bàn hoặc sức chứa..."
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
            }}
          >
            <Form.Item name="restaurant" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="tableNumber"
              label="Mã bàn"
              rules={[{ required: true, message: "Vui lòng nhập mã bàn" }]}
            >
              <Input
                prefix={<TableOutlined />}
                placeholder="Nhập mã bàn (VD: A1, VIP-1,...)"
              />
            </Form.Item>

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
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập số người"
                prefix={<UserOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="isAvailable"
              label="Trạng thái"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch
                checkedChildren="Sẵn sàng"
                unCheckedChildren="Không sẵn sàng"
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
