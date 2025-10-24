import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Car,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Crown,
  Music,
  ShoppingBag,
  Coffee,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Helper functions for data transformation
const getZoneFromSlot = (slotNumber) => {
  if (!slotNumber) return "regular";
  const zone = slotNumber.charAt(0).toLowerCase();
  const zoneMap = {
    a: "vip",
    b: "regular",
    c: "shopping",
    d: "dining",
    e: "electric",
    f: "entertainment",
  };
  return zoneMap[zone] || "regular";
};

const getZoneNameFromSlot = (slotNumber) => {
  const zone = getZoneFromSlot(slotNumber);
  const zoneNames = {
    vip: "VIP Royal Zone",
    regular: "Regular Zone",
    shopping: "Shopping Zone",
    dining: "Dining Zone",
    electric: "Electric Vehicle Zone",
    entertainment: "Entertainment Zone",
  };
  return zoneNames[zone] || "Regular Zone";
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours
};

const ReservationHistoryScreen = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, completed, cancelled

  // Icons for different zones
  const zoneIcons = {
    vip: Crown,
    entertainment: Music,
    shopping: ShoppingBag,
    dining: Coffee,
    electric: Zap,
    regular: Car,
  };

  // Zone colors
  const zoneColors = {
    vip: "from-yellow-400 to-yellow-600",
    entertainment: "from-purple-400 to-purple-600",
    shopping: "from-pink-400 to-pink-600",
    dining: "from-orange-400 to-orange-600",
    electric: "from-green-400 to-green-600",
    regular: "from-blue-400 to-blue-600",
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (token) {
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
            console.log("📦 Raw API Response:", data);
            console.log("📦 Data count:", data.length);
            if (data.length > 0) {
              console.log("📦 First item:", data[0]);
              console.log("📦 Fields:", Object.keys(data[0]));
            }

            // Transform API data to match component format
            // ✅ FIXED: Backend returns parking_location, total_cost (not location_name, total_amount)
            const transformedData = data.map((reservation) => {
              console.log("🔄 Transforming:", reservation);

              return {
                id: reservation.id,
                locationName:
                  reservation.parking_location || "Unknown Location", // ✅ Fixed field name
                locationAddress:
                  reservation.location_address || "Address not available",
                slotId: reservation.slot_number || "N/A",
                zone: getZoneFromSlot(reservation.slot_number),
                zoneName: getZoneNameFromSlot(reservation.slot_number),
                startTime: reservation.start_time,
                endTime: reservation.end_time,
                reservationDate: reservation.reservation_date || "",
                duration: calculateDuration(
                  `${reservation.reservation_date || ""} ${
                    reservation.start_time || ""
                  }`,
                  `${reservation.reservation_date || ""} ${
                    reservation.end_time || ""
                  }`
                ),
                totalAmount: parseFloat(reservation.total_cost) || 0, // ✅ Fixed field name
                status: reservation.status || "unknown",
                createdAt: reservation.created_at,
                vehiclePlate: reservation.license_plate, // ✅ Fixed field name
                vehicleName: reservation.vehicle_name,
                vehicleType: reservation.vehicle_type,
                paymentMethod: reservation.payment_method || "Cash",
                paymentStatus: reservation.payment_status || "pending",
              };
            });

            console.log("✅ Transformed data:", transformedData);
            console.log("✅ Total reservations:", transformedData.length);
            setReservations(transformedData);
          } else {
            console.error(
              "❌ Failed to fetch reservations:",
              response.status,
              response.statusText
            );
            setReservations([]);
          }
        } else {
          console.log("No auth token found");
          setReservations([]);
        }
      } catch (error) {
        console.error("Error fetching reservations:", error);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <RefreshCw className="text-blue-500" size={20} />;
      case "completed":
        return <CheckCircle className="text-green-500" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Sedang Berlangsung";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-blue-600 bg-blue-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (activeTab === "active") {
      return reservation.status === "active";
    } else if (activeTab === "completed") {
      return reservation.status === "completed";
    } else if (activeTab === "cancelled") {
      return reservation.status === "cancelled";
    }
    return true;
  });

  const ReservationCard = ({ reservation }) => {
    const Icon = zoneIcons[reservation.zone] || Car;
    const zoneColor =
      zoneColors[reservation.zone] || "from-gray-400 to-gray-600";

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg mb-4 border-l-4 border-blue-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-r ${zoneColor} flex items-center justify-center mr-4`}
            >
              <Icon className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {reservation.locationName}
              </h3>
              <p className="text-sm text-gray-600">
                Slot {reservation.slotId} - {reservation.zoneName}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              reservation.status
            )}`}
          >
            {getStatusText(reservation.status)}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2 flex-shrink-0" />
            <span>{reservation.locationAddress}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 flex-shrink-0" />
            <span>
              {formatDateTime(reservation.startTime)} -{" "}
              {formatDateTime(reservation.endTime)}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CreditCard size={16} className="mr-2 flex-shrink-0" />
            <span>
              Rp {reservation.totalAmount.toLocaleString()} (
              {reservation.duration} jam)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center text-xs text-gray-500">
            {getStatusIcon(reservation.status)}
            <span className="ml-2">ID: {reservation.id}</span>
          </div>

          {reservation.status === "active" && (
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Lihat Detail
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                History Reservasi
              </h1>
              <p className="text-sm text-gray-600">Riwayat parkir Anda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {[
            {
              key: "active",
              label: "Aktif",
              count: reservations.filter((r) => r.status === "active").length,
            },
            {
              key: "completed",
              label: "Selesai",
              count: reservations.filter((r) => r.status === "completed")
                .length,
            },
            {
              key: "cancelled",
              label: "Dibatalkan",
              count: reservations.filter((r) => r.status === "cancelled")
                .length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Reservations List */}
        <div className="max-w-4xl mx-auto">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Tidak ada reservasi {getStatusText(activeTab).toLowerCase()}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === "active"
                  ? "Anda belum memiliki reservasi yang sedang berlangsung"
                  : "Belum ada riwayat reservasi"}
              </p>
              <button
                onClick={() => navigate("/parking")}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Mulai Reservasi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationHistoryScreen;
