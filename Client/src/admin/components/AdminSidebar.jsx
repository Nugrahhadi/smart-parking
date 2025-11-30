import React from "react";
import {
  BarChart3,
  Users,
  Settings,
  CreditCard,
  MapPin,
  LogOut,
  ChevronDown,
  Home,
  FileText,
} from "lucide-react";

const AdminSidebar = ({ open, onClose, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "users", label: "Users", icon: Users },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white transition-transform duration-300 z-40 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:sticky md:top-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-600 flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-700" />
          </div>
          <h2 className="text-xl font-bold">ParkFlow</h2>
        </div>

        {/* Menu */}
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-white bg-opacity-20 text-white"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-600">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition font-medium">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
