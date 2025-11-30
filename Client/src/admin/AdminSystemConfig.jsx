import React, { useState } from "react";
import {
  Save,
  RefreshCw,
  Cloud,
  Database,
  Mail,
  CreditCard,
  AlertTriangle,
  Check,
  X,
  Info,
} from "lucide-react";

const AdminSystemConfig = () => {
  // Show placeholder message since backend API is not implemented yet
  const [showPlaceholder] = useState(true);

  if (showPlaceholder) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">System Configuration</h2>
          <p className="text-gray-600 mb-6">
            The system configuration API is not yet implemented. This feature
            will be available soon.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-medium text-blue-900 mb-2">Coming Soon:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• General system settings</li>
              <li>• Payment gateway configuration</li>
              <li>• Notification preferences</li>
              <li>• System maintenance mode</li>
              <li>• Backup management</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Mock configuration data (not used currently)
  const [config, setConfig] = useState({
    general: {
      systemName: "Smart Parking System",
      companyName: "PT Smart Parking Indonesia",
      contactEmail: "support@smartparking.id",
      maxReservationHours: 24,
      gracePeriodMinutes: 15,
      cancelationPolicyMinutes: 30,
    },
    payment: {
      paymentGateway: "Midtrans",
      currency: "IDR",
      convenienceFee: 2000,
      taxPercentage: 10,
      acceptedMethods: ["Credit Card", "E-wallet", "Bank Transfer"],
    },
    notification: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      reminderMinutesBefore: 30,
      emailProvider: "SendGrid",
      emailSenderAddress: "noreply@smartparking.id",
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      apiBaseUrl: "https://api.smartparking.id/v1",
      sensorPollingInterval: 60,
      dataRetentionDays: 90,
      backupFrequency: "Daily",
    },
  });

  // Mock backup history
  const backupHistory = [
    {
      id: 1,
      timestamp: "2023-06-17 02:00:00",
      size: "45.2 MB",
      status: "success",
    },
    {
      id: 2,
      timestamp: "2023-06-16 02:00:00",
      size: "44.8 MB",
      status: "success",
    },
    {
      id: 3,
      timestamp: "2023-06-15 02:00:00",
      size: "43.6 MB",
      status: "success",
    },
    {
      id: 4,
      timestamp: "2023-06-14 02:00:00",
      size: "43.1 MB",
      status: "failed",
    },
    {
      id: 5,
      timestamp: "2023-06-13 02:00:00",
      size: "42.5 MB",
      status: "success",
    },
  ];

  // Mock system logs
  const systemLogs = [
    {
      id: 1,
      timestamp: "2023-06-17 10:23:45",
      level: "INFO",
      message: "User admin logged in",
      module: "AUTH",
    },
    {
      id: 2,
      timestamp: "2023-06-17 09:15:22",
      level: "WARNING",
      message: "High load detected on database server",
      module: "SYSTEM",
    },
    {
      id: 3,
      timestamp: "2023-06-17 08:30:11",
      level: "ERROR",
      message: "Failed to connect to payment gateway",
      module: "PAYMENT",
    },
    {
      id: 4,
      timestamp: "2023-06-17 08:05:33",
      level: "INFO",
      message: "System backup completed successfully",
      module: "BACKUP",
    },
    {
      id: 5,
      timestamp: "2023-06-17 00:01:05",
      level: "INFO",
      message: "Daily maintenance tasks started",
      module: "SYSTEM",
    },
  ];

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Function to render log level badge
  const renderLogLevelBadge = (level) => {
    let bgColor, textColor;

    switch (level) {
      case "ERROR":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "WARNING":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "INFO":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${bgColor} ${textColor}`}
      >
        {level}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar would be here, but we'll reuse the one from AdminDashboard */}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <div className="bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold">System Configuration</h2>
          <p className="text-gray-600">Manage and configure system settings</p>
        </div>

        {/* Configuration Tabs */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  className={`py-4 px-6 font-medium text-sm ${
                    activeTab === "general"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("general")}
                >
                  General Settings
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm ${
                    activeTab === "payment"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("payment")}
                >
                  Payment Settings
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm ${
                    activeTab === "notification"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("notification")}
                >
                  Notification Settings
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm ${
                    activeTab === "system"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("system")}
                >
                  System Maintenance
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    General Configuration
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        System Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.general.systemName}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              systemName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.general.companyName}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              companyName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.general.contactEmail}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              contactEmail: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Reservation Hours
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.general.maxReservationHours}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              maxReservationHours: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grace Period (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.general.gracePeriodMinutes}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              gracePeriodMinutes: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Free Cancellation Time (minutes before)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.general.cancelationPolicyMinutes}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              cancelationPolicyMinutes: parseInt(
                                e.target.value
                              ),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payment" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Payment Configuration
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Gateway
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.payment.paymentGateway}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            payment: {
                              ...config.payment,
                              paymentGateway: e.target.value,
                            },
                          })
                        }
                      >
                        <option>Midtrans</option>
                        <option>Xendit</option>
                        <option>Doku</option>
                        <option>Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.payment.currency}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            payment: {
                              ...config.payment,
                              currency: e.target.value,
                            },
                          })
                        }
                      >
                        <option>IDR</option>
                        <option>USD</option>
                        <option>SGD</option>
                        <option>MYR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Convenience Fee (in smallest unit)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.payment.convenienceFee}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            payment: {
                              ...config.payment,
                              convenienceFee: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Percentage
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.payment.taxPercentage}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            payment: {
                              ...config.payment,
                              taxPercentage: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accepted Payment Methods
                      </label>
                      <div className="space-y-2 mt-1">
                        {[
                          "Credit Card",
                          "E-wallet",
                          "Bank Transfer",
                          "Cash",
                        ].map((method) => (
                          <div key={method} className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded"
                              checked={config.payment.acceptedMethods.includes(
                                method
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setConfig({
                                    ...config,
                                    payment: {
                                      ...config.payment,
                                      acceptedMethods: [
                                        ...config.payment.acceptedMethods,
                                        method,
                                      ],
                                    },
                                  });
                                } else {
                                  setConfig({
                                    ...config,
                                    payment: {
                                      ...config.payment,
                                      acceptedMethods:
                                        config.payment.acceptedMethods.filter(
                                          (m) => m !== method
                                        ),
                                    },
                                  });
                                }
                              }}
                            />
                            <label className="ml-2 text-gray-700">
                              {method}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notification" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Notification Configuration
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notification Channels
                      </label>
                      <div className="flex flex-wrap gap-6 mt-1">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded"
                            checked={config.notification.emailEnabled}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                notification: {
                                  ...config.notification,
                                  emailEnabled: e.target.checked,
                                },
                              })
                            }
                          />
                          <label className="ml-2 text-gray-700">
                            Email Notifications
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded"
                            checked={config.notification.pushEnabled}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                notification: {
                                  ...config.notification,
                                  pushEnabled: e.target.checked,
                                },
                              })
                            }
                          />
                          <label className="ml-2 text-gray-700">
                            Push Notifications
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded"
                            checked={config.notification.smsEnabled}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                notification: {
                                  ...config.notification,
                                  smsEnabled: e.target.checked,
                                },
                              })
                            }
                          />
                          <label className="ml-2 text-gray-700">
                            SMS Notifications
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Provider
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.notification.emailProvider}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notification: {
                              ...config.notification,
                              emailProvider: e.target.value,
                            },
                          })
                        }
                        disabled={!config.notification.emailEnabled}
                      >
                        <option>SendGrid</option>
                        <option>Mailgun</option>
                        <option>Amazon SES</option>
                        <option>SMTP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Sender Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.notification.emailSenderAddress}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notification: {
                              ...config.notification,
                              emailSenderAddress: e.target.value,
                            },
                          })
                        }
                        disabled={!config.notification.emailEnabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Minutes Before Reservation
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.notification.reminderMinutesBefore}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notification: {
                              ...config.notification,
                              reminderMinutesBefore: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeTab === "system" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    System Maintenance
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <div className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <h4 className="font-medium">Maintenance Mode</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            When enabled, the system will be inaccessible to
                            regular users. Only admins can log in.
                          </p>
                        </div>

                        <label className="inline-flex items-center mt-3 md:mt-0">
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={config.system.maintenanceMode}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                system: {
                                  ...config.system,
                                  maintenanceMode: e.target.checked,
                                },
                              })
                            }
                          />
                          <div
                            className={`w-10 h-5 flex items-center rounded-full p-1 transition-all duration-300 ${
                              config.system.maintenanceMode
                                ? "bg-blue-600"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                config.system.maintenanceMode
                                  ? "translate-x-5"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Base URL
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.system.apiBaseUrl}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            system: {
                              ...config.system,
                              apiBaseUrl: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sensor Polling Interval (seconds)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.system.sensorPollingInterval}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            system: {
                              ...config.system,
                              sensorPollingInterval: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Retention (days)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.system.dataRetentionDays}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            system: {
                              ...config.system,
                              dataRetentionDays: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Backup Frequency
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={config.system.backupFrequency}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            system: {
                              ...config.system,
                              backupFrequency: e.target.value,
                            },
                          })
                        }
                      >
                        <option>Hourly</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>

                    <div className="col-span-2 mt-2">
                      <h4 className="font-medium mb-2">Backup History</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                              <th className="py-2 px-4 text-left font-medium">
                                Timestamp
                              </th>
                              <th className="py-2 px-4 text-left font-medium">
                                Size
                              </th>
                              <th className="py-2 px-4 text-left font-medium">
                                Status
                              </th>
                              <th className="py-2 px-4 text-left font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {backupHistory.map((backup) => (
                              <tr key={backup.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4">
                                  {backup.timestamp}
                                </td>
                                <td className="py-2 px-4">{backup.size}</td>
                                <td className="py-2 px-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      backup.status === "success"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {backup.status === "success" ? (
                                      <Check
                                        size={14}
                                        className="inline mr-1"
                                      />
                                    ) : (
                                      <X size={14} className="inline mr-1" />
                                    )}
                                    {backup.status.charAt(0).toUpperCase() +
                                      backup.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-2 px-4">
                                  <button className="text-blue-600 text-sm">
                                    Download
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center">
                          <Database size={16} className="mr-2" />
                          Create Backup Now
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 mt-2">
                      <h4 className="font-medium mb-2">System Logs</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                              <th className="py-2 px-4 text-left font-medium">
                                Timestamp
                              </th>
                              <th className="py-2 px-4 text-left font-medium">
                                Level
                              </th>
                              <th className="py-2 px-4 text-left font-medium">
                                Module
                              </th>
                              <th className="py-2 px-4 text-left font-medium">
                                Message
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {systemLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4">{log.timestamp}</td>
                                <td className="py-2 px-4">
                                  {renderLogLevelBadge(log.level)}
                                </td>
                                <td className="py-2 px-4">{log.module}</td>
                                <td className="py-2 px-4">{log.message}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <div className="flex items-center text-green-600">
                      <Check size={16} className="mr-1" />
                      <span>Configuration saved successfully</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md flex items-center">
                    <RefreshCw size={16} className="mr-2" />
                    Reset Changes
                  </button>
                  <button
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md flex items-center ${
                      isSaving ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemConfig;
