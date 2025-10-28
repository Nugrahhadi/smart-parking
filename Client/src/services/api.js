import axios from "axios";

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log("📤 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
    });

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401) {
      console.log("⚠️ 401 Unauthorized - Clearing auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    console.error("❌ API Error:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      fullError: error.response?.data || error.message,
      code: error.code,
    });

    return Promise.reject(error);
  }
);

// ============================================
// AUTH APIs
// ============================================
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  verify: async () => {
    const response = await api.get("/auth/verify");
    return response.data;
  },
};

// ============================================
// USER APIs
// ============================================
export const userAPI = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

// ============================================
// PARKING APIs
// ============================================
export const parkingAPI = {
  getLocations: async () => {
    const response = await api.get("/parking/locations");
    return response.data;
  },

  getLocationById: async (locationId) => {
    const response = await api.get(`/parking/locations/${locationId}`);
    return response.data;
  },

  getAvailableSpots: async (locationId) => {
    const response = await api.get(
      `/parking/locations/${locationId}/available-spots`
    );
    return response.data;
  },

  getSpotsByZone: async (locationId, zoneType) => {
    const response = await api.get(
      `/parking/locations/${locationId}/zones/${zoneType}/spots`
    );
    return response.data;
  },
};

// ============================================
// RESERVATION APIs
// ============================================
export const reservationAPI = {
  createReservation: async (data) => {
    const response = await api.post("/reservations", data);
    return response.data;
  },

  getMyReservations: async () => {
    const response = await api.get("/reservations/my-reservations");
    return response.data;
  },

  getReservationById: async (reservationId) => {
    const response = await api.get(`/reservations/${reservationId}`);
    return response.data;
  },

  cancelReservation: async (reservationId) => {
    const response = await api.put(`/reservations/${reservationId}/cancel`);
    return response.data;
  },
};

// ============================================
// VEHICLE APIs
// ============================================
export const vehicleAPI = {
  getMyVehicles: async () => {
    const response = await api.get("/vehicles");
    return response.data;
  },

  addVehicle: async (data) => {
    const response = await api.post("/vehicles", data);
    return response.data;
  },

  updateVehicle: async (vehicleId, data) => {
    const response = await api.put(`/vehicles/${vehicleId}`, data);
    return response.data;
  },

  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/vehicles/${vehicleId}`);
    return response.data;
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common["Authorization"];
};

// Export default api instance for custom calls
export default api;
