// src/screens/ReservationHistoryScreen.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Clock, MapPin, Car, CreditCard,
  CheckCircle, XCircle, RefreshCw, Crown, Music, ShoppingBag, Coffee, Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReservationDetailModal from "./ReservationDetailModal";

const HEADER_H = 56; // dikurangi agar gap atas lebih rapat
const FOOTER_H = 88;

const getZoneFromSlot = (slotNumber) => {
  if (!slotNumber) return "regular";
  const zone = String(slotNumber).charAt(0).toLowerCase();
  const zoneMap = { a: "vip", b: "regular", c: "shopping", d: "dining", e: "electric", f: "entertainment" };
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
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end - start;
    return Math.round(diffMs / (1000 * 60 * 60));
  } catch {
    return 0;
  }
};

const normalizeStatus = (s) => {
  const v = String(s || "").trim().toLowerCase();
  if (["active", "aktif", "ongoing", "in_progress"].includes(v)) return "active";
  if (["completed", "complete", "selesai", "done", "finished"].includes(v)) return "completed";
  if (["cancelled", "canceled", "dibatalkan", "void"].includes(v)) return "cancelled";
  return "unknown";
};

const ReservationHistoryScreen = ({ onNavigateToHome }) => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedReservation, setSelectedReservation] = useState(null);

  const zoneIcons = { vip: Crown, entertainment: Music, shopping: ShoppingBag, dining: Coffee, electric: Zap, regular: Car };
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
        if (!token) { setReservations([]); return; }
        const response = await fetch("http://localhost:5000/api/reservations/my-reservations", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!response.ok) { setReservations([]); return; }
        const data = await response.json();
        const transformed = (data || []).map((r) => {
          // Parse start and end datetime properly
          const reservationDate = r.reservation_date || "";
          const startTimeStr = r.start_time || "";
          const endTimeStr = r.end_time || "";
          
          // Combine date and time for proper datetime parsing
          const startDateTime = reservationDate && startTimeStr 
            ? new Date(`${reservationDate}T${startTimeStr}`)
            : new Date(r.start_time || "");
          const endDateTime = reservationDate && endTimeStr
            ? new Date(`${reservationDate}T${endTimeStr}`)
            : new Date(r.end_time || "");

          // Check if end time has passed for active reservations
          let finalStatus = normalizeStatus(r.status);
          if (finalStatus === "active" && new Date() > endDateTime) {
            finalStatus = "completed";
          }

          return {
            id: r.id,
            locationName: r.parking_location || "Unknown Location",
            locationAddress: r.location_address || "Address not available",
            slotId: r.slot_number || "N/A",
            zone: getZoneFromSlot(r.slot_number),
            zoneName: getZoneNameFromSlot(r.slot_number),
            startTime: startTimeStr,
            endTime: endTimeStr,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            reservationDate: r.reservation_date || "",
            duration: calculateDuration(startDateTime, endDateTime),
            totalAmount: parseFloat(r.total_cost) || 0,
            status: finalStatus,
            createdAt: r.created_at,
            vehiclePlate: r.license_plate,
            vehicleName: r.vehicle_name,
            vehicleType: r.vehicle_type,
            paymentMethod: r.payment_method || "Cash",
            paymentStatus: r.payment_status || "pending",
          };
        });
        setReservations(transformed);
      } catch { setReservations([]); } finally { setLoading(false); }
    };
    fetchReservations();
  }, []);

  // Real-time status update setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setReservations((prevReservations) =>
        prevReservations.map((reservation) => {
          if (reservation.status === "active" && new Date() > reservation.endDateTime) {
            return { ...reservation, status: "completed" };
          }
          return reservation;
        })
      );
    }, 1000); // Update setiap 1 detik

    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateObj) => {
    try {
      // Handle both string and Date object
      const date = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) =>
      activeTab === "active" ? r.status === "active"
        : activeTab === "completed" ? r.status === "completed"
        : activeTab === "cancelled" ? r.status === "cancelled"
        : true
    );
  }, [reservations, activeTab]);

  const counts = useMemo(() => ({
    active: reservations.filter(r => r.status === "active").length,
    completed: reservations.filter(r => r.status === "completed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  }), [reservations]);

  const Tabs = ({ active, onChange, counts }) => {
    const items = [
      { key: "active", label: "Aktif", icon: <RefreshCw size={16} />, count: counts.active },
      { key: "completed", label: "Selesai", icon: <CheckCircle size={16} />, count: counts.completed },
      { key: "cancelled", label: "Dibatalkan", icon: <XCircle size={16} />, count: counts.cancelled },
    ];
    const idx = items.findIndex(i => i.key === active);
    return (
      <div
        className="relative z-40 pointer-events-auto bg-white/90 backdrop-blur border border-gray-200 rounded-xl p-0.5 shadow-sm"
        role="tablist" aria-label="Reservation filters"
      >
        <div className="grid grid-cols-3 relative">
          <div
            className="absolute top-0.5 bottom-0.5 w-1/3 rounded-lg bg-blue-600/10 transition-transform duration-300"
            style={{ transform: `translateX(${idx * 100}%)` }}
            aria-hidden="true"
          />
          {items.map((t) => {
            const selected = active === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${t.key}`}
                onClick={() => { setSelectedReservation(null); onChange(t.key); }}
                className={`relative z-10 flex items-center justify-center gap-2 py-2 px-3 m-0.5 rounded-lg text-sm font-semibold transition-all
                  ${selected ? "text-blue-700" : "text-gray-700 hover:text-gray-900"}`}
              >
                {t.icon}
                {t.label}
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold
                  ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const ReservationCard = ({ reservation }) => {
    const Icon = zoneIcons[reservation.zone] || Car;
    const zoneColor = zoneColors[reservation.zone] || "from-gray-400 to-gray-600";
    const statusChip =
      reservation.status === "active" ? "text-blue-700 bg-blue-50 ring-1 ring-blue-200" :
      reservation.status === "completed" ? "text-green-700 bg-green-50 ring-1 ring-green-200" :
      reservation.status === "cancelled" ? "text-red-700 bg-red-50 ring-1 ring-red-200" :
      "text-gray-700 bg-gray-50 ring-1 ring-gray-200";

    return (
      <div className="w-full rounded-2xl bg-white shadow-sm hover:shadow-md transition-all border border-gray-100 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" aria-hidden />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${zoneColor} flex items-center justify-center mr-4 shadow`}>
                <Icon className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{reservation.locationName}</h3>
                <p className="text-sm text-gray-600">Slot {reservation.slotId} • {reservation.zoneName}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusChip}`}>
              {reservation.status === "active" ? "Sedang Berlangsung" :
               reservation.status === "completed" ? "Selesai" :
               reservation.status === "cancelled" ? "Dibatalkan" : "Pending"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px] text-gray-800">
            <div className="flex items-start">
              <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
              <span className="line-clamp-2">{reservation.locationAddress}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 flex-shrink-0 text-gray-500" />
              <span>{formatDateTime(reservation.startDateTime)} — {formatDateTime(reservation.endDateTime)}</span>
            </div>
            <div className="flex items-center">
              <CreditCard size={16} className="mr-2 flex-shrink-0 text-gray-500" />
              <span>Rp {reservation.totalAmount.toLocaleString()} · {reservation.duration} jam</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              {reservation.status === "active" ? <RefreshCw className="text-blue-500 mr-2" size={18} /> :
               reservation.status === "completed" ? <CheckCircle className="text-green-500 mr-2" size={18} /> :
               reservation.status === "cancelled" ? <XCircle className="text-red-500 mr-2" size={18} /> :
               <Clock className="text-gray-500 mr-2" size={18} />}
              <span>ID: {reservation.id}</span>
            </div>
            {reservation.status === "active" && (
              <button
                type="button"
                onClick={() => setSelectedReservation(reservation)}
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Lihat Detail
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Memuat riwayat reservasi...</p>
        </div>
      </div>
    );
  }

  const padTop = `calc(${HEADER_H}px + env(safe-area-inset-top))`;
  const padBottom = `calc(${FOOTER_H}px + env(safe-area-inset-bottom))`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4" style={{ paddingTop: padTop, paddingBottom: padBottom }}>
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Reservasi</h1>
          <p className="text-sm text-gray-600">Pantau status reservasi parkir Anda</p>
        </div>

        <div className="mb-3">
          <Tabs active={activeTab} onChange={setActiveTab} counts={counts} />
        </div>

        <div id={`panel-${activeTab}`} role="tabpanel">
          {filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 bg-white/70 backdrop-blur rounded-2xl border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-blue-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Tidak ada reservasi {activeTab === "active" ? "yang sedang berlangsung" : activeTab === "completed" ? "yang selesai" : "yang dibatalkan"}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === "active"
                  ? "Anda belum memiliki reservasi aktif."
                  : activeTab === "completed"
                  ? "Belum ada riwayat selesai."
                  : "Belum ada yang dibatalkan."}
              </p>
              <button
                type="button"
                onClick={() => onNavigateToHome && onNavigateToHome()}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow"
              >
                Mulai Reservasi
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};

export default ReservationHistoryScreen;
