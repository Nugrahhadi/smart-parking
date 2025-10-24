import React, { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Clock,
  CreditCard,
  Check,
  AlertTriangle,
  Info,
  Trash2,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Reservation Confirmed",
      description: "Your reservation at Central Mall Parking has been confirmed.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "30 Minutes Remaining",
      description: "You have 30 minutes left on your parking at City Plaza.",
      time: "45 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "warning",
      title: "Reservation Expiring Soon",
      description: "Your reservation will expire in 15 minutes. Would you like to extend?",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 4,
      type: "success",
      title: "Payment Successful",
      description: "Your payment of Rp 35,000 for parking has been processed successfully.",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 5,
      type: "info",
      title: "New Feature Available",
      description: "You can now reserve parking spots up to 7 days in advance!",
      time: "1 day ago",
      read: true,
    },
    {
      id: 6,
      type: "warning",
      title: "Parking Almost Full",
      description: "Central Mall Parking is 90% full. Reserve your spot now!",
      time: "2 days ago",
      read: true,
    },
  ]);

  const [showNotificationActions, setShowNotificationActions] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const goBack = () => {
    navigate(-1);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setShowNotificationActions(null);
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    setShowNotificationActions(null);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowClearConfirm(false);
  };

  const toggleNotificationActions = (id) => {
    if (showNotificationActions === id) {
      setShowNotificationActions(null);
    } else {
      setShowNotificationActions(id);
    }
  };

  // Helper function to get icon by notification type
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case "info":
        return <Info size={20} className="text-blue-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  // Helper function to get background color by notification type
  const getBgColor = (type, read) => {
    if (read) return "bg-white";
    
    switch (type) {
      case "success":
        return "bg-green-50";
      case "warning":
        return "bg-yellow-50";
      case "info":
        return "bg-blue-50";
      default:
        return "bg-white";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            onClick={goBack}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-4">Notifications</h1>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex">
            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead}
                className="mr-2 text-sm bg-blue-500 px-3 py-1 rounded-full text-white"
              >
                Mark all as read
              </button>
            )}
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="text-sm bg-blue-500 px-3 py-1 rounded-full text-white"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Bell size={64} className="text-blue-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Notifications</h2>
            <p className="text-gray-500">You're all caught up! Check back later for updates on your parking.</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800">Recent</h2>
              {notifications.filter(n => !n.read).length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No new notifications</p>
              )}
              {notifications
                .filter(n => !n.read)
                .map(notification => (
                  <div 
                    key={notification.id}
                    className={`mt-3 p-4 rounded-lg shadow-sm relative ${getBgColor(notification.type, notification.read)}`}
                  >
                    <div className="flex">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-bold text-gray-800">{notification.title}</h3>
                          <button 
                            onClick={() => toggleNotificationActions(notification.id)}
                            className="p-1"
                          >
                            <MoreVertical size={18} className="text-gray-500" />
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{notification.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock size={12} className="mr-1" />
                          <span>{notification.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notification Actions Dropdown */}
                    {showNotificationActions === notification.id && (
                      <div className="absolute right-4 top-12 bg-white shadow-lg rounded-md py-2 w-40 z-10">
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                        >
                          <Check size={16} className="mr-2 text-blue-600" />
                          Mark as read
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">Earlier</h2>
              {notifications
                .filter(n => n.read)
                .map(notification => (
                  <div 
                    key={notification.id}
                    className={`mt-3 p-4 rounded-lg shadow-sm relative ${getBgColor(notification.type, notification.read)}`}
                  >
                    <div className="flex">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-bold text-gray-800">{notification.title}</h3>
                          <button 
                            onClick={() => toggleNotificationActions(notification.id)}
                            className="p-1"
                          >
                            <MoreVertical size={18} className="text-gray-500" />
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{notification.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock size={12} className="mr-1" />
                          <span>{notification.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notification Actions Dropdown */}
                    {showNotificationActions === notification.id && (
                      <div className="absolute right-4 top-12 bg-white shadow-lg rounded-md py-2 w-40 z-10">
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-4">
            <h2 className="text-lg font-bold mb-2">Clear All Notifications</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to clear all notifications? This action cannot be undone.
            </p>
            <div className="flex">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 border border-gray-300 rounded-md mr-2 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={clearAllNotifications}
                className="flex-1 py-2 bg-red-600 text-white rounded-md font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;