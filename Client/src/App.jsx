import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import {
  PublicRoute,
  UserRoute,
  AdminRoute,
} from "./components/ProtectedRoute";
import SmartParkingApp from "./mobile/SmartParkingApp";
import ParkingDetailScreen from "./mobile/ParkingDetailScreen";
import ParkingReservationScreen from "./mobile/ParkingReservationScreen";
import LoginRegisterScreen from "./mobile/LoginRegisterScreen";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUserManagement from "./admin/AdminUserManagement";
import AdminSystemConfig from "./admin/AdminSystemConfig";
import AdminReports from "./admin/AdminReports";
import ParkingLocation from "./admin/ParkingLocation";
import TransactionsScreen from "./admin/TransactionsScreen";
import SensorMonitoringScreen from "./admin/SensorMonitoringScreen";
import ProfileTab from "./mobile/ProfileTab";
import PaymentTab from "./mobile/PaymentTab";
import ReservationTab from "./mobile/ReservationTab";
import ReservationHistoryScreen from "./mobile/ReservationHistoryScreen";
import MyVehiclesScreen from "./mobile/MyVehiclesScreen";
import NotificationsScreen from "./mobile/NotificationsScreen";
import SettingsScreen from "./mobile/SettingsScreen";
import HelpSupportScreen from "./mobile/HelpSupportScreen";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes - Always accessible */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginRegisterScreen />
              </PublicRoute>
            }
          />

          {/* Mobile Routes - Public access (guest + user) */}
          <Route
            path="/mobile"
            element={
              <PublicRoute>
                <SmartParkingApp />
              </PublicRoute>
            }
          />
          <Route
            path="/parking"
            element={
              <PublicRoute>
                <SmartParkingApp />
              </PublicRoute>
            }
          />
          <Route
            path="/mobile/parking/:id"
            element={
              <PublicRoute>
                <ParkingDetailScreen />
              </PublicRoute>
            }
          />

          {/* Reservation - Requires user login */}
          <Route
            path="/mobile/reserve/:id"
            element={
              <UserRoute>
                <ParkingReservationScreen />
              </UserRoute>
            }
          />

          {/* User-only routes */}
          <Route
            path="/mobile/profile"
            element={
              <UserRoute>
                <ProfileTab />
              </UserRoute>
            }
          />
          <Route
            path="/mobile/payment"
            element={
              <UserRoute>
                <PaymentTab />
              </UserRoute>
            }
          />
          <Route
            path="/mobile/reservation"
            element={
              <UserRoute>
                <ReservationTab />
              </UserRoute>
            }
          />
          <Route
            path="/reservation-history"
            element={
              <UserRoute>
                <ReservationHistoryScreen />
              </UserRoute>
            }
          />
          <Route
            path="/mobile/myvehicles"
            element={
              <UserRoute>
                <MyVehiclesScreen />
              </UserRoute>
            }
          />
          <Route
            path="/mobile/notifications"
            element={
              <UserRoute>
                <NotificationsScreen />
              </UserRoute>
            }
          />
          <Route
            path="/mobile/settings"
            element={
              <UserRoute>
                <SettingsScreen />
              </UserRoute>
            }
          />
          <Route
            path="/mobile/help&support"
            element={
              <UserRoute>
                <HelpSupportScreen />
              </UserRoute>
            }
          />

          {/* Admin Routes - Admin only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/config"
            element={
              <AdminRoute>
                <AdminSystemConfig />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports/"
            element={
              <AdminRoute>
                <AdminReports />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/locations/"
            element={
              <AdminRoute>
                <ParkingLocation />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/transactions/"
            element={
              <AdminRoute>
                <TransactionsScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sensors/"
            element={
              <AdminRoute>
                <SensorMonitoringScreen />
              </AdminRoute>
            }
          />

          {/* Default redirect to mobile app (guest access) */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <SmartParkingApp />
              </PublicRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
