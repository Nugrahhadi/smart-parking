import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Component untuk melindungi routes yang membutuhkan authentication
export const ProtectedRoute = ({
  children,
  requireAuth = true,
  allowedRoles = [],
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jika route membutuhkan auth tapi user belum login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada role requirement, check apakah user memiliki role yang sesuai
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    // Redirect berdasarkan role user atau ke login jika tidak ada user
    if (!user) {
      return <Navigate to="/login" replace />;
    } else if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/mobile" replace />;
    }
  }

  return children;
};

// Component khusus untuk admin routes
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
};

// Component khusus untuk user routes (yang membutuhkan login)
export const UserRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={["user", "admin"]}>
      {children}
    </ProtectedRoute>
  );
};

// Component untuk routes yang bisa diakses guest atau user
export const PublicRoute = ({ children }) => {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
};
