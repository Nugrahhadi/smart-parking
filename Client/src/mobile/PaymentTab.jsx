// src/screens/PaymentsTab.jsx
import React, { useState, useEffect, useCallback } from "react";
import { CreditCard, Wallet, Calendar, Clock, AlertCircle, ArrowRight } from "lucide-react";
import api from "../services/api";
import PaymentDetailModal from "./PaymentDetailModal";

const FOOTER_H = 88;

const badgeClassByStatus = (s) => {
  const v = String(s || "").toLowerCase();
  if (["paid", "success", "succeeded", "completed"].includes(v))
    return "bg-green-50 text-green-700 ring-1 ring-green-200";
  if (["pending", "processing"].includes(v))
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  if (["failed", "canceled", "cancelled", "error"].includes(v))
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
};

const normalizeMethod = (m) =>
  String(m || "N/A").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return "N/A";
  const start = new Date(startTime);
  const end = new Date(endTime);
  const fmt = (d) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fmt(start)} - ${fmt(end)}`;
};

const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return num.toLocaleString("id-ID", { minimumFractionDigits: 0 });
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm animate-pulse">
    <div className="flex justify-between">
      <div className="h-4 w-40 bg-gray-200 rounded" />
      <div className="h-5 w-24 bg-gray-200 rounded" />
    </div>
    <div className="h-3 w-64 bg-gray-200 rounded mt-3" />
    <div className="grid grid-cols-2 gap-3 mt-5">
      <div className="h-10 bg-gray-100 rounded" />
      <div className="h-10 bg-gray-100 rounded" />
    </div>
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="h-10 bg-gray-100 rounded" />
      <div className="h-10 bg-gray-100 rounded" />
    </div>
    <div className="h-10 bg-gray-100 rounded mt-3" />
    <div className="h-10 bg-gray-200 rounded mt-4" />
  </div>
);

const PaymentsTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleShowDetail = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/payments/history");
      if (response.data && response.data.payments) {
        const formatted = response.data.payments.map((p) => ({
          id: p.id,
          reservation_id: p.reservation_id,
          location: p.location_name || "Unknown Location",
          address: p.location_address || "",
          date: formatDate(p.payment_date),
          time: formatTimeRange(p.start_time, p.end_time),
          amount: formatCurrency(p.amount),
          rawAmount: Number(p.amount || 0),
          status: p.payment_status || "unknown",
          method: p.payment_method || "N/A",
          transaction_id: p.transaction_id || "",
          vehicle: p.icense_plate || p.license_plate || "", // guard small typo cases
          vehicleType: p.vehicle_type || "",
          spotNumber: p.spot_number || "",
          zoneType: p.zone_type || "",
          rawDate: p.payment_date || "",
        }));
        setTransactions(formatted);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError("Failed to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const padBottom = `calc(${FOOTER_H}px + env(safe-area-inset-bottom))`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment History</h1>
            <p className="text-blue-100 text-sm">Track your parking payments</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <CreditCard size={24} className="opacity-90" />
          </div>
        </div>
      </div>

      {/* Content — lebar disamakan dengan ReservationHistory: max-w-7xl mx-auto px-4 */}
      <div className="flex-1 overflow-y-auto w-full" style={{ paddingBottom: padBottom }}>
        <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 shadow-sm">
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-red-900 font-semibold">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <button
                    onClick={fetchPaymentHistory}
                    className="mt-3 inline-flex items-center gap-2 text-red-700 text-sm font-medium hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white/60 backdrop-blur">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Wallet size={30} className="text-blue-400" />
              </div>
              <p className="text-gray-800 font-semibold text-lg">No Payment History</p>
              <p className="text-gray-500 text-sm mt-1">Your payment transactions will appear here.</p>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <>
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="w-full rounded-2xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base">{t.location}</h3>
                      {t.address && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{t.address}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold text-blue-700">Rp {t.amount}</div>
                      <span
                        className={`inline-block mt-1 px-2.5 py-1 text-[11px] font-semibold rounded-full ${badgeClassByStatus(
                          t.status
                        )}`}
                      >
                        {String(t.status).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 mt-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-blue-600" />
                      <span>{t.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-blue-600" />
                      <span>{t.time}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-500 text-[11px] font-medium mb-1">Vehicle</p>
                      <p className="text-gray-900 font-semibold text-sm">{t.vehicle || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-500 text-[11px] font-medium mb-1">Payment Method</p>
                      <p className="text-gray-900 font-semibold text-sm">{normalizeMethod(t.method)}</p>
                    </div>
                    {t.spotNumber && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-[11px] font-medium mb-1">Spot</p>
                        <p className="text-gray-900 font-semibold text-sm">{t.spotNumber}</p>
                      </div>
                    )}
                    {t.zoneType && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-[11px] font-medium mb-1">Zone</p>
                        <p className="text-gray-900 font-semibold text-sm capitalize">{t.zoneType}</p>
                      </div>
                    )}
                    {t.transaction_id && (
                      <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 text-[11px] font-medium mb-1">Transaction ID</p>
                        <p className="text-gray-800 font-mono text-xs break-all">{t.transaction_id}</p>
                      </div>
                    )}
                  </div>

                  {/* Tombol Details — full width mengikuti lebar card */}
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => handleShowDetail(t)}
                      className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow
                                 focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-[0.99] transition
                                 inline-flex items-center justify-center gap-2"
                    >
                      Details <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={fetchPaymentHistory}
                className="w-full mt-1 bg-white border border-gray-300 text-blue-600 rounded-xl py-3 font-semibold hover:bg-blue-50 transition-colors shadow-sm"
              >
                Refresh History
              </button>
            </>
          )}
        </div>
      </div>

      {showDetailModal && (
        <PaymentDetailModal payment={selectedPayment} onClose={handleCloseDetail} />
      )}
    </div>
  );
};

export default PaymentsTab;
