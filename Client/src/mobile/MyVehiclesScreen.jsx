import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Car,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyVehiclesScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_name: "",
    license_plate: "",
    vehicle_type: "Sedan",
    color: "Black",
    is_default: false,
  });

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:5000/api/vehicles", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }

      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new vehicle
  const addVehicle = async () => {
    try {
      setLoading(true);

      // ========================================
      // 🔍 STEP 1: LOG CLIENT-SIDE PAYLOAD
      // ========================================
      console.group("📤 CLIENT: Adding New Vehicle");
      console.log("🎯 Endpoint:", "POST http://localhost:5000/api/vehicles");

      // Enhanced token checking
      console.log("\n1️⃣ Checking localStorage for token...");
      const token = localStorage.getItem("token");
      console.log("   Token exists:", !!token);
      console.log("   Token length:", token?.length || 0);
      console.log("   Token type:", typeof token);

      if (!token) {
        console.error("\n❌ CRITICAL: NO TOKEN FOUND IN LOCALSTORAGE!");
        console.log("� All localStorage keys:", Object.keys(localStorage));
        console.log("💡 Possible causes:");
        console.log("   - User not logged in");
        console.log("   - Token expired/cleared");
        console.log("   - Session lost");
        console.groupEnd();

        setError("Anda belum login. Redirecting ke halaman login...");
        setTimeout(() => navigate("/login"), 2000);
        throw new Error("No authentication token found");
      }

      console.log("   ✅ Token found!");
      console.log("   Token preview:", token.substring(0, 50) + "...");

      console.log("\n2️⃣ Form Data:");
      console.log("📦 Payload:", JSON.stringify(formData, null, 2));
      console.log("📋 Form Data Fields:");
      console.table({
        vehicle_name: {
          value: formData.vehicle_name,
          type: typeof formData.vehicle_name,
          empty: !formData.vehicle_name,
        },
        license_plate: {
          value: formData.license_plate,
          type: typeof formData.license_plate,
          empty: !formData.license_plate,
        },
        vehicle_type: {
          value: formData.vehicle_type,
          type: typeof formData.vehicle_type,
          empty: !formData.vehicle_type,
        },
        color: {
          value: formData.color,
          type: typeof formData.color,
          empty: !formData.color,
        },
        is_default: {
          value: formData.is_default,
          type: typeof formData.is_default,
        },
      });

      console.log("\n3️⃣ Sending request to backend...");
      console.log("   URL:", "http://localhost:5000/api/vehicles");
      console.log("   Method:", "POST");
      console.log("   Headers:", {
        Authorization: `Bearer ${token.substring(0, 30)}...`,
        "Content-Type": "application/json",
      });
      console.groupEnd();

      const response = await fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // ========================================
      // 🔍 STEP 2: LOG SERVER RESPONSE
      // ========================================
      console.group("📥 SERVER: Add Vehicle Response");
      console.log("\n4️⃣ Response received:");
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
        console.error("❌ Failed to parse response:", parseError.message);
        responseData = { message: responseText };
      }
      console.groupEnd();

      if (!response.ok) {
        console.group("❌ SERVER ERROR DETAILS");
        console.error("Status:", response.status);
        console.error("Message:", responseData?.message || "No message");
        console.error("Error:", responseData?.error || "No error");
        console.error("SQL State:", responseData?.sqlState || "N/A");
        console.groupEnd();

        throw new Error(responseData?.message || "Failed to add vehicle");
      }

      console.log("✅ Vehicle added successfully!");
      await fetchVehicles();
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error("❌ Error adding vehicle:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update vehicle
  const updateVehicle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5000/api/vehicles/${selectedVehicle.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update vehicle");
      }

      await fetchVehicles();
      setShowEditForm(false);
      setSelectedVehicle(null);
      resetForm();
    } catch (err) {
      console.error("Error updating vehicle:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete vehicle
  const deleteVehicle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5000/api/vehicles/${selectedVehicle.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete vehicle");
      }

      await fetchVehicles();
      setShowDeleteConfirm(false);
      setSelectedVehicle(null);
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      vehicle_name: "",
      license_plate: "",
      vehicle_type: "Sedan",
      color: "Black",
      is_default: false,
    });
  };

  const openAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const openEditForm = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicle_name: vehicle.vehicle_name,
      license_plate: vehicle.license_plate,
      vehicle_type: vehicle.vehicle_type,
      color: vehicle.color,
      is_default: vehicle.is_default,
    });
    setShowEditForm(true);
  };

  const openDeleteConfirm = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteConfirm(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Load vehicles on component mount
  useEffect(() => {
    // ========================================
    // 🔒 CHECK AUTHENTICATION FIRST
    // ========================================
    const token = localStorage.getItem("token");

    console.group("🔐 MyVehiclesScreen - Authentication Check");
    console.log("1️⃣ Checking for token in localStorage...");
    console.log("   Token exists:", !!token);
    console.log("   Token length:", token?.length || 0);

    if (!token) {
      console.error("❌ NO TOKEN FOUND!");
      console.log("📋 All localStorage keys:", Object.keys(localStorage));
      console.warn("⚠️ User not authenticated - redirecting to login...");
      console.groupEnd();

      // Show error message and redirect to login
      setError("Anda belum login. Redirecting ke halaman login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    console.log("✅ Token found! User is authenticated.");
    console.log("   Token preview:", token.substring(0, 50) + "...");
    console.groupEnd();

    fetchVehicles();
  }, [navigate]);

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Loader className="w-8 h-8 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-gray-600">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">My Vehicles</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Add Vehicle Button */}
        <button
          onClick={openAddForm}
          className="w-full mb-6 bg-blue-500 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          <Plus size={20} className="mr-2" />
          Add New Vehicle
        </button>

        {/* Vehicles List */}
        <div className="space-y-4">
          {vehicles.length === 0 && !loading ? (
            <div className="text-center py-8">
              <Car size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No vehicles added yet</p>
              <p className="text-gray-400">
                Add your first vehicle to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow ${
                    vehicle.is_default
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        vehicle.is_default ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Car
                        size={24}
                        className={
                          vehicle.is_default ? "text-blue-600" : "text-gray-600"
                        }
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditForm(vehicle)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(vehicle)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {vehicle.vehicle_name}
                    </h3>
                    <p className="text-gray-600 font-mono text-sm mb-1">
                      {vehicle.license_plate}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {vehicle.vehicle_type} • {vehicle.color}
                    </p>
                    {vehicle.is_default && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Default Vehicle
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Vehicle Name"
                  value={formData.vehicle_name}
                  onChange={(e) =>
                    handleInputChange("vehicle_name", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="License Plate"
                  value={formData.license_plate}
                  onChange={(e) =>
                    handleInputChange("license_plate", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={formData.vehicle_type}
                  onChange={(e) =>
                    handleInputChange("vehicle_type", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="MPV">MPV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>

                <input
                  type="text"
                  placeholder="Color"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      handleInputChange("is_default", e.target.checked)
                    }
                    className="mr-2"
                  />
                  Set as default vehicle
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={addVehicle}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={
                    !formData.vehicle_name || !formData.license_plate || loading
                  }
                >
                  {loading ? "Adding..." : "Add Vehicle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Vehicle</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Vehicle Name"
                  value={formData.vehicle_name}
                  onChange={(e) =>
                    handleInputChange("vehicle_name", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="License Plate"
                  value={formData.license_plate}
                  onChange={(e) =>
                    handleInputChange("license_plate", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={formData.vehicle_type}
                  onChange={(e) =>
                    handleInputChange("vehicle_type", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sedan">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="MPV">MPV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>

                <input
                  type="text"
                  placeholder="Color"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      handleInputChange("is_default", e.target.checked)
                    }
                    className="mr-2"
                  />
                  Set as default vehicle
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedVehicle(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={updateVehicle}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={
                    !formData.vehicle_name || !formData.license_plate || loading
                  }
                >
                  {loading ? "Updating..." : "Update Vehicle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-red-600">
                Delete Vehicle
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <strong>{selectedVehicle.vehicle_name}</strong> (
                {selectedVehicle.license_plate})?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedVehicle(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteVehicle}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Vehicle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVehiclesScreen;
