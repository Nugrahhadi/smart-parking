import React, { createContext, useContext, useState, useEffect } from "react";

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
        const response = await fetch("http://localhost:5000/api/auth/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          // Token invalid, remove it
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error occurred" };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Network error occurred" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
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
