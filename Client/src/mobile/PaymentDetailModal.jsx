import React from "react";
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Car,
  DollarSign,
  CheckCircle,
  CreditCard,
  Receipt,
  Info,
  Download,
} from "lucide-react";

const PaymentDetailModal = ({ payment, onClose }) => {
  if (!payment) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get payment method icon and name
  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      ewallet: { icon: "💳", name: "E-Wallet" },
      card: { icon: "💳", name: "Credit Card" },
      bank_transfer: { icon: "🏦", name: "Bank Transfer" },
      cash: { icon: "💵", name: "Cash" },
    };
    return methodMap[method] || { icon: "💰", name: method };
  };

  const paymentMethod = getPaymentMethodDisplay(
    payment.method || payment.payment_method
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Receipt size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Payment Receipt</h2>
              <p className="text-green-100 text-sm">Transaction Successful</p>
            </div>
          </div>

          <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full">
            <CheckCircle size={16} className="text-white mr-2" />
            <span className="text-white font-semibold text-sm">Paid</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction ID */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-700">
                <Info size={18} className="mr-2 text-green-600" />
                <span className="font-medium">Transaction ID</span>
              </div>
              <span className="font-mono font-bold text-gray-900 text-sm">
                {payment.transaction_id}
              </span>
            </div>
          </div>

          {/* Amount Paid */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-green-100 text-sm mb-1">Amount Paid</p>
            <p className="text-4xl font-bold mb-1">
              {formatCurrency(payment.rawAmount || payment.amount)}
            </p>
            <p className="text-green-100 text-xs">Payment ID: #{payment.id}</p>
          </div>

          {/* Payment Details */}
          <div>
            <div className="flex items-center text-gray-700 mb-3">
              <CreditCard size={20} className="mr-2 text-blue-600" />
              <h3 className="font-bold text-lg">Payment Information</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Payment Method</span>
                <div className="flex items-center">
                  <span className="mr-2">{paymentMethod.icon}</span>
                  <span className="font-semibold text-gray-900">
                    {paymentMethod.name}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Payment Date</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(payment.payment_date || payment.date)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Time</span>
                <span className="font-semibold text-gray-900">
                  {formatTime(payment.payment_date || payment.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Parking Details */}
          <div>
            <div className="flex items-center text-gray-700 mb-3">
              <MapPin size={20} className="mr-2 text-purple-600" />
              <h3 className="font-bold text-lg">Parking Details</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <div>
                <p className="text-gray-600 text-sm mb-1">Location</p>
                <p className="font-semibold text-gray-900">
                  {payment.location}
                </p>
                {payment.address && (
                  <p className="text-gray-600 text-xs mt-1">
                    {payment.address}
                  </p>
                )}
              </div>

              {(payment.spotNumber || payment.zoneType) && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                  {payment.spotNumber && (
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Spot Number</p>
                      <p className="font-bold text-purple-900">
                        {payment.spotNumber}
                      </p>
                    </div>
                  )}
                  {payment.zoneType && (
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Zone</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {payment.zoneType}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Parking Schedule */}
          {payment.time && (
            <div>
              <div className="flex items-center text-gray-700 mb-3">
                <Clock size={20} className="mr-2 text-blue-600" />
                <h3 className="font-bold text-lg">Parking Duration</h3>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-center">
                  <Calendar size={18} className="mr-2 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {payment.time}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Info */}
          {payment.vehicle && (
            <div>
              <div className="flex items-center text-gray-700 mb-3">
                <Car size={20} className="mr-2 text-green-600" />
                <h3 className="font-bold text-lg">Vehicle</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">License Plate</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {payment.vehicle}
                    </p>
                  </div>
                  {payment.vehicleType && (
                    <div className="text-right">
                      <p className="text-gray-600 text-sm mb-1">Type</p>
                      <p className="font-semibold text-gray-900">
                        {payment.vehicleType}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reservation Link */}
          {payment.reservation_id && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-700">
                  <Receipt size={18} className="mr-2" />
                  <span className="font-medium">Reservation ID</span>
                </div>
                <span className="font-bold text-blue-900">
                  #{payment.reservation_id}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200 space-y-3">
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center">
            <Download size={20} className="mr-2" />
            Download Receipt
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;
