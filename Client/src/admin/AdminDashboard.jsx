import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Settings,
  CreditCard,
  MapPin,
  Bell,
  Search,
  Plus,
  Download,
  Calendar,
  ChevronDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Car,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:5000/api";

const AdminDashboard = () => {
  const [currentDate] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    avg_occupancy: 0,
    active_reservations: 0,
    new_users: 0,
    revenue_growth: 0,
    occupancy_growth: 0,
    reservations_growth: 0,
    users_growth: 0,
  });

  const [parkingData, setParkingData] = useState([]);
  const [parkingLocations, setParkingLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch dashboard metrics
  const fetchMetrics = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/dashboard/metrics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Failed to fetch dashboard metrics");
    }
  };

  // Fetch chart data
  const fetchChartData = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/dashboard/chart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setParkingData(result.data);
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
    }
  };

  // Fetch parking locations
  const fetchLocations = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setParkingLocations(result.data);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchMetrics(), fetchChartData(), fetchLocations()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Refresh data every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString()}`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === 0) return "0%";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value}%`;
  };

  const statistics = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.total_revenue || 0),
      change: formatPercentage(metrics.revenue_growth || 0),
      isPositive: (metrics.revenue_growth || 0) >= 0,
    },
    {
      title: "Average Occupancy",
      value: `${metrics.avg_occupancy || 0}%`,
      change: formatPercentage(metrics.occupancy_growth || 0),
      isPositive: (metrics.occupancy_growth || 0) >= 0,
    },
    {
      title: "Active Reservations",
      value: metrics.active_reservations || 0,
      change: formatPercentage(metrics.reservations_growth || 0),
      isPositive: (metrics.reservations_growth || 0) >= 0,
    },
    {
      title: "New Users",
      value: metrics.new_users || 0,
      change: formatPercentage(metrics.users_growth || 0),
      isPositive: (metrics.users_growth || 0) >= 0,
    },
  ];

  // Calculate real-time overview stats from locations
  const totalSlots = parkingLocations.reduce(
    (sum, loc) => sum + (loc.total_slots || 0),
    0
  );
  const occupiedSlots = parkingLocations.reduce(
    (sum, loc) => sum + (loc.occupied_slots || 0),
    0
  );
  const availableSlots = totalSlots - occupiedSlots;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Smart Parking</h1>
          <p className="text-sm text-gray-600">Admin Dashboard</p>
        </div>

        <div className="p-4">
          <div className="flex flex-col space-y-1">
            <a
              href="/admin"
              className="flex items-center p-2 rounded-md bg-blue-50 text-blue-600 font-medium"
            >
              <BarChart3 size={20} className="mr-3" />
              Dashboard
            </a>
            <a
              href="/admin/locations"
              className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <MapPin size={20} className="mr-3" />
              Parking Locations
            </a>
            <a
              href="/admin/users"
              className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Users size={20} className="mr-3" />
              Users
            </a>
            <a
              href="/admin/transactions"
              className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <CreditCard size={20} className="mr-3" />
              Transactions
            </a>
            <a
              href="/admin/sensors"
              className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Cpu size={20} className="mr-3" />
              Sensors
            </a>
            <a
              href="/admin/config"
              className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Settings size={20} className="mr-3" />
              Settings
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Dashboard</h2>
            <p className="text-gray-600">{currentDate}</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Refresh data"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-64"
              />
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
            </div>

            <div className="relative">
              <Bell size={22} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                0
              </span>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-2"></div>
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4 p-4">
              {statistics.map((stat, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="text-gray-500 font-medium">{stat.title}</h3>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        stat.isPositive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {stat.isPositive ? (
                        <ArrowUpRight size={14} className="inline mr-1" />
                      ) : (
                        <ArrowDownRight size={14} className="inline mr-1" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
              ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">Parking Occupancy</h3>
                  <div className="flex items-center text-sm font-medium text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    Today
                    <ChevronDown size={16} className="ml-1" />
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={parkingData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar
                        dataKey="occupied"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="available"
                        fill="#E5E7EB"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center mt-4">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                    <span className="text-sm text-gray-600">Occupied</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-200 rounded-sm mr-2"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">
                    Real-time Overview
                  </h3>
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    <Clock size={16} className="mr-1" />
                    Live Data
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-gray-600 font-medium text-sm mb-1">
                      Total Slots
                    </h4>
                    <p className="text-2xl font-bold">{totalSlots}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>All parking locations</span>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="text-gray-600 font-medium text-sm mb-1">
                      Available
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      {availableSlots}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>
                        {totalSlots > 0
                          ? ((availableSlots / totalSlots) * 100).toFixed(1)
                          : 0}
                        % of total
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-gray-600 font-medium text-sm mb-1">
                      Occupied
                    </h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {occupiedSlots}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>
                        {totalSlots > 0
                          ? ((occupiedSlots / totalSlots) * 100).toFixed(1)
                          : 0}
                        % of total
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h4 className="text-gray-600 font-medium text-sm mb-1">
                      Active Reservations
                    </h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      {metrics.active_reservations || 0}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>
                        {totalSlots > 0
                          ? (
                              ((metrics.active_reservations || 0) /
                                totalSlots) *
                              100
                            ).toFixed(1)
                          : 0}
                        % of total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* Parking Locations Table */}
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b">
                  <h3 className="font-bold text-gray-700">Parking Locations</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md flex items-center text-sm">
                      <Download size={14} className="mr-1" />
                      Export
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md flex items-center text-sm">
                      <Plus size={14} className="mr-1" />
                      Add Location
                    </button>
                  </div>
                </div>

                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">
                        Location Name
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Slots</th>
                      <th className="py-3 px-4 text-left font-medium">
                        Occupancy
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Today&apos;s Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parkingLocations.length > 0 ? (
                      parkingLocations.map((location) => {
                        const availableSlots =
                          location.total_slots - location.occupied_slots;
                        return (
                          <tr key={location.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium">{location.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <span className="text-green-600 font-medium">
                                  {availableSlots}
                                </span>
                                <span className="text-gray-500">
                                  {" "}
                                  / {location.total_slots}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${location.occupancy_rate || 0}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {location.occupancy_rate || 0}%
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  location.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {location.status === "active"
                                  ? "Active"
                                  : "Maintenance"}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {formatCurrency(location.today_revenue || 0)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-8 text-center text-gray-500"
                        >
                          No parking locations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
