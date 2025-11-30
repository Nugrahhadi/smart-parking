import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  ArrowRight,
  Loader,
  Car,
  CreditCard,
  XCircle,
  Timer,
  Sparkles,
  Crown,
  Zap,
  ShoppingBag,
  Utensils,
  Music,
  MapPinned,
} from "lucide-react";
import ReservationDetailModal from "./ReservationDetailModal";

const ReservationsTab = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Handle show detail
  const handleShowDetail = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedReservation(null);
  };

  // Fetch reservations from API
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (token) {
        console.log("🔍 Fetching reservations from API...");

        // Fetch from API with correct endpoint
        const response = await fetch(
          "http://localhost:5000/api/reservations/my-reservations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Received reservations:", data.length, "items");
          console.log("📊 Sample data:", data[0]); // Log first item for debugging
          setReservations(data);
        } else {
          console.error(
            "❌ Failed to fetch reservations. Status:",
            response.status
          );
          const errorText = await response.text();
          console.error("Error response:", errorText);
          setError("Failed to load reservations");
        }
      } else {
        console.warn("⚠️ No token found in localStorage");
      }
    } catch (error) {
      console.error("❌ Error fetching reservations:", error);
      setError("Error loading reservations");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount and when new reservation is created
  useEffect(() => {
    fetchReservations();

    // ✅ Listen for new reservation events from localStorage
    const handleStorageChange = (e) => {
      if (e.key === "newReservation") {
        console.log("🔔 New reservation detected! Auto-refreshing...");
        fetchReservations();
        localStorage.removeItem("newReservation"); // Clear the trigger
      }
    };

    // ✅ Auto-refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Tab visible again, refreshing reservations...");
        fetchReservations();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Helper function to categorize reservations
  const categorizeReservations = () => {
    const now = new Date();
    const active = [];
    const upcoming = [];
    const past = [];

    reservations.forEach((reservation) => {
      const startTime = new Date(
        reservation.reservation_date + " " + reservation.start_time
      );
      const endTime = new Date(
        reservation.reservation_date + " " + reservation.end_time
      );

      // ✅ FIXED: Show reservations with ANY status (pending, active, completed)
      // Group by time, not by status
      if (now >= startTime && now <= endTime) {
        // Currently active (happening now)
        active.push(reservation);
      } else if (now < startTime) {
        // Future reservation (upcoming)
        upcoming.push(reservation);
      } else {
        // Past reservation
        past.push(reservation);
      }
    });

    return { active, upcoming, past };
  };

  // Helper function to get price by zone type
  const getPriceByZone = (zoneType) => {
    const priceMap = {
      "VIP Royal Zone": 25000,
      "Entertainment District": 15000,
      "Shopping Paradise": 12000,
      "Culinary Heaven": 10000,
      "Electric Vehicle Station": 20000,
      "Regular Parking": 8000,
    };
    return priceMap[zoneType] || 8000;
  };

  const {
    active: activeReservations,
    upcoming: upcomingReservations,
    past: pastReservations,
  } = categorizeReservations();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 mx-auto border-4 border-blue-200 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading your reservations...
          </p>
          <p className="text-gray-400 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  // Empty state when no reservations exist
  if (reservations.length === 0 && !loading && !error) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Reservations
          </h1>
          <p className="text-gray-600">Manage your parking history</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Car className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No Reservations Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start your parking journey by making your first reservation!
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Find Parking Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get zone icon and color
  const getZoneInfo = (zoneType) => {
    const zones = {
      "VIP Royal Zone": {
        icon: Crown,
        color: "from-purple-500 to-pink-500",
        badge: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800",
        border: "border-purple-500",
      },
      "Entertainment District": {
        icon: Music,
        color: "from-blue-500 to-cyan-500",
        badge: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800",
        border: "border-blue-500",
      },
      "Shopping Paradise": {
        icon: ShoppingBag,
        color: "from-pink-500 to-rose-500",
        badge: "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800",
        border: "border-pink-500",
      },
      "Culinary Heaven": {
        icon: Utensils,
        color: "from-orange-500 to-red-500",
        badge: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800",
        border: "border-orange-500",
      },
      "Electric Vehicle Station": {
        icon: Zap,
        color: "from-green-500 to-emerald-500",
        badge: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800",
        border: "border-green-500",
      },
      "Regular Parking": {
        icon: MapPinned,
        color: "from-gray-500 to-slate-500",
        badge: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800",
        border: "border-gray-500",
      },
    };
    return zones[zoneType] || zones["Regular Parking"];
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50 p-4 overflow-y-auto">
      {/* Header with gradient */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          My Reservations
        </h1>
        <p className="text-gray-600">Manage your parking history</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center shadow-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Active Reservations Section */}
      {activeReservations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-gray-800">Active Now</h2>
            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full animate-pulse">
              {activeReservations.length} Active
            </span>
          </div>

          {activeReservations.map((reservation) => {
            const ZoneIcon = getZoneInfo(
              reservation.zone_type || "Regular Parking"
            ).icon;
            const zoneColor = getZoneInfo(
              reservation.zone_type || "Regular Parking"
            ).color;

            return (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-5 mb-4 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl"
              >
                {/* Header with gradient */}
                <div
                  className={`bg-gradient-to-r ${zoneColor} rounded-xl p-4 mb-4 text-white`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <ZoneIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium opacity-90">
                          {reservation.zone_type || "Regular Parking"}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">
                        {reservation.parking_location}
                      </h3>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <p className="text-sm opacity-90">
                          Spot {reservation.slot_number}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Timer className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center text-blue-600 mb-1">
                      <Calendar size={16} className="mr-2" />
                      <span className="text-xs font-medium">Date</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(
                        reservation.reservation_date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center text-purple-600 mb-1">
                      <Clock size={16} className="mr-2" />
                      <span className="text-xs font-medium">Duration</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {reservation.start_time} - {reservation.end_time}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center text-green-600 mb-1">
                      <Car size={16} className="mr-2" />
                      <span className="text-xs font-medium">Vehicle</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {reservation.license_plate}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center text-orange-600 mb-1">
                      <CreditCard size={16} className="mr-2" />
                      <span className="text-xs font-medium">Price/Hour</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Rp {getPriceByZone(reservation.zone_type || "Regular Parking").toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowDetail(reservation)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <ArrowRight size={16} className="mr-2" />
                    View Detail
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center">
                    <MapPin size={16} className="mr-2" />
                    Navigate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming Reservations Section */}
      {upcomingReservations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-gray-800">Coming Soon</h2>
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {upcomingReservations.length} Scheduled
            </span>
          </div>

          {upcomingReservations.map((reservation) => {
            const ZoneIcon = getZoneInfo(
              reservation.zone_type || "Regular Parking"
            ).icon;
            const zoneBadge = getZoneInfo(
              reservation.zone_type || "Regular Parking"
            ).badge;

            return (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl shadow-md border border-blue-100 p-5 mb-4 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center ${zoneBadge} px-3 py-1 rounded-full mb-2`}
                    >
                      <ZoneIcon className="w-4 h-4 mr-2" />
                      <span className="text-xs font-semibold">
                        {reservation.zone_type || "Regular Parking"}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {reservation.parking_location}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        Spot {reservation.slot_number}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
                      Upcoming
                    </span>
                    <p className="text-lg font-bold text-gray-800">
                      Rp {getPriceByZone(reservation.zone_type || "Regular Parking").toLocaleString()}/hour
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center bg-gray-50 rounded-lg p-2">
                    <Calendar size={14} className="text-gray-500 mr-2" />
                    <span className="text-xs text-gray-700">
                      {new Date(
                        reservation.reservation_date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-lg p-2">
                    <Clock size={14} className="text-gray-500 mr-2" />
                    <span className="text-xs text-gray-700">
                      {reservation.start_time}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center">
                    <XCircle size={16} className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleShowDetail(reservation)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-md"
                  >
                    <ArrowRight size={16} className="mr-2" />
                    View Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Reservations Section */}
      <div>
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-gray-800">History</h2>
          <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            {pastReservations.length} Completed
          </span>
        </div>

        {pastReservations.length > 0 ? (
          pastReservations.map((reservation) => {
            const ZoneIcon = getZoneInfo(
              reservation.zone_type || "Regular Parking"
            ).icon;
            const isCompleted = reservation.status === "completed";

            return (
              <div
                key={reservation.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <ZoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">
                        {reservation.zone_type || "Regular Parking"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {reservation.parking_location}
                    </h3>
                    <div className="flex items-center text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="text-xs">
                        Spot {reservation.slot_number}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {isCompleted ? (
                      <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full mb-2">
                        <CheckCircle size={14} className="mr-1" />
                        <span className="text-xs font-semibold">Completed</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full mb-2">
                        <XCircle size={14} className="mr-1" />
                        <span className="text-xs font-semibold">Cancelled</span>
                      </div>
                    )}
                    <p className="text-sm font-bold text-gray-800">
                      Rp {getPriceByZone(reservation.zone_type || "Regular Parking").toLocaleString()}/hour
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    <span>
                      {new Date(
                        reservation.reservation_date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    <span>
                      {reservation.start_time} - {reservation.end_time}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleShowDetail(reservation)}
                  className="w-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 py-2 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-300 hover:bg-gray-50"
                >
                  <ArrowRight size={16} className="mr-2" />
                  View Detail
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              No past reservations yet
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Your parking history will appear here
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default ReservationsTab;
