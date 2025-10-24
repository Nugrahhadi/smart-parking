import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Car,
  AlertCircle,
  Phone,
  Navigation,
  Share2,
  Grid3X3,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Component untuk slot parkir individual
const ParkingSlot = ({ slot, onSelect, isSelected }) => {
  const getSlotColor = () => {
    if (slot.status === "available") return "bg-green-500 hover:bg-green-600";
    if (slot.status === "occupied") return "bg-red-500";
    if (slot.status === "reserved") return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getTextColor = () => {
    return "text-white";
  };

  return (
    <button
      onClick={() => slot.status === "available" && onSelect && onSelect(slot)}
      disabled={slot.status !== "available"}
      className={`
        w-12 h-8 rounded border-2 text-xs font-bold transition-all duration-200
        ${getSlotColor()} ${getTextColor()}
        ${isSelected ? "ring-2 ring-blue-300 scale-110" : ""}
        ${slot.status === "available" ? "cursor-pointer" : "cursor-not-allowed"}
        flex items-center justify-center
      `}
    >
      {slot.spotNumber}
    </button>
  );
};

// Component untuk layout denah parkir
const ParkingLayout = ({ spots, onSlotSelect, selectedSlot }) => {
  // Organize spots into rows (simulate parking layout)
  const organizeSpots = (spots) => {
    const rows = [];
    const spotsPerRow = 8; // 8 spots per row

    for (let i = 0; i < spots.length; i += spotsPerRow) {
      rows.push(spots.slice(i, i + spotsPerRow));
    }
    return rows;
  };

  const rows = organizeSpots(spots);

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 mb-2">Parking Layout</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Reserved</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((spot) => (
              <ParkingSlot
                key={spot.id}
                slot={spot}
                onSelect={onSlotSelect}
                isSelected={selectedSlot?.id === spot.id}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Road indicator */}
      <div className="mt-4 text-center">
        <div className="h-8 bg-gray-400 rounded flex items-center justify-center text-white font-bold">
          MAIN ROAD
        </div>
      </div>
    </div>
  );
};

const ParkingDetailScreen = () => {
  const [selectedTab, setSelectedTab] = useState("slots");
  const [showAllSlots, setShowAllSlots] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [parkingDetails, setParkingDetails] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch parking details
  useEffect(() => {
    const fetchParkingDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/parking/locations/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setParkingDetails(data.location);
          setSpots(data.spots);
        } else {
          console.error("Failed to fetch parking details");
        }
      } catch (error) {
        console.error("Error fetching parking details:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchParkingDetails();
  }, [id]);

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/parking/locations/${id}`
      );
      if (response.ok) {
        const data = await response.json();
        setParkingDetails(data.location);
        setSpots(data.spots);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    handleRefreshData();
  };

  const handleReserve = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    navigate(`/mobile/reserve/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parking details...</p>
        </div>
      </div>
    );
  }

  if (!parkingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Parking location not found</p>
          <button
            onClick={() => navigate("/mobile")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const availableSpots = spots.filter((spot) => spot.status === "available");
  const occupiedSpots = spots.filter((spot) => spot.status === "occupied");
  const reservedSpots = spots.filter((spot) => spot.status === "reserved");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold">Parking Details</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <RefreshCw
                size={20}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Parking Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={`/src/images/${parkingDetails.imageUrl || "CentralMall.png"}`}
          alt={parkingDetails.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23e5e7eb"/><text x="200" y="100" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dy="4">Parking Image</text></svg>';
          }}
        />

        {/* Overlay Info */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <Car className="text-blue-600" size={16} />
            <span className="text-sm font-medium">
              {parkingDetails.availableSpots}/{parkingDetails.totalSpots}{" "}
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {parkingDetails.name}
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              Rp {Number(parkingDetails.pricePerHour).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">per hour</div>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{parkingDetails.address}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Star size={14} className="text-yellow-500 mr-1" />
            <span>4.5</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>06:00 - 22:00</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm">
        <div className="flex">
          <button
            onClick={() => setSelectedTab("slots")}
            className={`flex-1 py-3 text-center font-medium ${
              selectedTab === "slots"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Available Slots
          </button>
          <button
            onClick={() => setSelectedTab("info")}
            className={`flex-1 py-3 text-center font-medium ${
              selectedTab === "info"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Information
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {selectedTab === "slots" && (
          <div>
            {/* Real-time Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <h3 className="font-semibold mb-3">Real-time Status</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {availableSpots.length}
                  </div>
                  <div className="text-sm text-green-700">Available</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {occupiedSpots.length}
                  </div>
                  <div className="text-sm text-red-700">Occupied</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reservedSpots.length}
                  </div>
                  <div className="text-sm text-yellow-700">Reserved</div>
                </div>
              </div>
            </div>

            {/* Parking Layout */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Parking Layout</h3>
                <button
                  onClick={() => setShowAllSlots(!showAllSlots)}
                  className="flex items-center text-blue-600 text-sm"
                >
                  <Eye size={16} className="mr-1" />
                  {showAllSlots ? "Show Less" : "View All"}
                </button>
              </div>

              {showAllSlots ? (
                <ParkingLayout
                  spots={spots}
                  selectedSlot={null}
                  onSlotSelect={null}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Grid3X3 size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="mb-2">Click "View All" to see parking layout</p>
                  <p className="text-sm">
                    Real-time slot availability with visual layout
                  </p>
                </div>
              )}
            </div>

            {/* Available Slots List */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">
                Available Slots ({availableSpots.length})
              </h3>
              {availableSpots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableSpots.slice(0, 12).map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-green-100 text-green-800 px-3 py-2 rounded text-center text-sm font-medium"
                    >
                      {slot.spotNumber}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  <p>No available slots at the moment</p>
                </div>
              )}

              {availableSpots.length > 12 && (
                <button
                  onClick={() => setShowAllSlots(true)}
                  className="w-full mt-3 text-blue-600 text-sm font-medium"
                >
                  Show all {availableSpots.length} available slots
                </button>
              )}
            </div>
          </div>
        )}

        {selectedTab === "info" && (
          <div className="space-y-4">
            {/* Features */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "CCTV Security",
                  "Covered Parking",
                  "EV Charging",
                  "Disabled Access",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Contact</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>(021) 555-1234</span>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  Call
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Navigation</h3>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg flex items-center justify-center">
                <Navigation size={16} className="mr-2" />
                Get Directions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reserve Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleReserve}
          disabled={availableSpots.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-400 flex items-center justify-center"
        >
          <Car size={16} className="mr-2" />
          {availableSpots.length > 0 ? "Reserve Parking" : "No Slots Available"}
        </button>
      </div>

      {/* Add bottom padding to prevent overlap with fixed button */}
      <div className="h-20"></div>
    </div>
  );
};

export default ParkingDetailScreen;
