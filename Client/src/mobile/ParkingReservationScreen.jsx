import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Car,
  MapPin,
  Clock,
  CreditCard,
  Star,
  Crown,
  Coffee,
  ShoppingBag,
  Music,
  Zap,
  Shield,
  Calendar,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const ParkingReservationScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Date and time state
  const [reservationDate, setReservationDate] = useState(
    new Date().toISOString().split("T")[0] // Default to today
  );
  const [arrivalTime, setArrivalTime] = useState(
    new Date().toTimeString().split(" ")[0].slice(0, 5) // Default to current time (HH:MM)
  );

  const [loading, setLoading] = useState(true);
  const [reservationStep, setReservationStep] = useState(1);
  const [locationData, setLocationData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // ✅ ONLY 3 ZONES - Match database zone_type exactly
  const mallZones = useMemo(
    () => ({
      vip: {
        name: "VIP Royal Zone",
        icon: Crown,
        color: "from-yellow-400 to-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-300",
        textColor: "text-yellow-800",
        price: 25000,
        features: [
          "Covered Parking",
          "Valet Service",
          "Car Wash",
          "Priority Access",
        ],
      },
      entertainment: {
        name: "Entertainment District",
        icon: Music,
        color: "from-purple-400 to-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-300",
        textColor: "text-purple-800",
        price: 15000,
        features: ["Near Cinema", "Game Center", "Music Store", "Food Court"],
      },
      regular: {
        name: "Regular Parking",
        icon: Car,
        color: "from-blue-400 to-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-300",
        textColor: "text-blue-800",
        price: 8000,
        features: ["Standard Parking", "Security", "Easy Access", "Affordable"],
      },
    }),
    []
  );

  // Generate parking slots berdasarkan zona
  const generateSlots = () => {
    const slots = [];
    const zones = Object.keys(mallZones);
    let spotIdCounter = 1; // ✅ Numeric ID for database

    zones.forEach((zone, zoneIndex) => {
      const slotsPerZone = zone === "vip" ? 15 : zone === "electric" ? 10 : 25;

      for (let i = 1; i <= slotsPerZone; i++) {
        const slotNumber =
          String.fromCharCode(65 + zoneIndex) +
          "-" +
          String(i).padStart(2, "0");
        const isOccupied = Math.random() < 0.3; // 30% chance occupied

        slots.push({
          id: spotIdCounter++, // ✅ Use numeric ID (1, 2, 3, ...) for database
          zone: zone,
          status: isOccupied ? "TERISI" : "KOSONG",
          number: slotNumber, // ✅ Keep display number as string ("A-01", "B-05")
          displayId: slotNumber, // ✅ For UI display
        });
      }
    });

    return slots;
  };

  const [parkingSlots] = useState(generateSlots());

  // Group slots by zone
  const groupedSlots = parkingSlots.reduce((acc, slot) => {
    if (!acc[slot.zone]) {
      acc[slot.zone] = [];
    }
    acc[slot.zone].push(slot);
    return acc;
  }, {});

  // Fetch user's vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("No token found - user not logged in");
          return;
        }

        const response = await fetch("http://localhost:5000/api/vehicles", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Vehicles loaded:", data);
          setVehicles(data);

          // Auto-select default vehicle or first vehicle
          const defaultVehicle = data.find((v) => v.is_default) || data[0];
          if (defaultVehicle) {
            setSelectedVehicle(defaultVehicle);
            console.log("🚗 Auto-selected vehicle:", defaultVehicle);
          }
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);

        // Fetch location data from API
        const response = await fetch(
          `http://localhost:5000/api/parking/locations/${id}`
        );
        if (response.ok) {
          const result = await response.json();
          setLocationData({
            id: result.location.id,
            name: result.location.name,
            address: result.location.address,
            rating: 4.5, // Default rating since not in API
            totalSlots: result.location.totalSpots,
            availableSlots: result.location.availableSpots,
          });
        } else {
          // Fallback to mock data if API fails
          const locationMap = {
            "central-mall": {
              id: "central-mall",
              name: "Central Mall Parking",
              address: "Jl. Sudirman No. 123, Jakarta",
              rating: 4.5,
              totalSlots: 150,
              availableSlots: 85,
            },
            "city-plaza": {
              id: "city-plaza",
              name: "City Plaza Parking",
              address: "Jl. Thamrin No. 456, Jakarta",
              rating: 4.3,
              totalSlots: 200,
              availableSlots: 120,
            },
            "station-parking": {
              id: "station-parking",
              name: "Station Parking Hub",
              address: "Jl. Gatot Subroto No. 789, Jakarta",
              rating: 4.7,
              totalSlots: 300,
              availableSlots: 180,
            },
          };
          const data = locationMap[id] || locationMap["central-mall"];
          setLocationData(data);
        }

        setSelectedZone(Object.keys(mallZones)[0]); // Set default zone
      } catch (error) {
        console.error("Error fetching location data:", error);
        // Fallback to mock data on error
        const locationMap = {
          "central-mall": {
            id: "central-mall",
            name: "Central Mall Parking",
            address: "Jl. Sudirman No. 123, Jakarta",
            rating: 4.5,
            totalSlots: 150,
            availableSlots: 85,
          },
        };
        const data = locationMap[id] || locationMap["central-mall"];
        setLocationData(data);
        setSelectedZone(Object.keys(mallZones)[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [id, mallZones]);

  const ParkingSlot = ({ slot, onSelect, isSelected }) => {
    const getSlotColor = () => {
      if (isSelected) return "bg-blue-500 text-white border-blue-600";
      if (slot.status === "KOSONG")
        return "bg-green-500 text-white border-green-600 hover:bg-green-600";
      return "bg-red-500 text-white border-red-600 cursor-not-allowed";
    };

    const getSlotIcon = () => {
      if (slot.status === "TERISI") return "🚗";
      if (isSelected) return "✓";
      return "";
    };

    return (
      <button
        onClick={() => slot.status === "KOSONG" && onSelect(slot)}
        disabled={slot.status === "TERISI"}
        className={`
          w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 font-bold text-xs
          flex flex-col items-center justify-center transition-all duration-300
          shadow-md hover:shadow-lg transform hover:scale-105
          ${getSlotColor()}
        `}
      >
        <div className="text-lg mb-1">{getSlotIcon()}</div>
        <div className="text-xs font-medium">
          {slot.number || slot.displayId}
        </div>
      </button>
    );
  };

  const ZoneLegend = () => {
    return (
      <div className="bg-white rounded-xl p-4 mb-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Pilih Tipe Parkir
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(mallZones).map(([key, zone]) => {
            const Icon = zone.icon;
            const isSelected = selectedZone === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedZone(key)}
                className={`
                  ${zone.bgColor} ${zone.borderColor} ${zone.textColor}
                  border-2 rounded-xl p-4 text-left transition-all duration-300
                  hover:shadow-md transform hover:scale-105
                  ${
                    isSelected ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${zone.color} flex items-center justify-center mr-3 shadow-md`}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{zone.name}</div>
                      <div className="text-xs opacity-75">
                        Rp {zone.price.toLocaleString()}/jam
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="text-xs opacity-80">
                  {zone.features.slice(0, 2).join(" • ")}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const SelectableParkingLayout = () => {
    if (!selectedZone) return null;

    const selectedZoneSlots = groupedSlots[selectedZone] || [];
    const zone = mallZones[selectedZone];
    const Icon = zone.icon;

    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {locationData?.name || "Parking Location"} - {zone.name}
          </h3>
          <p className="text-gray-600">
            Pilih slot parkir yang tersedia (berwarna hijau)
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>Kosong</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Terisi</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Dipilih</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div
            className={`flex items-center px-4 py-2 rounded-lg ${zone.bgColor} ${zone.borderColor} border`}
          >
            <Icon className={`mr-2 ${zone.textColor}`} size={20} />
            <span className={`font-medium ${zone.textColor}`}>{zone.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 justify-items-center">
          {selectedZoneSlots.map((slot) => (
            <ParkingSlot
              key={slot.id}
              slot={slot}
              onSelect={setSelectedSlot}
              isSelected={selectedSlot?.id === slot.id}
            />
          ))}
        </div>
      </div>
    );
  };

  const ReservationSummary = () => {
    if (!selectedSlot) return null;

    const zone = mallZones[selectedSlot.zone];
    const totalPrice = zone.price * duration;
    const Icon = zone.icon;

    // Calculate end time based on arrival time + duration
    const calculateEndTime = () => {
      if (!arrivalTime) return "N/A";
      const [hours, minutes] = arrivalTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
      return endDate.toTimeString().split(" ")[0].slice(0, 5); // HH:MM format
    };

    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center sticky top-0 bg-white pb-2">
          <Shield className="mr-2 text-green-600" size={20} />
          Ringkasan Reservasi
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center min-w-0">
              <Icon
                className="text-blue-600 mr-2 sm:mr-3 flex-shrink-0"
                size={20}
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                  {zone.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Slot {selectedSlot.number || selectedSlot.displayId}
                </p>
              </div>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <p className="font-semibold text-gray-800 text-sm sm:text-base">
                Rp {zone.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">per jam</p>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700 text-sm sm:text-base flex items-center">
              <Calendar className="mr-2 text-blue-600" size={18} />
              Tanggal Kedatangan:
            </label>
            <input
              type="date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Can't select past dates
              className="w-full p-2.5 sm:p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700 text-sm sm:text-base flex items-center">
              <Clock className="mr-2 text-blue-600" size={18} />
              Jam Kedatangan:
            </label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full p-2.5 sm:p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 text-sm sm:text-base">
              Durasi:
            </span>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => duration > 1 && setDuration(duration - 1)}
                disabled={duration <= 1}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
              >
                -
              </button>
              <span className="font-bold text-base sm:text-lg px-2 sm:px-3 min-w-[60px] text-center">
                {duration} jam
              </span>
              <button
                onClick={() => setDuration(duration + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* End Time Display */}
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 text-sm sm:text-base flex items-center">
                <Clock className="mr-2 text-purple-600" size={18} />
                Waktu Akhir:
              </span>
              <span className="font-bold text-purple-800 text-base sm:text-lg">
                {calculateEndTime()}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Parkir dari {arrivalTime} hingga {calculateEndTime()} ({duration}{" "}
              jam)
            </p>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <span className="font-medium text-gray-700 text-sm sm:text-base">
              Pilih Kendaraan:
            </span>
            {loadingVehicles ? (
              <div className="text-gray-500 text-xs sm:text-sm flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Loading vehicles...
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-red-500 text-xs sm:text-sm p-3 bg-red-50 rounded-lg">
                Anda belum memiliki kendaraan. Tambahkan kendaraan terlebih
                dahulu.
              </div>
            ) : (
              <select
                value={selectedVehicle?.id || ""}
                onChange={(e) => {
                  const vehicle = vehicles.find(
                    (v) => v.id === parseInt(e.target.value)
                  );
                  setSelectedVehicle(vehicle);
                  console.log("🚗 Vehicle selected:", vehicle);
                }}
                className="w-full p-2.5 sm:p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicle_name} - {vehicle.license_plate} (
                    {vehicle.vehicle_type}){vehicle.is_default ? " ⭐" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-between items-center text-base sm:text-lg font-bold border-t-2 pt-3 border-gray-200">
            <span className="text-gray-700">Total:</span>
            <span className="text-green-600">
              Rp {totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2 sticky bottom-0 bg-white pt-4">
          <button
            onClick={() => setReservationStep(2)}
            disabled={!selectedVehicle}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="mr-2" size={20} />
            Lanjut ke Pembayaran
          </button>

          <button
            onClick={() => setSelectedSlot(null)}
            className="w-full border-2 border-gray-300 text-gray-700 py-2.5 px-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
          >
            Pilih Slot Lain
          </button>
        </div>
      </div>
    );
  };

  const PaymentStep = () => {
    const zone = mallZones[selectedSlot.zone];
    const totalPrice = zone.price * duration;
    const [paymentMethod, setPaymentMethod] = useState("ewallet");
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
      try {
        setIsProcessing(true);
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Silakan login terlebih dahulu");
          navigate("/login");
          return;
        }

        // Format datetime for MySQL using selected date and time
        const formatDateTimeForMySQL = (date) => {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const hours = String(d.getHours()).padStart(2, "0");
          const minutes = String(d.getMinutes()).padStart(2, "0");
          const seconds = String(d.getSeconds()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        // ✅ Use selected date and arrival time from user input
        const [hours, minutes] = arrivalTime.split(":").map(Number);
        const startTime = new Date(reservationDate);
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = new Date(
          startTime.getTime() + duration * 60 * 60 * 1000
        );

        // ✅ NEW FLOW: STEP 1 - VALIDATE PAYMENT FIRST (simulasi payment gateway)
        console.log("💳 Step 1: Validating payment...");

        // Simulate payment validation (normally this would call a payment gateway)
        const paymentValidation = {
          amount: totalPrice,
          payment_method: paymentMethod,
          timestamp: new Date().toISOString(),
        };

        console.log("📤 Payment validation:", paymentValidation);

        // Simulate payment gateway response (0.5 second delay)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockPaymentToken = `PAY-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;
        console.log("✅ Payment validated! Token:", mockPaymentToken);

        // ✅ STEP 2: CREATE RESERVATION (after payment validation)
        console.log(
          "📝 Step 2: Creating reservation with validated payment..."
        );

        const reservationData = {
          locationId: locationData.id,
          zone_type: zone.name,
          vehicleId: selectedVehicle?.id || vehicles[0]?.id,
          startTime: formatDateTimeForMySQL(startTime),
          endTime: formatDateTimeForMySQL(endTime),
          totalPrice: totalPrice,
          duration: duration,
          zone: selectedSlot.zone,
          paymentToken: mockPaymentToken, // Payment token from validation
          payment_method: paymentMethod, // ✅ ADDED: Payment method for auto-payment creation
        };

        console.log("📤 Creating reservation...", reservationData);

        const reservationResponse = await fetch(
          "http://localhost:5000/api/reservations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(reservationData),
          }
        );

        const reservationResult = await reservationResponse.json();
        console.log("📥 Reservation response:", reservationResult);

        if (!reservationResponse.ok) {
          const errorMsg = reservationResult.message || "Reservation failed";
          const details = reservationResult.missingFields
            ? `\nMissing: ${reservationResult.missingFields.join(", ")}`
            : reservationResult.hint || "";
          throw new Error(errorMsg + details);
        }

        const reservationId = reservationResult.reservation?.id;
        console.log("✅ Reservation created! ID:", reservationId);

        console.log("🎉 Success! Payment validated → Reservation created");
        console.log("📋 Summary:");
        console.log("  - Payment Token:", mockPaymentToken);
        console.log("  - Reservation ID:", reservationId);
        console.log("  - Amount:", totalPrice);
        console.log("  - Payment Method:", paymentMethod);

        // ✅ Trigger refresh in ReservationTab via localStorage
        localStorage.setItem("newReservation", Date.now().toString());
        console.log("📢 Notified ReservationTab about new reservation");

        setReservationStep(3);
        setIsProcessing(false);
      } catch (error) {
        console.error("❌ Error:", error);
        const errorMsg =
          error.message || "Terjadi kesalahan. Silakan coba lagi.";
        alert(
          `An unexpected error occurred while creating reservation\n\n${errorMsg}`
        );
        setIsProcessing(false);
      }
    };

    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center sticky top-0 bg-white pb-2">
          <CreditCard className="mr-2 text-blue-600" size={20} />
          Pembayaran
        </h3>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">
                Slot {selectedSlot.number || selectedSlot.displayId}
              </span>
              <span className="font-semibold text-blue-600">
                Rp {zone.price.toLocaleString()}/jam
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Durasi: {duration} jam
              </span>
              <span className="font-bold text-xl text-green-600">
                Rp {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Metode Pembayaran:
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "ewallet"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="ewallet"
                  checked={paymentMethod === "ewallet"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4 text-blue-600"
                />
                <span className="font-medium flex-1">
                  E-Wallet (GoPay, OVO, DANA)
                </span>
                {paymentMethod === "ewallet" && (
                  <span className="text-blue-600 text-sm">✓</span>
                )}
              </label>
              <label
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "bank_transfer"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4 text-blue-600"
                />
                <span className="font-medium flex-1">Transfer Bank</span>
                {paymentMethod === "bank_transfer" && (
                  <span className="text-blue-600 text-sm">✓</span>
                )}
              </label>
              <label
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "credit_card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4 text-blue-600"
                />
                <span className="font-medium flex-1">Kartu Kredit/Debit</span>
                {paymentMethod === "credit_card" && (
                  <span className="text-blue-600 text-sm">✓</span>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2 sticky bottom-0 bg-white pt-4">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Memproses...
              </>
            ) : (
              <>
                <CreditCard className="mr-2" size={20} />
                Bayar Sekarang - Rp {totalPrice.toLocaleString()}
              </>
            )}
          </button>
          <button
            onClick={() => setReservationStep(1)}
            disabled={isProcessing}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  };

  const SuccessStep = () => {
    const zone = mallZones[selectedSlot.zone];
    const totalPrice = zone.price * duration;

    // Calculate end time
    const [hours, minutes] = arrivalTime.split(":").map(Number);
    const startDate = new Date(reservationDate);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    const endTime = endDate.toTimeString().split(" ")[0].slice(0, 5);

    // Format date for display
    const formatDisplayDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <span className="text-white text-2xl sm:text-3xl font-bold">✓</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
            Reservasi Berhasil!
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
            Slot {selectedSlot.number || selectedSlot.displayId} telah
            direservasi untuk {duration} jam
          </p>
        </div>

        {/* Reservation Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-green-200">
          <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
            Detail Reservasi
          </h4>
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lokasi:</span>
              <span className="font-medium text-right ml-2 truncate max-w-[60%]">
                {locationData?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Slot:</span>
              <span className="font-medium text-right ml-2 truncate max-w-[60%]">
                {selectedSlot.number || selectedSlot.displayId} - {zone.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tanggal:</span>
              <span className="font-medium text-right ml-2 truncate max-w-[60%]">
                {formatDisplayDate(reservationDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Waktu Mulai:</span>
              <span className="font-medium">{arrivalTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Waktu Selesai:</span>
              <span className="font-medium">{endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kendaraan:</span>
              <span className="font-medium text-right ml-2 truncate max-w-[60%]">
                {selectedVehicle?.license_plate || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durasi:</span>
              <span className="font-medium">{duration} jam</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-green-300">
              <span className="text-gray-700 font-medium">Total Bayar:</span>
              <span className="font-bold text-green-600 text-base sm:text-lg">
                Rp {totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                Aktif
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate("/mobile")}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-md"
          >
            <Clock className="mr-2" size={18} />
            Lihat Reservasi Saya
          </button>
          <button
            onClick={() => navigate("/parking")}
            className="w-full border-2 border-gray-300 text-gray-700 py-2.5 sm:py-3 px-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
          >
            Parkir Lagi
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header - Fixed */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="mr-2 sm:mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <ArrowLeft size={20} className="text-gray-600 sm:w-6 sm:h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
                  {locationData?.name || "Parking Reservation"}
                </h1>
                <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  <MapPin
                    size={14}
                    className="mr-1 flex-shrink-0 sm:w-4 sm:h-4"
                  />
                  <span className="truncate">{locationData?.address}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ml-2 flex-shrink-0">
              <Star className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{locationData?.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Zone Selection and Parking Layout */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <ZoneLegend />
              <SelectableParkingLayout />
            </div>

            {/* Right Column - Reservation Summary/Payment */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                {reservationStep === 1 && <ReservationSummary />}
                {reservationStep === 2 && <PaymentStep />}
                {reservationStep === 3 && <SuccessStep />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingReservationScreen;
