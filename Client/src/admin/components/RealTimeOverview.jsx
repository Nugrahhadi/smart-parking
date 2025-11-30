import React from "react";
import { Parking, AlertCircle, CheckCircle, Clock } from "lucide-react";

const RealTimeOverview = ({ data }) => {
  if (!data) return null;

  const stats = [
    {
      label: "Total Slots",
      value: data.total_slots,
      icon: Parking,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Available",
      value: `${data.available.count} (${data.available.percentage}%)`,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Occupied",
      value: `${data.occupied.count} (${data.occupied.percentage}%)`,
      icon: AlertCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Reserved",
      value: `${data.reserved.count} (${data.reserved.percentage}%)`,
      icon: Clock,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Real-time Overview</h2>
        <p className="text-gray-600 text-sm mt-1">Current parking status</p>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const [bgColor, textColor] = stat.color.split(" ");

          return (
            <div
              key={index}
              className="flex items-center p-4 bg-gray-50 rounded-lg"
            >
              <div className={`${bgColor} p-3 rounded-lg mr-4`}>
                <Icon className={`${textColor} w-6 h-6`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Total Locations:</strong> {data.total_locations} (
          {data.active_locations} active)
        </p>
      </div>
    </div>
  );
};

export default RealTimeOverview;
