import React, { createContext, useContext, useState, useEffect } from "react";
import {
  authAPI,
  setAuthToken,
  clearAuth as clearAuthToken,
} from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const userData = await authAPI.verify();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("🔐 AuthContext: Starting login...");
      console.log("📧 Email:", email);

      const data = await authAPI.login({ email, password });

      console.log("✅ Login response:", data);

      if (data.token) {
        setAuthToken(data.token);
        console.log("✅ Token saved");
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error("❌ Login error in AuthContext:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Network error occurred",
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      console.log("📝 AuthContext: Starting registration...");
      console.log("📧 Email:", email);

      const data = await authAPI.register({ name, email, password, phone });

      console.log("✅ Register response:", data);

      if (data.token) {
        setAuthToken(data.token);
        console.log("✅ Token saved");
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error("❌ Register error in AuthContext:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Network error occurred",
      };
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  // Helper functions to check user role
  const isGuest = () => !user;
  const isUser = () => user && user.role === "user";
  const isAdmin = () => user && user.role === "admin";
  const isAuthenticated = () => !!user;

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isGuest,
    isUser,
    isAdmin,
    isAuthenticated,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
