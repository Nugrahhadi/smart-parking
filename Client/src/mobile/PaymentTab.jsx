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
    <div className="flex flex-col h-full p-4">
      <h1 className="text-xl font-bold mb-4">Payment History</h1>

      {/* Transaction History Section */}
      <div className="space-y-3">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading payment history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle
              size={20}
              className="text-red-600 mr-2 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={fetchPaymentHistory}
                className="mt-2 text-red-600 text-sm underline hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
          <div className="text-center py-12">
            <Wallet size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No Payment History</p>
            <p className="text-gray-500 text-sm mt-1">
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
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                      {transaction.location}
                    </h3>
                    {transaction.address && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        {transaction.address}
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-gray-600 text-sm">
                      <Calendar size={14} className="mr-1" />
                      <span>{transaction.date}</span>
                    </div>
                    <div className="flex items-center mt-1 text-gray-600 text-sm">
                      <Clock size={14} className="mr-1" />
                      <span>{transaction.time}</span>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Vehicle:</span>
                          <p className="text-gray-700 font-medium">
                            {transaction.vehicle || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Payment:</span>
                          <p className="text-gray-700 font-medium capitalize">
                            {transaction.method?.replace("_", " ") || "N/A"}
                          </p>
                        </div>
                        {transaction.transaction_id && (
                          <div className="col-span-2">
                            <span className="text-gray-500">
                              Transaction ID:
                            </span>
                            <p className="text-gray-700 font-mono text-xs">
                              {transaction.transaction_id}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-800 text-lg">
                      Rp {transaction.amount}
                    </p>
                    <div className="flex items-center justify-end mt-1">
                      <CheckCircle size={14} className="text-green-600 mr-1" />
                      <span className="text-green-600 text-sm capitalize">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-50">
                    Receipt
                  </button>
                  <button
                    onClick={() => handleShowDetail(transaction)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}

            {/* Refresh Button */}
            <button
              onClick={fetchPaymentHistory}
              className="w-full bg-white border border-gray-300 text-blue-600 rounded-lg py-3 font-medium hover:bg-gray-50"
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
