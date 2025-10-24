import React from "react";
import {
  User,
  Car,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  MessageCircle,
  Star,
} from "lucide-react";

const ProfileTab = () => {
  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+62 812-3456-7890",
    joinDate: "June 2023",
    totalBookings: 27,
  };

  // Mock vehicle data
  const vehicles = [
    {
      id: 1,
      name: "Toyota Avanza",
      plate: "B 1234 ABC",
      type: "SUV",
      isDefault: true,
    },
    {
      id: 2,
      name: "Honda Beat",
      plate: "B 5678 XYZ",
      type: "Motorcycle",
      isDefault: false,
    },
  ];

  // Profile menu items
  const menuItems = [
    {
      id: "settings",
      icon: <Settings size={20} />,
      title: "Settings",
      description: "App preferences, notifications",
    },
    {
      id: "help",
      icon: <HelpCircle size={20} />,
      title: "Help Center",
      description: "FAQs, contact support",
    },
    {
      id: "privacy",
      icon: <Shield size={20} />,
      title: "Privacy & Security",
      description: "Manage your data, security settings",
    },
    {
      id: "feedback",
      icon: <MessageCircle size={20} />,
      title: "Give Feedback",
      description: "Help us improve the app",
    },
    {
      id: "rate",
      icon: <Star size={20} />,
      title: "Rate the App",
      description: "Love the app? Rate us!",
    },
    {
      id: "logout",
      icon: <LogOut size={20} />,
      title: "Log Out",
      description: "Sign out of the app",
      danger: true,
    },
  ];

  return (
    <div className="flex flex-col h-full py-4 px-2">
      {/* Profile Header */}
      <div className="bg-white rounded-lg p-4 mb-4 flex items-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
          <User size={32} className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-500 text-sm">{user.phone}</p>
        </div>

        <button className="ml-auto bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium">
          Edit
        </button>
      </div>

      {/* User Stats */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {user.totalBookings}
            </p>
            <p className="text-gray-600 text-sm">Total Bookings</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-gray-600 text-sm">Vehicles</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{user.joinDate}</p>
            <p className="text-gray-600 text-sm">Member Since</p>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">My Vehicles</h3>
          <button className="text-blue-600 text-sm font-medium">+ Add</button>
        </div>

        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`border rounded-lg p-3 flex items-center justify-between ${
                vehicle.isDefault
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    vehicle.isDefault ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Car
                    size={20}
                    className={
                      vehicle.isDefault ? "text-blue-600" : "text-gray-600"
                    }
                  />
                </div>

                <div>
                  <h4 className="font-medium">{vehicle.name}</h4>
                  <p className="text-gray-600 text-sm">
                    {vehicle.plate} • {vehicle.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {vehicle.isDefault && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full mr-2">
                    Default
                  </span>
                )}
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Menu */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    item.danger ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <span
                    className={item.danger ? "text-red-600" : "text-gray-600"}
                  >
                    {item.icon}
                  </span>
                </div>

                <div className="text-left">
                  <h4
                    className={`font-medium ${
                      item.danger ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              </div>

              <ChevronRight
                size={18}
                className={item.danger ? "text-red-400" : "text-gray-400"}
              />
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm">
        Smart Parking App v1.0.0
      </p>
    </div>
  );
};

export default ProfileTab;
