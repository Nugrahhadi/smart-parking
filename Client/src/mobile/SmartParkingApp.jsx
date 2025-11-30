import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  TrendingUp,
  Zap,
  Shield,
  Calendar,
  DollarSign,
  Star,
  ChevronRight,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ModernNavigation from "./ModernNavigation";
import MyVehiclesScreen from "./MyVehiclesScreen";
import ReservationHistoryScreen from "./ReservationHistoryScreen";
import PaymentTab from "./PaymentTab";
import ProfileTab from "./ProfileTab";
import NotificationsScreen from "./NotificationsScreen";
import SettingsScreen from "./SettingsScreen";
import HelpSupportScreen from "./HelpSupportScreen";

const SmartParkingApp = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [parkingLocations, setParkingLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const mockParkingLocations = [
    {
      id: 1,
      name: "Central Mall Parking",
      available: 42,
      total: 120,
      distance: "1.2",
      price: "5.000",
      rating: 4.5,
      features: ["Electric Charging", "24/7 Security", "Covered Parking"],
    },
    {
      id: 2,
      name: "City Plaza Parking",
      available: 15,
      total: 80,
      distance: "0.8",
      price: "7.000",
      rating: 4.3,
      features: ["Valet Service", "CCTV", "Car Wash"],
    },
    {
      id: 3,
      name: "Station Parking",
      available: 8,
      total: 60,
      distance: "2.1",
      price: "4.000",
      rating: 4.0,
      features: ["Near Transport", "Affordable", "Open 24/7"],
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      setTimeout(() => {
        setParkingLocations(mockParkingLocations);
        setLoading(false);
      }, 1000);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToDetail = (parkingId) => {
    navigate(`/mobile/parking/${parkingId}`);
  };

  const goToReserve = (parkingId) => {
    navigate(`/mobile/reserve/${parkingId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTabChange = (tabId) => {
    if (tabId === "home") {
      setActiveTab("home");
    } else if (tabId === "reservations") {
      setActiveTab("reservations");
    } else if (tabId === "vehicles") {
      setActiveTab("vehicles");
    } else if (tabId === "payment") {
      setActiveTab("payment");
    } else if (tabId === "profile") {
      setActiveTab("profile");
    } else if (tabId === "notifications") {
      setActiveTab("notifications");
    } else if (tabId === "settings") {
      setActiveTab("settings");
    } else if (tabId === "help") {
      setActiveTab("help");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "vehicles":
        return <MyVehiclesScreen />;
      case "reservations":
        return <ReservationHistoryScreen />;
      case "payment":
        return <PaymentTab />;
      case "profile":
        return <ProfileTab />;
      case "notifications":
        return <NotificationsScreen />;
      case "settings":
        return <SettingsScreen />;
      case "help":
        return <HelpSupportScreen />;
      default:
        return renderHomePage();
    }
  };

  const renderHomePage = () => {
    return (
      <div className="h-full overflow-auto pb-32 pt-6 px-4">
        {/* Hero Section with Search */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 animate-pulse delay-75"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">
                Find Your Perfect Spot
              </h2>
              <p className="text-white/80 text-sm mb-6">
                Over 260 parking locations available
              </p>

              {/* Search Bar with Glassmorphism */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-white" />
                  <input
                    type="text"
                    placeholder="Search parking location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-2 border-white/30 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white/60"
                  />
                  <button className="absolute right-2 p-2 bg-white rounded-xl hover:bg-white/90 transition-all">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-xs text-green-600 font-semibold">
                ↑ 12%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">152</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="text-xs text-yellow-600 font-semibold">
                Fast
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">2.3</p>
            <p className="text-xs text-gray-500">Min Away</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-600 font-semibold">Safe</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">24/7</p>
            <p className="text-xs text-gray-500">Security</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap">
            <Navigation className="w-4 h-4" />
            <span className="text-sm font-medium">Navigate</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Book Now</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Pay Later</span>
          </button>
        </div>

        {/* Parking Locations */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Nearby Parking</h3>
            <button className="text-blue-600 text-sm font-medium flex items-center">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {parkingLocations
                .filter((location) =>
                  location.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((location) => (
                  <div
                    key={location.id}
                    onClick={() => goToDetail(location.id)}
                    className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {location.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{location.distance} km away</span>
                          <span className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current mr-1" />
                            {location.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          Rp {location.price}
                        </p>
                        <p className="text-xs text-gray-500">/hour</p>
                      </div>
                    </div>

                    {/* Availability Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-600">Availability</span>
                        <span
                          className={`font-semibold ${
                            location.available > 30
                              ? "text-green-600"
                              : location.available > 10
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {location.available}/{location.total} spots
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            location.available > 30
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : location.available > 10
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : "bg-gradient-to-r from-red-400 to-red-600"
                          }`}
                          style={{
                            width: `${
                              (location.available / location.total) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {location.features?.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToReserve(location.id);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Modern Navigation - Fixed Position */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <ModernNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-20">{renderContent()}</div>
    </div>
  );
};

export default SmartParkingApp;
