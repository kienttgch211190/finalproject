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
} from "@ant-design/icons";

// Thêm breadcrumbs
import {
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Container,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

const PromotionPage = () => {
  // State chính
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [form] = Form.useForm();

  // Load data từ localStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("promotions")) || [];
    setPromotions(savedData);
  }, []);

  // Tự động cập nhật trạng thái
  useEffect(() => {
    const interval = setInterval(() => {
      setPromotions((prev) =>
        prev.map((p) => ({
          ...p,
          status: moment().isAfter(moment(p.endDate)) ? "expired" : "active",
        }))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý CRUD
  const handleSubmit = (values) => {
    const newPromo = {
      ...values,
      id: selectedPromotion?.id || Date.now(),
      applicableHours: values.applicableHours?.map((t) => t.format("HH:mm")),
    };

    setPromotions((prev) =>
      selectedPromotion
        ? prev.map((p) => (p.id === newPromo.id ? newPromo : p))
        : [...prev, newPromo]
    );

    message.success(
      selectedPromotion ? "Cập nhật thành công!" : "Tạo mới thành công!"
    );
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    message.success("Xóa thành công!");
  };

  // Columns cho bảng
  const columns = [
    {
      title: "Tên KM",
      dataIndex: "name",
      filteredValue: [searchTerm],
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        (record.code &&
          record.code.toLowerCase().includes(value.toLowerCase())),
    },
    {
      title: "Giá trị",
      render: (_, record) =>
        record.type === "percentage"
          ? `${record.value}%`
          : `${record.value.toLocaleString()}đ`,
    },
    {
      title: "Trạng thái",
      render: (_, record) => (
        <Tag color={record.status === "active" ? "green" : "red"}>
          {record.status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                ...record,
                applicableHours: record.applicableHours
                  ? [
                      moment(record.applicableHours[0], "HH:mm"),
                      moment(record.applicableHours[1], "HH:mm"),
                    ]
                  : undefined,
              });
              setSelectedPromotion(record);
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" style={{ marginTop: 24, marginBottom: 24 }}>
      <Paper elevation={3} style={{ padding: 24, borderRadius: "8px" }}>
        {/* Breadcrumbs - THÊM MỚI */}
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
              icon={<ArrowLeftOutlined />}
              onClick={() => (window.location.href = "/admin/dashboard")}
            >
              Quay lại Dashboard
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên/mã..."
            allowClear
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </div>

        {/* Bảng danh sách */}
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          bordered
          pagination={{ pageSize: 5 }}
          style={{ marginTop: 16 }}
        />

        {/* Modal form */}
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
            initialValues={{ minOrder: 0 }}
          >
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
              label="Loại khuyến mãi"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại" }]}
            >
              <Select
                options={[
                  { label: "Phần trăm", value: "percentage" },
                  { label: "Giảm tiền trực tiếp", value: "fixed" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Giá trị"
              name="value"
              rules={[
                { required: true, message: "Vui lòng nhập giá trị" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (getFieldValue("type") === "percentage" && value > 100) {
                      return Promise.reject("Tối đa 100%");
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Thời gian áp dụng" required>
              <Space.Compact>
                <Form.Item
                  name="startDate"
                  rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker placeholder="Ngày bắt đầu" />
                </Form.Item>
                <span style={{ margin: "0 8px" }}>đến</span>
                <Form.Item
                  name="endDate"
                  rules={[
                    { required: true, message: "Chọn ngày kết thúc" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          value &&
                          getFieldValue("startDate") &&
                          moment(value).isBefore(getFieldValue("startDate"))
                        ) {
                          return Promise.reject(
                            "Ngày kết thúc phải sau ngày bắt đầu"
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker placeholder="Ngày kết thúc" />
                </Form.Item>
              </Space.Compact>
            </Form.Item>

            <Form.Item
              label="Giờ áp dụng"
              name="applicableHours"
              rules={[{ required: true, message: "Chọn khung giờ" }]}
            >
              <TimePicker.RangePicker format="HH:mm" />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
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
