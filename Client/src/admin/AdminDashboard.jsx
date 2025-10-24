import React, { useState } from "react";
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

const AdminDashboard = () => {
  const [currentDate] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  // Mock data for charts
  const parkingData = [
    { name: "6 AM", available: 105, occupied: 15 },
    { name: "8 AM", available: 85, occupied: 35 },
    { name: "10 AM", available: 60, occupied: 60 },
    { name: "12 PM", available: 45, occupied: 75 },
    { name: "2 PM", available: 35, occupied: 85 },
    { name: "4 PM", available: 30, occupied: 90 },
    { name: "6 PM", available: 40, occupied: 80 },
    { name: "8 PM", available: 65, occupied: 55 },
    { name: "10 PM", available: 90, occupied: 30 },
  ];

  // Mock parking locations data
  const parkingLocations = [
    {
      id: 1,
      name: "Central Mall Parking",
      available: 42,
      total: 120,
      occupancy: "65%",
      status: "active",
      revenue: "Rp 2.450.000",
      sensors: { total: 120, online: 118 },
    },
    {
      id: 2,
      name: "City Plaza Parking",
      available: 15,
      total: 80,
      occupancy: "81%",
      status: "active",
      revenue: "Rp 1.875.000",
      sensors: { total: 80, online: 80 },
    },
    {
      id: 3,
      name: "Station Parking",
      available: 8,
      total: 60,
      occupancy: "87%",
      status: "active",
      revenue: "Rp 1.245.000",
      sensors: { total: 60, online: 57 },
    },
    {
      id: 4,
      name: "Harbor View Parking",
      available: 22,
      total: 45,
      occupancy: "51%",
      status: "maintenance",
      revenue: "Rp 780.000",
      sensors: { total: 45, online: 36 },
    },
  ];

  // Mock statistics data
  const statistics = [
    {
      title: "Total Revenue",
      value: "Rp 6.350.000",
      change: "+12.5%",
      isPositive: true,
    },
    {
      title: "Average Occupancy",
      value: "73%",
      change: "+5.2%",
      isPositive: true,
    },
    {
      title: "Active Reservations",
      value: "87",
      change: "-3.1%",
      isPositive: false,
    },
    {
      title: "New Users",
      value: "142",
      change: "+24.8%",
      isPositive: true,
    },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: "reservation",
      user: "John Doe",
      location: "Central Mall Parking",
      slot: "A-12",
      time: "10:25 AM",
    },
    {
      id: 2,
      type: "completed",
      user: "Jane Smith",
      location: "City Plaza Parking",
      slot: "B-08",
      time: "10:18 AM",
    },
    {
      id: 3,
      type: "cancelled",
      user: "Robert Johnson",
      location: "Station Parking",
      slot: "C-15",
      time: "10:02 AM",
    },
    {
      id: 4,
      type: "sensor_alert",
      location: "Harbor View Parking",
      slot: "D-22",
      issue: "Connectivity Lost",
      time: "9:54 AM",
    },
    {
      id: 5,
      type: "payment",
      user: "Maria Garcia",
      amount: "Rp 35.000",
      location: "Central Mall Parking",
      time: "9:45 AM",
    },
  ];

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
                3
              </span>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-2"></div>
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </div>

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
              <h3 className="font-bold text-gray-700">Real-time Overview</h3>
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
                <p className="text-2xl font-bold">305</p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>All parking locations</span>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="text-gray-600 font-medium text-sm mb-1">
                  Available
                </h4>
                <p className="text-2xl font-bold text-green-600">87</p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>28.5% of total</span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-gray-600 font-medium text-sm mb-1">
                  Occupied
                </h4>
                <p className="text-2xl font-bold text-blue-600">218</p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>71.5% of total</span>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="text-gray-600 font-medium text-sm mb-1">
                  Reserved
                </h4>
                <p className="text-2xl font-bold text-yellow-600">45</p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>14.8% of total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  <th className="py-3 px-4 text-left font-medium">Occupancy</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">
                    Today's Revenue
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Sensors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parkingLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{location.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-green-600 font-medium">
                          {location.available}
                        </span>
                        <span className="text-gray-500">
                          {" "}
                          / {location.total}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: location.occupancy }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {location.occupancy}
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
                      {location.revenue}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <span
                          className={`font-medium ${
                            location.sensors.online === location.sensors.total
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {location.sensors.online}
                        </span>
                        <span className="text-gray-600">
                          {" "}
                          / {location.sensors.total} online
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-700">Recent Activities</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      activity.type === "reservation"
                        ? "bg-blue-100 text-blue-600"
                        : activity.type === "completed"
                        ? "bg-green-100 text-green-600"
                        : activity.type === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : activity.type === "sensor_alert"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {activity.type === "reservation" ? (
                      <Car size={20} />
                    ) : activity.type === "completed" ? (
                      <Clock size={20} />
                    ) : activity.type === "cancelled" ? (
                      <Clock size={20} />
                    ) : activity.type === "sensor_alert" ? (
                      <Cpu size={20} />
                    ) : (
                      <CreditCard size={20} />
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="font-medium">
                      {activity.type === "reservation"
                        ? `New reservation by ${activity.user}`
                        : activity.type === "completed"
                        ? `Parking completed by ${activity.user}`
                        : activity.type === "cancelled"
                        ? `Reservation cancelled by ${activity.user}`
                        : activity.type === "sensor_alert"
                        ? `Sensor issue detected`
                        : `Payment received from ${activity.user}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.location}
                      {activity.slot ? `, Slot ${activity.slot}` : ""}
                      {activity.issue ? `, Issue: ${activity.issue}` : ""}
                      {activity.amount ? `, Amount: ${activity.amount}` : ""}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <button className="text-blue-600 font-medium text-sm">
                View All Activities
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
