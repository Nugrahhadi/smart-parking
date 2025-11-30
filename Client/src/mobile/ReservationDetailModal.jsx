import React from "react";
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Car,
  DollarSign,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Navigation,
  Info,
} from "lucide-react";

const ReservationDetailModal = ({ reservation, onClose }) => {
  if (!reservation) return null;

  console.log("Reservation Data:", reservation);

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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const statusMap = {
      active: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle size={16} className="mr-1" />,
        text: "Active",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock size={16} className="mr-1" />,
        text: "Pending Payment",
      },
      completed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle size={16} className="mr-1" />,
        text: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle size={16} className="mr-1" />,
        text: "Cancelled",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusDisplay = getStatusDisplay(reservation.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-white mb-2">
            Reservation Details
          </h2>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusDisplay.color}`}
          >
            {statusDisplay.icon}
            {statusDisplay.text}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Reservation ID */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Info size={18} className="mr-2" />
                <span className="font-medium">Reservation ID</span>
              </div>
              <span className="font-bold text-gray-900">#{reservation.id}</span>
            </div>
          </div>

          {/* Location Info */}
          <div>
            <div className="flex items-center text-gray-700 mb-3">
              <MapPin size={20} className="mr-2 text-blue-600" />
              <h3 className="font-bold text-lg">Location</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-1">
                {reservation.locationName}
              </p>
              <p className="text-gray-600 text-sm">
                {reservation.locationAddress}
              </p>
            </div>
          </div>

          {/* Parking Spot */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <Navigation size={18} className="mr-2 text-purple-600" />
                <span className="font-medium text-sm">Spot Number</span>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="font-bold text-purple-900">
                  {reservation.slotId}
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <MapPin size={18} className="mr-2 text-purple-600" />
                <span className="font-medium text-sm">Zone</span>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="font-bold text-purple-900 text-sm">
                  {reservation.zoneName}
                </p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <div className="flex items-center text-gray-700 mb-3">
              <Calendar size={20} className="mr-2 text-green-600" />
              <h3 className="font-bold text-lg">Schedule</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <div>
                <p className="text-gray-600 text-sm mb-1">Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(reservation.reservationDate)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Start Time</p>
                  <p className="font-semibold text-gray-900">
                    {reservation.startTime || (reservation.startDateTime?.toLocaleTimeString?.('id-ID', { hour: '2-digit', minute: '2-digit' }) || 'N/A')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">End Time</p>
                  <p className="font-semibold text-gray-900">
                    {reservation.endTime || (reservation.endDateTime?.toLocaleTimeString?.('id-ID', { hour: '2-digit', minute: '2-digit' }) || 'N/A')}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600 pt-2 border-t border-gray-300">
                Duration:{" "}
                <span className="font-semibold text-gray-900">
                  {reservation.duration} jam
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          {(reservation.vehiclePlate || reservation.vehicleType) && (
            <div>
              <div className="flex items-center text-gray-700 mb-3">
                <Car size={20} className="mr-2 text-blue-600" />
                <h3 className="font-bold text-lg">Vehicle</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">License Plate</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {reservation.vehiclePlate}
                    </p>
                  </div>
                  {reservation.vehicleType && (
                    <div className="text-right">
                      <p className="text-gray-600 text-sm mb-1">Type</p>
                      <p className="font-semibold text-gray-900">
                        {reservation.vehicleType}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div>
            <div className="flex items-center text-gray-700 mb-3">
              <DollarSign size={20} className="mr-2 text-green-600" />
              <h3 className="font-bold text-lg">Payment</h3>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(reservation.totalAmount)}
                </span>
              </div>
              {reservation.paymentStatus && (
                <div className="flex items-center justify-between pt-2 border-t border-green-200">
                  <div className="flex items-center">
                    <CreditCard size={16} className="mr-2 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Payment Status
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold capitalize ${
                      reservation.paymentStatus === "completed"
                        ? "text-green-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {reservation.paymentStatus}
                  </span>
                </div>
              )}
              {reservation.paymentMethod && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {reservation.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;
