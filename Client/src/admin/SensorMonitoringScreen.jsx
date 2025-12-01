import React, { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";

const SensorMonitoringScreen = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab="sensors"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              🎥 Sensor Monitoring
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time camera feed and license plate recognition system
            </p>
          </div>

          {/* Placeholder Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-blue-100 rounded-full">
                <svg
                  className="w-16 h-16 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m0-4v4m0-11a9 9 0 110 18 9 9 0 010-18z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🚀 Coming Soon
            </h2>

            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Camera integration and automatic license plate recognition (ALPR)
              system is under development
            </p>

            {/* Feature List */}
            <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto text-left mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Planned Features:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Real-time camera feed display from parking entrances/exits
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Automatic license plate recognition and extraction
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Vehicle entry/exit logging with timestamp
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Real-time alerts for unauthorized vehicles
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Integration with parking reservation system
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Multi-camera dashboard with grid layout
                </li>
              </ul>
            </div>

            {/* Status Info */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded max-w-2xl mx-auto text-left">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Status:</span> The camera
                integration module is in the planning phase. Once hardware
                cameras are connected to the system, this module will enable
                live monitoring and automatic license plate detection for
                streamlined parking operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorMonitoringScreen;
