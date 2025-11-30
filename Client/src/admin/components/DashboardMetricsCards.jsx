import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  Activity,
} from "lucide-react";

const DashboardMetricsCards = ({ metrics }) => {
  const metricCards = [
    {
      title: "Total Revenue",
      value: `Rp ${metrics?.total_revenue?.toLocaleString("id-ID") || 0}`,
      growth: metrics?.revenue_growth || 0,
      icon: DollarSign,
      color: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Average Occupancy",
      value: `${metrics?.avg_occupancy || 0}%`,
      growth: metrics?.occupancy_growth || 0,
      icon: Activity,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Active Reservations",
      value: metrics?.active_reservations || 0,
      growth: metrics?.reservations_growth || 0,
      icon: Car,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "New Users",
      value: metrics?.new_users || 0,
      growth: metrics?.users_growth || 0,
      icon: Users,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;

        return (
          <div
            key={index}
            className={`${card.color} ${card.borderColor} border rounded-lg p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700 font-medium text-sm">
                {card.title}
              </h3>
              <Icon className={`${card.iconColor} w-5 h-5`} />
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>

            <div className="flex items-center text-sm">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span
                className={`font-semibold ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {card.growth}%
              </span>
              <span className="text-gray-600 ml-2">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMetricsCards;
