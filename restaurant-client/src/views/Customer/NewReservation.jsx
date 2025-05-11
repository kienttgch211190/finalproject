import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Button,
  Steps,
  Form,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Select,
  Result,
  Divider,
  Spin,
  message,
  Space,
  Row,
  Col,
  Tag,
  Descriptions,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  TableOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import moment from "moment";
import axiosInstance from "../../contexts/AxiosCustom";

// Import CSS
import "../../style/Customer/NewReservation.scss";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const NewReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    restaurantId,
    date,
    time,
    guests,
    restaurantName,
    tableId,
    tableName,
  } = location.state || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [form] = Form.useForm();

  // Get user information from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!restaurantId || !date || !time || !guests) {
      message.error("Thông tin đặt bàn không đầy đủ");
      navigate("/home");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurant details
        const restaurantResponse = await axiosInstance.get(
          `/restaurant/detail/${restaurantId}`
        );

        if (restaurantResponse.data.status === "Success") {
          setRestaurant(restaurantResponse.data.data);
        } else {
          message.error("Không thể tải thông tin nhà hàng");
          navigate("/home");
          return;
        }

        // Nếu đã có tableId từ RestaurantDetail, sử dụng bàn đã chọn thay vì fetch lại
        if (tableId) {
          try {
            const tableResponse = await axiosInstance.get(`/table/${tableId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (tableResponse.data.status === "Success") {
              const selectedTableData = tableResponse.data.data;
              setTables([selectedTableData]);
              setSelectedTable(selectedTableData);
            } else {
              // Nếu không lấy được thông tin bàn đã chọn, quay trở lại fetch tất cả bàn có sẵn
              await fetchAvailableTables();
            }
          } catch (error) {
            console.error("Error fetching selected table:", error);
            await fetchAvailableTables();
          }
        } else {
          // Nếu không có tableId, fetch tất cả bàn có sẵn
          await fetchAvailableTables();
        }

        // Pre-fill form with user data and reservation parameters
        form.setFieldsValue({
          name: user.name || "",
          phone: user.phone || "",
          email: user.email || "",
          date: moment(date),
          time: moment(time, "HH:mm"),
          guests: guests,
          specialRequest: "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, date, time, guests, navigate, form, tableId, token]);

  const fetchAvailableTables = async () => {
    try {
      // Fetch available tables for the selected time and guest count
      const tablesResponse = await axiosInstance.post(
        "/reservation/available-tables",
        {
          restaurantId,
          reservationDate: date, // Đảm bảo đây là chuỗi YYYY-MM-DD
          reservationTime: time, // Đảm bảo đây là chuỗi HH:MM
          numGuests: guests,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (tablesResponse.data.status === "Success") {
        console.log("Tables response:", tablesResponse.data);
        setTables(tablesResponse.data.data || []);
      } else {
        message.error("Không thể tải thông tin bàn trống");
        console.error("Error from API:", tablesResponse.data.message);
      }
    } catch (error) {
      console.error("Error fetching available tables:", error);
      message.error("Không thể tải thông tin bàn trống");
    }
  };

  const handleTableSelect = (tableId) => {
    const selected = tables.find((table) => table._id === tableId);
    setSelectedTable(selected);
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedTable) {
      message.error("Vui lòng chọn bàn để tiếp tục");
      return;
    }

    if (currentStep === 1) {
      form
        .validateFields()
        .then((values) => {
          setCurrentStep(currentStep + 1);
        })
        .catch((info) => {
          message.error("Vui lòng điền đầy đủ thông tin");
        });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Sửa hàm handleSubmit để kiểm tra và xử lý giá trị undefined
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Kiểm tra và xử lý các giá trị date và time
      if (!values.date || !values.time) {
        // Lấy giá trị hiện tại từ form data đã điền ban đầu
        const formData = form.getFieldsValue();

        if (!values.date) {
          values.date = formData.date || moment(date);
        }

        if (!values.time) {
          values.time = formData.time || moment(time, "HH:mm");
        }

        // Nếu vẫn không có giá trị, thông báo lỗi
        if (!values.date || !values.time) {
          message.error(
            "Ngày và giờ đặt bàn không hợp lệ. Vui lòng kiểm tra lại."
          );
          setLoading(false);
          return;
        }
      }

      // Log để debug
      console.log("Date value:", values.date);
      console.log("Time value:", values.time);

      // Đảm bảo date và time đều có phương thức format
      const reservationDate = values.date
        ? values.date.format("YYYY-MM-DD")
        : date;
      const reservationTime = values.time ? values.time.format("HH:mm") : time;

      const reservationData = {
        restaurant: restaurantId,
        table: selectedTable._id,
        user: user._id,
        reservationDate: reservationDate,
        reservationTime: reservationTime,
        numGuests: values.guests,
        specialRequest: values.specialRequest || "",
      };

      console.log("Sending reservation data:", reservationData);

      const response = await axiosInstance.post(
        "/reservation/create",
        reservationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "Success") {
        setReservationId(response.data.data._id);
        setReservationSuccess(true);
        setCurrentStep(3);
        message.success("Đặt bàn thành công!");
      } else {
        message.error("Không thể đặt bàn: " + response.data.message);
      }
    } catch (error) {
      console.error("Error creating reservation:", error);

      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.name === "TypeError" && error.message.includes("format")) {
        message.error(
          "Lỗi định dạng ngày giờ. Vui lòng nhập lại thông tin đặt bàn."
        );
      } else {
        message.error("Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderTableSelection();
      case 1:
        return renderCustomerInfo();
      case 2:
        return renderConfirmation();
      case 3:
        return renderSuccess();
      default:
        return renderTableSelection();
    }
  };

  const renderTableSelection = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" tip="Đang tải thông tin bàn..." />
        </div>
      );
    }

    if (tables.length === 0) {
      return (
        <div className="no-tables">
          <Alert
            type="warning"
            message="Không có bàn trống"
            description={
              <>
                <p>
                  Không có bàn nào phù hợp với số lượng khách và thời gian bạn
                  chọn.
                </p>
                <p>
                  Vui lòng thử lại với thời gian khác hoặc số lượng khách khác.
                </p>
                <Button
                  type="primary"
                  onClick={() => navigate(`/restaurant/${restaurantId}`)}
                >
                  Quay lại để thay đổi
                </Button>
              </>
            }
            showIcon
          />
        </div>
      );
    }

    // Nếu đã có bàn từ RestaurantDetail và bàn đó có trong danh sách, tự động chọn
    if (tableId && !selectedTable && tables.length > 0) {
      const preSelectedTable = tables.find((table) => table._id === tableId);
      if (preSelectedTable) {
        setSelectedTable(preSelectedTable);
      }
    }

    return (
      <div className="table-selection">
        <Title level={4}>Chọn bàn phù hợp</Title>
        {tableId && tableName && (
          <Alert
            message="Bàn đã chọn"
            description={`Bạn đã chọn: ${tableName}. Bạn vẫn có thể thay đổi bàn khác nếu muốn.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Paragraph>
          Vui lòng chọn bàn phù hợp với số lượng khách và nhu cầu của bạn.
        </Paragraph>

        <Row gutter={[16, 16]} className="tables-grid">
          {tables.map((table) => (
            <Col xs={24} sm={12} md={8} key={table._id}>
              <Card
                hoverable
                className={`table-card ${
                  selectedTable?._id === table._id ? "selected" : ""
                }`}
                onClick={() => handleTableSelect(table._id)}
              >
                <div className="table-card-content">
                  <TableOutlined className="table-icon" />
                  <div className="table-info">
                    <Title level={5}>{table.name}</Title>
                    <Text>Sức chứa: {table.capacity} người</Text>
                    <Text type="secondary">
                      {table.description || "Không có mô tả"}
                    </Text>
                    {table.location && (
                      <Text type="secondary">Vị trí: {table.location}</Text>
                    )}
                  </div>
                  {selectedTable?._id === table._id && (
                    <CheckCircleOutlined className="selected-icon" />
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderCustomerInfo = () => {
    return (
      <div className="customer-info">
        <Title level={4}>Thông tin đặt bàn</Title>
        <Paragraph>
          Vui lòng điền thông tin cá nhân và chi tiết đặt bàn của bạn.
        </Paragraph>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Họ tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Họ tên" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="date"
                label="Ngày đặt"
                rules={[{ required: true, message: "Vui lòng chọn ngày đặt" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => {
                    return current && current < moment().startOf("day");
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="time"
                label="Giờ đặt"
                rules={[{ required: true, message: "Vui lòng chọn giờ đặt" }]}
              >
                <TimePicker style={{ width: "100%" }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="guests"
                label="Số khách"
                rules={[{ required: true, message: "Vui lòng chọn số khách" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  max={20}
                  placeholder="Số khách"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="specialRequest" label="Yêu cầu đặc biệt">
            <TextArea
              rows={4}
              prefix={<MessageOutlined />}
              placeholder="Nhập yêu cầu đặc biệt của bạn (nếu có)"
            />
          </Form.Item>
        </Form>
      </div>
    );
  };

  const renderConfirmation = () => {
    const formValues = form.getFieldsValue();

    return (
      <div className="confirmation">
        <Title level={4}>Xác nhận thông tin đặt bàn</Title>
        <Paragraph>
          Vui lòng kiểm tra lại thông tin đặt bàn trước khi xác nhận.
        </Paragraph>

        <Card className="confirmation-card">
          <Descriptions title="Thông tin nhà hàng" bordered>
            <Descriptions.Item label="Nhà hàng" span={3}>
              {restaurant?.name || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={3}>
              {restaurant?.address || ""}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions title="Chi tiết đặt bàn" bordered>
            <Descriptions.Item label="Bàn" span={3}>
              {selectedTable?.name} (Sức chứa: {selectedTable?.capacity} người)
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {formValues.date?.format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Giờ đặt">
              {formValues.time?.format("HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Số khách">
              {formValues.guests} người
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions title="Thông tin khách hàng" bordered>
            <Descriptions.Item label="Họ tên" span={3}>
              {formValues.name}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {formValues.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>
              {formValues.email}
            </Descriptions.Item>
            {formValues.specialRequest && (
              <Descriptions.Item label="Yêu cầu đặc biệt" span={3}>
                {formValues.specialRequest}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </div>
    );
  };

  const renderSuccess = () => {
    return (
      <div className="success-result">
        <Result
          status="success"
          title="Đặt bàn thành công!"
          subTitle={`Mã đặt bàn: ${reservationId}. Nhà hàng sẽ liên hệ với bạn để xác nhận đơn đặt bàn.`}
          extra={[
            <Button type="primary" key="home" onClick={() => navigate("/home")}>
              Quay lại trang chủ
            </Button>,
            <Button key="view" onClick={() => navigate("/user/reservations")}>
              Xem đơn đặt bàn của tôi
            </Button>,
          ]}
        />
      </div>
    );
  };

  if (!restaurant && loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <Layout className="reservation-layout">
      <Content className="reservation-content">
        <Card className="reservation-card">
          <div className="reservation-header">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              disabled={reservationSuccess}
            >
              Quay lại
            </Button>
            <Title level={3}>
              {reservationSuccess ? "Đặt bàn thành công" : "Đặt bàn"}
            </Title>
          </div>

          <div className="reservation-restaurant-info">
            <Space align="center">
              <ShopOutlined />
              <Text strong>{restaurant?.name || restaurantName}</Text>
            </Space>
          </div>

          <Steps
            current={currentStep}
            className="reservation-steps"
            responsive={true}
          >
            <Step title="Chọn bàn" icon={<TableOutlined />} />
            <Step title="Thông tin" icon={<UserOutlined />} />
            <Step title="Xác nhận" icon={<CheckCircleOutlined />} />
          </Steps>

          <div className="step-content">{renderStepContent()}</div>

          {!reservationSuccess && (
            <div className="step-actions">
              {currentStep > 0 && (
                <Button onClick={handlePrevious} style={{ marginRight: 8 }}>
                  Quay lại
                </Button>
              )}
              {currentStep < 2 && (
                <Button type="primary" onClick={handleNext}>
                  Tiếp theo
                </Button>
              )}
              {currentStep === 2 && (
                <Button type="primary" onClick={handleSubmit} loading={loading}>
                  Xác nhận đặt bàn
                </Button>
              )}
            </div>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default NewReservation;
