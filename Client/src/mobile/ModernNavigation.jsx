import React, { useState } from "react";
import {
  Home,
  Car,
  Calendar,
  CreditCard,
  User,
  Menu,
  X,
  MapPin,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

const ModernNavigation = ({ activeTab, onTabChange, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications] = useState(3);

  const mainTabs = [
    {
      id: "home",
      icon: Home,
      label: "Home",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "vehicles",
      icon: Car,
      label: "Vehicles",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "reservations",
      icon: Calendar,
      label: "Book",
      color: "from-orange-500 to-red-500",
    },
    {
      id: "payment",
      icon: CreditCard,
      label: "Payment",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "profile",
      icon: User,
      label: "Profile",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const menuItems = [
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      badge: notifications,
    },
    { id: "settings", icon: Settings, label: "Settings" },
    { id: "help", icon: HelpCircle, label: "Help & Support" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Glassmorphism Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartPark
              </h1>
              <p className="text-xs text-gray-500">Find Your Spot</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <button
              onClick={() => handleTabClick("notifications")}
              className="relative p-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-300 group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {notifications}
                </span>
              )}
            </button>

            {/* Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={toggleMenu}
        ></div>

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">John Doe</h3>
                  <p className="text-sm text-white/80">Premium Member</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Quick Actions */}
      <button
        onClick={() => handleTabClick("reservations")}
        className="fixed bottom-24 right-6 z-30 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl shadow-orange-500/50 flex items-center justify-center group hover:scale-110 transition-all duration-300"
      >
        <MapPin className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 shadow-lg animate-pulse">
          +
        </div>
      </button>

      {/* Modern Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
        <div className="flex items-center justify-around px-4 py-3">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="relative flex flex-col items-center space-y-1 px-4 py-2 rounded-2xl transition-all duration-300 group"
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                )}

                {/* Icon Container */}
                <div
                  className={`relative p-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${tab.color} shadow-lg`
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive
                        ? "text-white scale-110"
                        : "text-gray-600 group-hover:text-blue-600"
                    }`}
                  />
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 animate-ping"></div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active Dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer for content */}
      <div className="h-20"></div>
      <div className="h-20"></div>
    </>
  );
};

export default ModernNavigation;
