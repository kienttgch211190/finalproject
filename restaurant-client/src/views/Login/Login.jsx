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
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

// Import CSS
import "../../style/Login/Login.scss";

// Schema validation
const schema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: localStorage.getItem("rememberedEmail") || "",
      password: "",
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "staff") {
          navigate("/staff/dashboard");
        } else {
          navigate("/home");
        }
      } catch (error) {
        // If there's an error parsing the user data, clear localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }

    // Check if there's a remembered email
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setRememberMe(true);
    }
  }, [navigate]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

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

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", data.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Call API to login
      const response = await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001/api"
        }/user/signin`,
        data
      );

      // Check if login was successful
      if (response.data.status === "Success") {
        // Lấy dữ liệu từ response theo cấu trúc mới
        const { accesstoken, refreshtoken, user } = response.data.userData;

        // Store user data
        storeUserData(accesstoken, refreshtoken, user);

        toast.success("Đăng nhập thành công!");

        // Redirect based on user role
        if (user && user.role) {
          if (user.role === "admin") {
            navigate("/admin/dashboard");
          } else if (user.role === "staff") {
            navigate("/staff/dashboard");
          } else {
            navigate("/home");
          }
        } else {
          navigate("/home");
        }
      } else {
        toast.error("Đăng nhập thất bại: " + response.data.message);
      }
    } catch (error) {
      let errorMessage = "Đăng nhập thất bại";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
      }

      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Container maxWidth="sm">
        <Paper elevation={10} className="login-paper">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h4" className="login-header">
              Đăng Nhập
            </Typography>

            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="login-form"
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                autoComplete="email"
                autoFocus
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

              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    color="primary"
                  />
                }
                label="Ghi nhớ đăng nhập"
                className="remember-me"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? (
                  <CircularProgress size={24} className="loading-spinner" />
                ) : (
                  "Đăng Nhập"
                )}
              </Button>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Link to="/forgot-password" className="login-link">
                    <Typography variant="body2" color="primary">
                      Quên mật khẩu?
                    </Typography>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: { sm: "right" } }}>
                  <Link to="/register" className="login-link">
                    <Typography variant="body2" color="primary">
                      Chưa có tài khoản? Đăng ký
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

export default Login;
