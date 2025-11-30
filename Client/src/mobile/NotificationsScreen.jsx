import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bell,
  Clock,
  Check,
  AlertTriangle,
  Info,
  Trash2,
  MoreVertical,
  CheckCircle,
} from "lucide-react";

const NotificationsScreen = ({ onNotificationsChange, onGoBack }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "success", title: "Reservation Confirmed", description: "Your reservation at Central Mall Parking has been confirmed.", time: "10 minutes ago", read: false },
    { id: 2, type: "info", title: "30 Minutes Remaining", description: "You have 30 minutes left on your parking at City Plaza.", time: "45 minutes ago", read: false },
    { id: 3, type: "warning", title: "Reservation Expiring Soon", description: "Your reservation will expire in 15 minutes. Would you like to extend?", time: "1 hour ago", read: true },
    { id: 4, type: "success", title: "Payment Successful", description: "Your payment of Rp 35,000 for parking has been processed successfully.", time: "3 hours ago", read: true },
    { id: 5, type: "info", title: "New Feature Available", description: "You can now reserve parking spots up to 7 days in advance!", time: "1 day ago", read: true },
    { id: 6, type: "warning", title: "Parking Almost Full", description: "Central Mall Parking is 90% full. Reserve your spot now!", time: "2 days ago", read: true },
  ]);

  const [showNotificationActions, setShowNotificationActions] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    onNotificationsChange?.(unreadCount);
  }, [notifications, onNotificationsChange]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const keepOpen = e.target.closest("[data-keep-open='true']");
      if (!keepOpen) setShowNotificationActions(null);
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, []);

  const goBack = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  const markAsRead = (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    setShowNotificationActions(null);
  };

  const markAllAsRead = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const deleteNotification = (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    setShowNotificationActions(null);
  };

  const clearAllNotifications = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setNotifications([]);
    setShowClearConfirm(false);
  };

  const toggleNotificationActions = (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowNotificationActions((cur) => (cur === id ? null : id));
  };

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

  const getBorderColor = (type) => {
    switch (type) {
      case "success":
        return "border-green-500";
      case "warning":
        return "border-yellow-500";
      case "info":
        return "border-blue-500";
      default:
        return "border-gray-500";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg pointer-events-auto flex-shrink-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={goBack}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-all duration-300 group active:scale-95"
            >
              <ArrowLeft size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
              <p className="text-xs text-gray-500">{notifications.filter((n) => !n.read).length} new</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center space-x-2">
              {notifications.some((n) => !n.read) && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                >
                  Mark all
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Bell size={40} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Notifications</h2>
            <p className="text-gray-500 mb-6">You're all caught up! Check back later for updates on your parking.</p>
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {notifications.filter((n) => !n.read).length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">New</h2>
                <div className="space-y-3">
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl shadow-sm relative border-l-4 transition-all duration-300 hover:shadow-md ${getBgColor(notification.type, notification.read)} ${getBorderColor(notification.type)}`}
                      >
                        <div className="flex">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-bold text-gray-800">{notification.title}</h3>
                              <button
                                type="button"
                                data-keep-open="true"
                                onClick={(e) => toggleNotificationActions(notification.id, e)}
                                className="p-1 hover:bg-gray-200 rounded transition-all flex-shrink-0"
                                aria-haspopup="menu"
                                aria-expanded={showNotificationActions === notification.id}
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

                        {showNotificationActions === notification.id && (
                          <div
                            data-keep-open="true"
                            className="absolute right-4 top-12 bg-white shadow-lg rounded-md py-2 w-40 z-40 border border-gray-200"
                            role="menu"
                          >
                            <button
                              type="button"
                              onClick={(e) => markAsRead(notification.id, e)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center transition-all"
                              role="menuitem"
                            >
                              <Check size={16} className="mr-2 text-blue-600" />
                              Mark as read
                            </button>
                            <button
                              type="button"
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600 transition-all"
                              role="menuitem"
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

            {notifications.filter((n) => n.read).length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Earlier</h2>
                <div className="space-y-3">
                  {notifications
                    .filter((n) => n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl shadow-sm relative border-l-4 transition-all duration-300 hover:shadow-md ${getBgColor(notification.type, notification.read)} ${getBorderColor(notification.type)}`}
                      >
                        <div className="flex">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-bold text-gray-800">{notification.title}</h3>
                              <button
                                type="button"
                                data-keep-open="true"
                                onClick={(e) => toggleNotificationActions(notification.id, e)}
                                className="p-1 hover:bg-gray-200 rounded transition-all flex-shrink-0"
                                aria-haspopup="menu"
                                aria-expanded={showNotificationActions === notification.id}
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

                        {showNotificationActions === notification.id && (
                          <div
                            data-keep-open="true"
                            className="absolute right-4 top-12 bg-white shadow-lg rounded-md py-2 w-40 z-40 border border-gray-200"
                            role="menu"
                          >
                            <button
                              type="button"
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600 transition-all"
                              role="menuitem"
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
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Clear All?</h2>
            </div>
            <p className="text-gray-600 mb-6">
              All {notifications.length} notification{notifications.length !== 1 ? "s" : ""} will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={(e) => {
                  e?.preventDefault();
                  e?.stopPropagation();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={clearAllNotifications}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;