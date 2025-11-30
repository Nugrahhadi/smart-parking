import React from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ParkingOccupancyChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Parking Occupancy</h2>
        <p className="text-gray-600 text-sm mt-1">
          Occupied vs Available spaces throughout the day
        </p>
      </div>

      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value) => [`${value} spaces`, ""]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="occupied"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorOccupied)"
              name="Occupied Spaces"
            />
            <Area
              type="monotone"
              dataKey="available"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorAvailable)"
              name="Available Spaces"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-80 text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
};

export default ParkingOccupancyChart;
