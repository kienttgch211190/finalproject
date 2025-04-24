import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "../../contexts/AxiosCustom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Person,
  Lock,
  Phone,
  LocationOn,
} from "@mui/icons-material";

// Import CSS
import "../../style/Register/Register.scss";

// Schema validation
const schema = yup.object({
  name: yup
    .string()
    .required("Tên là bắt buộc")
    .min(2, "Tên phải có ít nhất 2 ký tự"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  phone: yup
    .string()
    .required("Số điện thoại là bắt buộc")
    .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa số")
    .min(10, "Số điện thoại phải có ít nhất 10 số"),
  address: yup.string().required("Địa chỉ là bắt buộc"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Function to store user data after successful registration
  const storeUserData = (accessToken, refreshToken, user) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    // Set axios default header for future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...registerData } = data;

      // Call API to register
      const response = await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001/api"
        }/user/signup`,
        registerData
      );

      if (response.data.status === "Success") {
        // Extract user data and tokens from response
        const { accesstoken, refreshtoken, user } = response.data.userData;

        // Store user data in localStorage
        storeUserData(accesstoken, refreshtoken, user);

        toast.success("Đăng ký thành công!");

        // Redirect based on user role
        if (user.role === "customer") {
          navigate("/home");
        } else if (user.role === "staff") {
          navigate("/staff/dashboard");
        } else if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
      } else {
        toast.error("Đăng ký thất bại: " + response.data.message);
      }
    } catch (error) {
      let errorMessage = "Đăng ký thất bại";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
      }

      toast.error(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="register-container">
      <Container maxWidth="md">
        <Paper elevation={10} className="register-paper">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h4" className="register-header">
              Đăng Ký
            </Typography>

            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="register-form"
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="Họ và Tên"
                    autoComplete="name"
                    autoFocus
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    className="form-field"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    autoComplete="email"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    className="form-field"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="phone"
                    label="Số Điện Thoại"
                    autoComplete="tel"
                    {...register("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    className="form-field"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="address"
                    label="Địa Chỉ"
                    autoComplete="street-address"
                    {...register("address")}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    className="form-field"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="password"
                    label="Mật Khẩu"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    className="form-field"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="confirmPassword"
                    label="Xác Nhận Mật Khẩu"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    className="form-field"
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                className="register-button"
              >
                {isLoading ? (
                  <CircularProgress size={24} className="loading-spinner" />
                ) : (
                  "Đăng Ký"
                )}
              </Button>

              <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                  <Link to="/login" className="login-link">
                    <Typography variant="body2" color="primary">
                      Đã có tài khoản? Đăng nhập
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
