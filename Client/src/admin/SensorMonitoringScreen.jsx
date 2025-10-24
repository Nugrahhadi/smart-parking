import React, { useState } from "react";
import {
  Cpu,
  AlertCircle,
  Battery,
  Signal,
  Wifi,
  WifiOff,
  Filter,
  ChevronDown,
  RefreshCcw,
  MapPin,
  Clock,
  Plus,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SensorMonitoringScreen = () => {
  const [filterLocation, setFilterLocation] = useState("All Locations");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [selectedSensor, setSelectedSensor] = useState(null);

  // Mock sensor data
  const sensors = [
    {
      id: "SN-001234",
      location: "Central Mall Parking",
      level: "B",
      slot: "42",
      status: "online",
      battery: 87,
      signal: 92,
      lastUpdate: "2 minutes ago",
      installDate: "12 May 2023",
      type: "Ultrasonic",
      firmware: "v2.1.4",
    },
    {
      id: "SN-001235",
      location: "Central Mall Parking",
      level: "B",
      slot: "43",
      status: "online",
      battery: 92,
      signal: 88,
      lastUpdate: "1 minute ago",
      installDate: "12 May 2023",
      type: "Ultrasonic",
      firmware: "v2.1.4",
    },
    {
      id: "SN-001236",
      location: "Central Mall Parking",
      level: "A",
      slot: "15",
      status: "low_battery",
      battery: 12,
      signal: 85,
      lastUpdate: "5 minutes ago",
      installDate: "10 May 2023",
      type: "Ultrasonic",
      firmware: "v2.1.4",
    },
    {
      id: "SN-002123",
      location: "City Plaza Parking",
      level: "C",
      slot: "08",
      status: "offline",
      battery: 76,
      signal: 0,
      lastUpdate: "2 days ago",
      installDate: "18 Feb 2023",
      type: "Infrared",
      firmware: "v2.0.9",
    },
    {
      id: "SN-002124",
      location: "City Plaza Parking",
      level: "B",
      slot: "22",
      status: "maintenance",
      battery: 65,
      signal: 78,
      lastUpdate: "1 hour ago",
      installDate: "18 Feb 2023",
      type: "Infrared",
      firmware: "v2.0.9",
    },
    {
      id: "SN-003045",
      location: "Station Parking",
      level: "A",
      slot: "11",
      status: "online",
      battery: 95,
      signal: 94,
      lastUpdate: "30 seconds ago",
      installDate: "5 Jun 2023",
      type: "Ultrasonic",
      firmware: "v2.1.5",
    },
  ];

  // Mock data for sensor activity chart
  const mockChartData = [
    { time: "00:00", status: 1, signal: 91 },
    { time: "04:00", status: 1, signal: 88 },
    { time: "08:00", status: 1, signal: 90 },
    { time: "12:00", status: 1, signal: 92 },
    { time: "16:00", status: 1, signal: 89 },
    { time: "20:00", status: 1, signal: 91 },
    { time: "00:00", status: 1, signal: 90 },
  ];

  // Function to render sensor status
  const renderSensorStatus = (status) => {
    switch (status) {
      case "online":
        return (
          <span className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <Signal size={12} className="mr-1" />
            Online
          </span>
        );
      case "offline":
        return (
          <span className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <WifiOff size={12} className="mr-1" />
            Offline
          </span>
        );
      case "low_battery":
        return (
          <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            <Battery size={12} className="mr-1" />
            Low Battery
          </span>
        );
      case "maintenance":
        return (
          <span className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            <Settings size={12} className="mr-1" />
            Maintenance
          </span>
        );
      default:
        return (
          <span className="flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            <AlertCircle size={12} className="mr-1" />
            Unknown
          </span>
        );
    }
  };

  // Function to render battery status
  const renderBattery = (level) => {
    let color = "bg-green-500";
    if (level < 20) color = "bg-red-500";
    else if (level < 50) color = "bg-yellow-500";

    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${level}%` }}></div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar would be here - same as in AdminDashboard */}
      <div className="bg-white shadow-md hidden md:block">
        {/* Sidebar content */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Sensor Monitoring</h2>
            <p className="text-gray-600">Manage and monitor IoT sensors</p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 border border-gray-300 rounded-md flex items-center text-sm">
              <RefreshCcw size={14} className="mr-1" />
              Refresh
            </button>

            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md flex items-center text-sm">
              <Plus size={14} className="mr-1" />
              Add Sensor
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 flex items-center space-x-4">
          <div className="flex items-center bg-white rounded-md border border-gray-300 overflow-hidden">
            <div className="px-3 py-2 flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <span className="text-gray-700 text-sm">Location:</span>
            </div>
            <select
              className="border-l border-gray-300 px-3 py-2 outline-none"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option>All Locations</option>
              <option>Central Mall Parking</option>
              <option>City Plaza Parking</option>
              <option>Station Parking</option>
            </select>
          </div>

          <div className="flex items-center bg-white rounded-md border border-gray-300 overflow-hidden">
            <div className="px-3 py-2 flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <span className="text-gray-700 text-sm">Status:</span>
            </div>
            <select
              className="border-l border-gray-300 px-3 py-2 outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Online</option>
              <option>Offline</option>
              <option>Low Battery</option>
              <option>Maintenance</option>
            </select>
          </div>

          <div className="flex-grow"></div>

          <div className="text-gray-600 text-sm">
            <span className="font-medium">235</span> sensors total,
            <span className="text-green-600 font-medium"> 212</span> online
          </div>
        </div>

        {/* Main content with sensors list and details */}
        <div className="grid grid-cols-3 gap-4 p-4">
          {/* Sensors List Column */}
          <div className="col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-3 border-b">
              <h3 className="font-bold text-gray-800">Sensors</h3>
            </div>

            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 230px)" }}
            >
              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    selectedSensor?.id === sensor.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedSensor(sensor)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{sensor.id}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin size={14} className="mr-1" />
                        {sensor.location}, Level {sensor.level}, Slot{" "}
                        {sensor.slot}
                      </div>
                    </div>
                    {renderSensorStatus(sensor.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Battery</p>
                      <div className="flex items-center">
                        {renderBattery(sensor.battery)}
                        <span className="ml-2 text-xs font-medium">
                          {sensor.battery}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Signal</p>
                      <div className="flex items-center">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={`w-1 rounded-sm ${
                                bar * 25 <= sensor.signal
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                              style={{ height: `${5 + bar * 2}px` }}
                            ></div>
                          ))}
                        </div>
                        <span className="ml-2 text-xs font-medium">
                          {sensor.signal}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    Last update: {sensor.lastUpdate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor Details Column */}
          <div className="col-span-2">
            {selectedSensor ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Sensor Details Card */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{selectedSensor.id}</h3>
                      <p className="text-gray-600">
                        {selectedSensor.type} Sensor
                      </p>
                    </div>
                    {renderSensorStatus(selectedSensor.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedSensor.location}</p>
                      <p className="text-sm">
                        Level {selectedSensor.level}, Slot {selectedSensor.slot}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Update</p>
                      <p className="font-medium">{selectedSensor.lastUpdate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Installation Date</p>
                      <p className="font-medium">
                        {selectedSensor.installDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Firmware Version</p>
                      <p className="font-medium">{selectedSensor.firmware}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Battery Level</p>
                    <div className="flex items-center">
                      <Battery
                        size={20}
                        className={`mr-2 ${
                          selectedSensor.battery < 20
                            ? "text-red-500"
                            : selectedSensor.battery < 50
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      />
                      <div className="flex-grow">
                        {renderBattery(selectedSensor.battery)}
                      </div>
                      <span className="ml-2 font-medium">
                        {selectedSensor.battery}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Signal Strength
                    </p>
                    <div className="flex items-center">
                      <Wifi
                        size={20}
                        className={`mr-2 ${
                          selectedSensor.signal < 20
                            ? "text-red-500"
                            : selectedSensor.signal < 50
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      />
                      <div className="flex-grow">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              selectedSensor.signal < 20
                                ? "bg-red-500"
                                : selectedSensor.signal < 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${selectedSensor.signal}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-2 font-medium">
                        {selectedSensor.signal}%
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-6">
                    <button className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 font-medium">
                      Restart Sensor
                    </button>
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium">
                      Update Firmware
                    </button>
                  </div>
                </div>

                {/* Sensor Activity Chart */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Sensor Activity (24h)
                  </h3>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={mockChartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="signal"
                          stroke="#3B82F6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Activity Log
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-400">Today 10:23 AM</span>
                        <p>Sensor online, signal strength 92%</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-400">Today 06:12 AM</span>
                        <p>Battery level update: 87%</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-400">
                          Yesterday 08:45 PM
                        </span>
                        <p>Status check: operational</p>
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm font-medium mt-2">
                      View Full Log
                    </button>
                  </div>
                </div>

                {/* Parking Slot Status */}
                <div className="bg-white rounded-lg shadow-sm p-4 col-span-2">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Parking Slot Status
                  </h3>

                  <div className="bg-blue-50 p-3 rounded-lg flex items-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3">
                      <Car size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Slot {selectedSensor.level}-{selectedSensor.slot}
                      </p>
                      <p className="text-sm text-gray-600">
                        Currently occupied by vehicle
                      </p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm text-gray-600">Occupied since</p>
                      <p className="font-medium">Today, 08:45 AM (2h 15m)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Slot Usage Today</p>
                      <p className="text-xl font-bold mt-1">5 vehicles</p>
                      <p className="text-sm text-gray-600">
                        Avg. duration: 1h 20m
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Occupancy Rate</p>
                      <p className="text-xl font-bold mt-1">78%</p>
                      <p className="text-sm text-green-600">
                        ↑ 5% from last week
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Last Maintenance</p>
                      <p className="text-xl font-bold mt-1">22 days ago</p>
                      <p className="text-sm text-gray-600">
                        No issues reported
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 h-full flex flex-col items-center justify-center">
                <Cpu size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No sensor selected
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Select a sensor from the list to view detailed information,
                  status, and activity data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorMonitoringScreen;
