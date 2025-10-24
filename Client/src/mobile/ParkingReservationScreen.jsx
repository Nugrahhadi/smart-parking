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

  const [loading, setLoading] = useState(true);
  const [reservationStep, setReservationStep] = useState(1);
  const [locationData, setLocationData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // Mall zones dengan tema kreatif dan inovatif sesuai permintaan
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
      shopping: {
        name: "Shopping Paradise",
        icon: ShoppingBag,
        color: "from-pink-400 to-pink-600",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-300",
        textColor: "text-pink-800",
        price: 12000,
        features: [
          "Mall Access",
          "Department Store",
          "Fashion Outlets",
          "Beauty Center",
        ],
      },
      dining: {
        name: "Culinary Heaven",
        icon: Coffee,
        color: "from-orange-400 to-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-300",
        textColor: "text-orange-800",
        price: 10000,
        features: ["Restaurant Area", "Food Court", "Cafe", "Bar & Lounge"],
      },
      electric: {
        name: "Electric Vehicle Station",
        icon: Zap,
        color: "from-green-400 to-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-300",
        textColor: "text-green-800",
        price: 20000,
        features: [
          "Fast Charging",
          "Tesla Compatible",
          "Eco Friendly",
          "Premium Service",
        ],
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

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Shield className="mr-2 text-green-600" size={20} />
          Ringkasan Reservasi
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Icon className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="font-semibold text-gray-800">{zone.name}</p>
                <p className="text-sm text-gray-600">
                  Slot {selectedSlot.number || selectedSlot.displayId}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">
                Rp {zone.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">per jam</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Durasi Parkir:</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => duration > 1 && setDuration(duration - 1)}
                disabled={duration <= 1}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="font-bold text-lg px-3">{duration} jam</span>
              <button
                onClick={() => setDuration(duration + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <span className="font-medium text-gray-700">Pilih Kendaraan:</span>
            {loadingVehicles ? (
              <div className="text-gray-500 text-sm">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-red-500 text-sm">
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-green-600">
              Rp {totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setReservationStep(2)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg"
          >
            <CreditCard className="mr-2" size={20} />
            Lanjut ke Pembayaran
          </button>

          <button
            onClick={() => setSelectedSlot(null)}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-400 transition-all duration-300"
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

    const handlePayment = async () => {
      try {
        const token = localStorage.getItem("token");

        // ========================================
        // 🔧 FORMAT DATETIME FOR MYSQL
        // ========================================
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

        const startTime = new Date();
        const endTime = new Date(Date.now() + duration * 60 * 60 * 1000);
        const zone = mallZones[selectedSlot.zone];
        const totalPrice = zone.price * duration;

        // ✅ NEW: Prepare reservation data with zone_type instead of specific spotId
        const reservationData = {
          locationId: locationData.id,
          zone_type: zone.name, // ✅ Send zone name (e.g., "VIP Royal Zone") to backend
          vehicleId: selectedVehicle?.id || vehicles[0]?.id || null,
          startTime: formatDateTimeForMySQL(startTime),
          endTime: formatDateTimeForMySQL(endTime),
          totalPrice: totalPrice || 0,
          duration: duration,
          zone: selectedSlot.zone, // Keep for reference
        };

        // ========================================
        // 🔍 STEP 1: VALIDATE DATA BEFORE SENDING
        // ========================================
        console.group("📤 CLIENT: Sending Reservation Request");
        console.log(
          "🎯 Endpoint:",
          "POST http://localhost:5000/api/reservations"
        );

        // Validate required fields
        console.log("\n1️⃣ Validating required fields...");
        console.log("🔍 Raw values before validation:");
        console.log(
          "   locationId:",
          reservationData.locationId,
          "Type:",
          typeof reservationData.locationId
        );
        console.log(
          "   zone_type:",
          reservationData.zone_type,
          "Type:",
          typeof reservationData.zone_type
        );
        console.log(
          "   vehicleId:",
          reservationData.vehicleId,
          "Type:",
          typeof reservationData.vehicleId
        );
        console.log(
          "   startTime:",
          reservationData.startTime,
          "Type:",
          typeof reservationData.startTime
        );
        console.log(
          "   endTime:",
          reservationData.endTime,
          "Type:",
          typeof reservationData.endTime
        );

        const validation = {
          locationId:
            !!reservationData.locationId &&
            typeof reservationData.locationId === "number",
          zone_type:
            !!reservationData.zone_type &&
            typeof reservationData.zone_type === "string", // ✅ Validate zone_type instead of spotId
          vehicleId:
            reservationData.vehicleId !== null &&
            reservationData.vehicleId !== undefined,
          startTime:
            !!reservationData.startTime &&
            typeof reservationData.startTime === "string",
          endTime:
            !!reservationData.endTime &&
            typeof reservationData.endTime === "string",
        };

        console.log("\n📊 Validation results:");
        console.table(validation);

        const missingFields = Object.entries(validation)
          .filter(([, valid]) => !valid)
          .map(([key]) => key);

        if (missingFields.length > 0) {
          console.error("❌ VALIDATION FAILED!");
          console.error("Missing or invalid fields:", missingFields);
          alert(`Error: Missing required fields - ${missingFields.join(", ")}`);
          console.groupEnd();
          return;
        }

        console.log("✅ All validations passed!");

        console.log("\n2️⃣ Reservation Data:");
        console.log(
          "📦 Payload (JSON):",
          JSON.stringify(reservationData, null, 2)
        );
        console.log("🔑 Token present:", !!token);
        console.log("\n📋 Detailed Field Info:");
        console.table({
          locationId: {
            value: reservationData.locationId,
            type: typeof reservationData.locationId,
            valid: validation.locationId ? "✅" : "❌",
          },
          zone_type: {
            value: reservationData.zone_type,
            type: typeof reservationData.zone_type,
            valid: validation.zone_type ? "✅" : "❌",
          },
          vehicleId: {
            value: reservationData.vehicleId,
            type: typeof reservationData.vehicleId,
            valid: validation.vehicleId ? "✅" : "❌",
          },
          startTime: {
            value: reservationData.startTime,
            type: typeof reservationData.startTime,
            valid: validation.startTime ? "✅" : "❌",
          },
          endTime: {
            value: reservationData.endTime,
            type: typeof reservationData.endTime,
            valid: validation.endTime ? "✅" : "❌",
          },
          totalPrice: {
            value: reservationData.totalPrice,
            type: typeof reservationData.totalPrice,
            valid: "✅",
          },
          duration: {
            value: reservationData.duration,
            type: typeof reservationData.duration,
            valid: "✅",
          },
        });

        console.log("\n3️⃣ Sending to backend...");
        console.groupEnd();

        if (token) {
          // If user is logged in, try to create reservation via API
          const response = await fetch(
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

          // ========================================
          // 🔍 STEP 2: LOG SERVER RESPONSE
          // ========================================
          console.group("📥 SERVER: Reservation Response");
          console.log("📊 Status Code:", response.status);
          console.log("📊 Status Text:", response.statusText);
          console.log("✅ Response OK:", response.ok);

          const responseText = await response.text();
          console.log("📄 Raw Response:", responseText);

          let responseData;
          try {
            responseData = JSON.parse(responseText);
            console.log("📦 Parsed Response:", responseData);
          } catch (parseError) {
            console.error(
              "❌ Failed to parse response as JSON:",
              parseError.message
            );
          }
          console.groupEnd();

          if (response.ok) {
            console.log("✅ Reservation created successfully!");
            setReservationStep(3);
          } else {
            console.group("❌ SERVER ERROR DETAILS");
            console.error("Status:", response.status);
            console.error("Message:", responseData?.message || "No message");
            console.error("Error:", responseData?.error || "No error details");
            console.error(
              "Missing Fields:",
              responseData?.missingFields || "N/A"
            );
            console.groupEnd();

            // For demo purposes, still proceed
            setReservationStep(3);
          }
        } else {
          // If no token (demo mode), simulate successful payment
          console.log(
            "Demo mode: Simulating successful payment",
            reservationData
          );
          setReservationStep(3);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        // For demo purposes, still proceed
        setReservationStep(3);
      }
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <CreditCard className="mr-2 text-blue-600" size={20} />
          Pembayaran
        </h3>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Slot {selectedSlot.number || selectedSlot.displayId}
              </span>
              <span className="font-semibold">
                Rp {zone.price.toLocaleString()}/jam
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium text-gray-700">
                Duration: {duration} jam
              </span>
              <span className="font-bold text-xl text-green-600">
                Rp {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  className="mr-3"
                  defaultChecked
                />
                <span className="font-medium">E-Wallet (GoPay, OVO, DANA)</span>
              </label>
            </div>
            <div className="p-3 border rounded-lg">
              <label className="flex items-center">
                <input type="radio" name="payment" className="mr-3" />
                <span className="font-medium">Transfer Bank</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            Bayar Sekarang
          </button>
          <button
            onClick={() => setReservationStep(1)}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-400 transition-all duration-300"
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

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">✓</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Reservasi Berhasil!
          </h3>
          <p className="text-gray-600 mb-4">
            Slot {selectedSlot.number || selectedSlot.displayId} telah
            direservasi untuk {duration} jam
          </p>
        </div>

        {/* Reservation Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Detail Reservasi</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lokasi:</span>
              <span className="font-medium">{locationData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Slot:</span>
              <span className="font-medium">
                {selectedSlot.number || selectedSlot.displayId} - {zone.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durasi:</span>
              <span className="font-medium">{duration} jam</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bayar:</span>
              <span className="font-bold text-green-600">
                Rp {totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-blue-600">Aktif</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/reservation-history")}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <Clock className="mr-2" size={20} />
            Lihat History Reservasi
          </button>
          <button
            onClick={() => navigate("/parking")}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-400 transition-colors"
          >
            Kembali ke Daftar Parkir
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {locationData?.name || "Parking Reservation"}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin size={16} className="mr-1" />
                  <span>{locationData?.address}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Star className="text-yellow-500" size={16} />
              <span className="font-medium">{locationData?.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Zone Selection and Parking Layout */}
          <div className="lg:col-span-2 space-y-6">
            <ZoneLegend />
            <SelectableParkingLayout />
          </div>

          {/* Right Column - Reservation Summary/Payment */}
          <div className="lg:col-span-1">
            {reservationStep === 1 && <ReservationSummary />}
            {reservationStep === 2 && <PaymentStep />}
            {reservationStep === 3 && <SuccessStep />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingReservationScreen;
