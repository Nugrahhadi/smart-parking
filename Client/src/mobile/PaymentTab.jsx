import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  Wallet,
  ChevronRight,
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";
import PaymentDetailModal from "./PaymentDetailModal";

const PaymentsTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Handle show detail
  const handleShowDetail = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  // Fetch payment history from API
  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/payments/history");

      if (response.data && response.data.payments) {
        // Transform API data to component format
        const formattedTransactions = response.data.payments.map((payment) => ({
          id: payment.id,
          reservation_id: payment.reservation_id,
          location: payment.location_name || "Unknown Location",
          address: payment.location_address,
          date: formatDate(payment.payment_date),
          time: formatTimeRange(payment.start_time, payment.end_time),
          amount: formatCurrency(payment.amount),
          rawAmount: payment.amount,
          status: payment.payment_status,
          method: payment.payment_method,
          transaction_id: payment.transaction_id,
          vehicle: payment.license_plate,
          vehicleType: payment.vehicle_type,
          spotNumber: payment.spot_number,
          zoneType: payment.zone_type,
        }));

        setTransactions(formattedTransactions);
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

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time range
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    const start = new Date(startTime);
    const end = new Date(endTime);

    const formatTime = (date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0";
    // Remove decimal if it's .00
    const numAmount = parseFloat(amount);
    return numAmount.toLocaleString("id-ID", { minimumFractionDigits: 0 });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Payment History</h1>
          <CreditCard size={28} className="opacity-80" />
        </div>
        <p className="text-blue-100 text-sm">Track all your parking payments</p>
      </div>

      {/* Transaction History Section */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading payment history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-900 font-semibold">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={fetchPaymentHistory}
                  className="mt-3 inline-block text-red-600 text-sm font-medium hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wallet size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No Payment History</p>
            <p className="text-gray-500 text-sm mt-2">
              Your payment transactions will appear here
            </p>
          </div>
        )}

        {/* Transaction List */}
        {!loading && !error && transactions.length > 0 && (
          <>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base">
                      {transaction.location}
                    </h3>
                    {transaction.address && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                        {transaction.address}
                      </p>
                    )}
                  </div>
                  <div className="ml-3 text-right">
                    <p className="font-bold text-blue-600 text-lg">
                      Rp {transaction.amount}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {transaction.status}
                    </span>
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="flex gap-4 text-gray-600 text-sm mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-blue-600" />
                    <span>{transaction.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-blue-600" />
                    <span>{transaction.time}</span>
                  </div>
                </div>

                {/* Additional Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs font-medium mb-1">Vehicle</p>
                    <p className="text-gray-900 font-semibold text-sm">
                      {transaction.vehicle || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs font-medium mb-1">Payment Method</p>
                    <p className="text-gray-900 font-semibold text-sm capitalize">
                      {transaction.method?.replace("_", " ") || "N/A"}
                    </p>
                  </div>
                  {transaction.spotNumber && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs font-medium mb-1">Spot</p>
                      <p className="text-gray-900 font-semibold text-sm">
                        {transaction.spotNumber}
                      </p>
                    </div>
                  )}
                  {transaction.zoneType && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs font-medium mb-1">Zone</p>
                      <p className="text-gray-900 font-semibold text-sm capitalize">
                        {transaction.zoneType}
                      </p>
                    </div>
                  )}
                  {transaction.transaction_id && (
                    <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs font-medium mb-1">Transaction ID</p>
                      <p className="text-gray-800 font-mono text-xs">
                        {transaction.transaction_id}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                    Receipt
                  </button>
                  <button
                    onClick={() => handleShowDetail(transaction)}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    Details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Refresh Button */}
            <button
              onClick={fetchPaymentHistory}
              className="w-full bg-white border border-gray-300 text-blue-600 rounded-lg py-3 font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-sm"
            >
              Refresh History
            </button>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default PaymentsTab;
