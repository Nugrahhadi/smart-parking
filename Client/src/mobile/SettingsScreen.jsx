import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Globe,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [language, setLanguage] = useState("English");
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const goBack = () => {
    navigate(-1);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you would apply dark mode to the entire app here
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const toggleLocation = () => {
    setLocationEnabled(!locationEnabled);
  };

  const languages = [
    "English",
    "Indonesian",
    "Japanese",
    "Korean",
    "Mandarin",
    "Spanish",
  ];

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  // Setting sections
  const accountSettings = [
    {
      icon: <User size={20} className="text-blue-600" />,
      title: "Account Information",
      description: "Manage your personal information",
      action: () => navigate("/mobile/account"),
    },
    {
      icon: <Lock size={20} className="text-blue-600" />,
      title: "Security",
      description: "Password, PIN, and authentication",
      action: () => navigate("/mobile/security"),
    },
    {
      icon: <CreditCard size={20} className="text-blue-600" />,
      title: "Payment Methods",
      description: "Add and manage payment methods",
      action: () => navigate("/mobile/payment-methods"),
    },
  ];

  const appSettings = [
    {
      icon: darkMode ? (
        <Moon size={20} className="text-blue-600" />
      ) : (
        <Sun size={20} className="text-blue-600" />
      ),
      title: "Dark Mode",
      description: "Toggle dark theme",
      toggle: true,
      enabled: darkMode,
      action: toggleDarkMode,
    },
    {
      icon: <Bell size={20} className="text-blue-600" />,
      title: "Notifications",
      description: "Manage push notifications",
      toggle: true,
      enabled: notificationsEnabled,
      action: toggleNotifications,
    },
    {
      icon: <Globe size={20} className="text-blue-600" />,
      title: "Language",
      description: language,
      action: () => setShowLanguageModal(true),
    },
    {
      icon: <HelpCircle size={20} className="text-blue-600" />,
      title: "Location Services",
      description: "Allow app to access your location",
      toggle: true,
      enabled: locationEnabled,
      action: toggleLocation,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex items-center">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          onClick={goBack}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-4">Settings</h1>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-auto p-4">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Account</h2>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            {accountSettings.map((setting, index) => (
              <div
                key={index}
                className={`p-4 ${
                  index < accountSettings.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <button
                  className="w-full flex items-center"
                  onClick={setting.action}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                    {setting.icon}
                  </div>
                  <div className="flex-grow text-left">
                    <h3 className="font-bold text-gray-800">{setting.title}</h3>
                    <p className="text-sm text-gray-500">
                      {setting.description}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">App Settings</h2>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            {appSettings.map((setting, index) => (
              <div
                key={index}
                className={`p-4 ${
                  index < appSettings.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                {setting.toggle ? (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      {setting.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-800">
                        {setting.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {setting.description}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer ${
                        setting.enabled ? "bg-blue-600" : "bg-gray-300"
                      }`}
                      onClick={setting.action}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          setting.enabled ? "translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full flex items-center"
                    onClick={setting.action}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      {setting.icon}
                    </div>
                    <div className="flex-grow text-left">
                      <h3 className="font-bold text-gray-800">
                        {setting.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {setting.description}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">About</h2>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <button
                className="w-full flex items-center"
                onClick={() => navigate("/mobile/help")}
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <HelpCircle size={20} className="text-blue-600" />
                </div>
                <div className="flex-grow text-left">
                  <h3 className="font-bold text-gray-800">Help & Support</h3>
                  <p className="text-sm text-gray-500">
                    Get assistance and FAQs
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <button
                className="w-full flex items-center text-red-500"
                onClick={() => {
                  // Handle logout functionality here
                  navigate("/login");
                }}
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-3">
                  <LogOut size={20} className="text-red-500" />
                </div>
                <div className="flex-grow text-left">
                  <h3 className="font-bold">Sign Out</h3>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mb-6 text-gray-500 text-sm">
          <p>Smart Parking App v1.0.0</p>
          <p>© 2025 Smart Parking Company</p>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Select Language</h2>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang}
                  className="w-full text-left p-4 border-b border-gray-100 flex items-center justify-between"
                  onClick={() => handleLanguageSelect(lang)}
                >
                  <span>{lang}</span>
                  {language === lang && (
                    <Check size={20} className="text-blue-600" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowLanguageModal(false)}
                className="w-full py-2 bg-blue-600 text-white rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
