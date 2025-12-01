// API utility functions for admin panel

const API_URL = "http://localhost:5000/api";

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Dashboard APIs
export const fetchDashboardMetrics = () => {
  return apiCall("/admin/dashboard/metrics");
};

export const fetchDashboardChart = () => {
  return apiCall("/admin/dashboard/chart");
};

// Locations APIs
export const fetchLocations = () => {
  return apiCall("/admin/locations");
};

export const fetchLocation = (id) => {
  return apiCall(`/admin/locations/${id}`);
};

export const createLocation = (data) => {
  return apiCall("/admin/locations", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateLocation = (id, data) => {
  return apiCall(`/admin/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteLocation = (id) => {
  return apiCall(`/admin/locations/${id}`, {
    method: "DELETE",
  });
};

// Users APIs
export const fetchUsers = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/admin/users${queryString ? `?${queryString}` : ""}`);
};

export const fetchUser = (id) => {
  return apiCall(`/admin/users/${id}`);
};

export const createUser = (data) => {
  return apiCall("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateUser = (id, data) => {
  return apiCall(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteUser = (id) => {
  return apiCall(`/admin/users/${id}`, {
    method: "DELETE",
  });
};

// Transactions APIs
export const fetchTransactions = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/admin/transactions${queryString ? `?${queryString}` : ""}`);
};

export const fetchTransaction = (id) => {
  return apiCall(`/admin/transactions/${id}`);
};

export const fetchTransactionsSummary = () => {
  return apiCall("/admin/transactions/stats/summary");
};

// Format currency helper
export const formatCurrency = (amount) => {
  return `Rp ${(amount || 0).toLocaleString()}`;
};

// Format date helper
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Format time helper
export const formatTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format duration between two times
export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "N/A";

  const start = new Date(startTime);
  const end = new Date(endTime);

  const diffMs = Math.abs(end - start);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }
  return `${diffMinutes}m`;
};

// Format time range
export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return "N/A";
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};
