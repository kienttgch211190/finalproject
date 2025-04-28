import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login/Login";
import Register from "./views/Register/Register";
import Homepage from "./views/Homepage/Homepage";
import AdminMenu from "./views/Menu/AdminMenu";
import StaffMenu from "./views/Menu/StaffMenu";
import Reservation from "./views/Staff/Reservation";
import RestaurantInfo from "./views/Staff/RestaurantInfo";
import RestaurantMana from "./views/Admin/RestaurantMana";
import UserMana from "./views/Admin/UserMana";
import ReservationMana from "./views/Admin/ReservationMana";
import TableMana from "./views/Staff/TableMana";
import Promotion from "./views/Admin/Promotion";
import AdminDashboard from "./views/Admin/Dashboard";
import StaffDashboard from "./views/Staff/Dashboard";
import PendingReservation from "./views/Staff/PendingReservation";
import StaffPromotion from "./views/Staff/StaffPromotion";
import RestaurantDetail from "./views/Customer/RestaurantDetail";
import NewReservation from "./views/Customer/NewReservation";
import Profile from "./views/User/Profile";

// Tạo Protected Route component để kiểm tra đăng nhập
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("accessToken") !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Role-based Protected Route
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("accessToken") !== null;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "customer";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect based on role if unauthorized
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute>
              <RestaurantDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservation/new"
          element={
            <ProtectedRoute>
              <NewReservation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <UserMana />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/restaurants"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <RestaurantMana />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/menus"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminMenu />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <ReservationMana />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/promotions"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Promotion />
            </RoleBasedRoute>
          }
        />

        {/* Staff routes */}
        <Route
          path="/staff/dashboard"
          element={
            <RoleBasedRoute allowedRoles={["staff"]}>
              <StaffDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/staff/restaurant"
          element={
            <RoleBasedRoute allowedRoles={["staff"]}>
              <RestaurantInfo />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/staff/reservations"
          element={
            <RoleBasedRoute allowedRoles={["staff"]}>
              <Reservation />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/staff/reservations/pending"
          element={
            <RoleBasedRoute allowedRoles={["staff"]}>
              <PendingReservation />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/staff/promotions"
          element={
            <RoleBasedRoute allowedRoles={["staff"]}>
              <StaffPromotion />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/staff/tables"
          element={
            <RoleBasedRoute allowedRoles={["staff"]}>
              <TableMana />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/staff/menu"
          element={
            <RoleBasedRoute allowedRoles={["staff"]}>
              <StaffMenu />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/staff/promotions"
          element={
            <RoleBasedRoute allowedRoles={["staff"]}>
              <div>Promotions - Sẽ được triển khai sau</div>
            </RoleBasedRoute>
          }
        />

        {/* Route check và chuyển hướng */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

// Component để chuyển hướng người dùng dựa trên vai trò
const RoleRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "customer";

  if (userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (userRole === "staff") {
    return <Navigate to="/staff/dashboard" replace />;
  } else {
    return <Navigate to="/home" replace />;
  }
};

export default App;
