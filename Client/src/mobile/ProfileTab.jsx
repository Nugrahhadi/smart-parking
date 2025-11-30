import React, { useState, useEffect } from "react";
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
  Loader,
  AlertCircle,
} from "lucide-react";
import { userAPI, clearAuth } from "../services/api";

const ProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userAPI.getProfile();
        setProfile(data);
        console.log("✅ Profile loaded:", data);
      } catch (err) {
        console.error("❌ Error loading profile:", err);
        setError(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  const { user, statistics, vehicles, recentReservations } = profile;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50 py-4 px-4 overflow-y-auto pb-20">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-4 text-white shadow-lg">
        <div className="flex items-center mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 border-2 border-white/30">
            <User size={36} className="text-white" />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.username || user.name}</h2>
            <p className="text-sm opacity-90">{user.email}</p>
            <p className="text-sm opacity-80 mt-1">
              Member since: {new Date(user.memberSince).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Reservations</div>
            <div className="text-xl font-bold">
              {statistics.totalReservations}
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Spent</div>
            <div className="text-xl font-bold">
              Rp {statistics.totalSpent?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">My Vehicles</h3>
        <div className="space-y-2">
          {vehicles.length === 0 && (
            <p className="text-gray-500">No vehicles registered</p>
          )}
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-3 bg-white rounded-lg shadow flex items-center"
            >
              <Car className="mr-3" />
              <div className="flex-1">
                <div className="font-semibold">{v.licensePlate}</div>
                <div className="text-sm text-gray-500">
                  {v.brand} {v.model} • {v.type}
                </div>
              </div>
              <ChevronRight />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Recent Reservations</h3>
        <div className="space-y-2">
          {recentReservations.length === 0 && (
            <p className="text-gray-500">No recent reservations</p>
          )}
          {recentReservations.map((r) => (
            <div key={r.id} className="p-3 bg-white rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{r.locationName}</div>
                  <div className="text-sm text-gray-500">
                    Spot {r.spotNumber} • {r.zoneType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(r.startTime).toLocaleDateString()}
                  </div>
                  <div className="font-semibold">{r.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
