import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Car,
  Bike,
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

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Anda belum login. Redirecting ke halaman login...");
        setTimeout(() => navigate("/login"), 2000);
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add vehicle");
      }

      await fetchVehicles();
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error("Error adding vehicle:", err);
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
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Anda belum login. Redirecting ke halaman login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center shadow-md">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        {/* Add Vehicle Button */}
        <button
          onClick={openAddForm}
          className="w-full mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-4 rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
          disabled={loading}
        >
          <Plus size={22} className="mr-2" />
          Tambah Kendaraan Baru
        </button>

        {/* Vehicles List */}
        <div className="space-y-4">
          {vehicles.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-md">
                <Car size={56} className="text-gray-300" />
              </div>
              <p className="text-gray-600 text-lg font-semibold mb-2">Belum ada kendaraan</p>
              <p className="text-gray-400">
                Tambahkan kendaraan pertama Anda untuk memulai
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${
                    vehicle.is_default
                      ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
                        vehicle.is_default 
                          ? "bg-gradient-to-br from-blue-400 to-blue-500" 
                          : "bg-gradient-to-br from-gray-200 to-gray-300"
                      }`}
                    >
                      {vehicle.vehicle_type === "Motorcycle" ? (
                        <Bike
                          size={28}
                          className={
                            vehicle.is_default ? "text-white" : "text-gray-600"
                          }
                        />
                      ) : (
                        <Car
                          size={28}
                          className={
                            vehicle.is_default ? "text-white" : "text-gray-600"
                          }
                        />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditForm(vehicle)}
                        className="p-3 text-blue-500 hover:bg-blue-100 rounded-lg transition-all duration-200"
                        disabled={loading}
                        title="Edit kendaraan"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(vehicle)}
                        className="p-3 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                        disabled={loading}
                        title="Hapus kendaraan"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">
                      {vehicle.vehicle_name}
                    </h3>
                    <p className="text-gray-700 font-mono text-sm mb-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      {vehicle.license_plate}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">{vehicle.vehicle_type}</span> • <span className="font-semibold">{vehicle.color}</span>
                    </p>
                    {vehicle.is_default && (
                      <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                        ⭐ Kendaraan Utama
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Tambah Kendaraan Baru</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Kendaraan"
                  value={formData.vehicle_name}
                  onChange={(e) =>
                    handleInputChange("vehicle_name", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <input
                  type="text"
                  placeholder="Plat Nomor"
                  value={formData.license_plate}
                  onChange={(e) =>
                    handleInputChange("license_plate", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <select
                  value={formData.vehicle_type}
                  onChange={(e) =>
                    handleInputChange("vehicle_type", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="MPV">MPV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>

                <input
                  type="text"
                  placeholder="Warna"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <label className="flex items-center p-3 bg-blue-50 rounded-xl border-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      handleInputChange("is_default", e.target.checked)
                    }
                    className="mr-3 w-5 h-5 cursor-pointer"
                  />
                  <span className="text-gray-700 font-semibold">Jadikan Kendaraan Utama</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-semibold"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={addVehicle}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 font-semibold"
                  disabled={
                    !formData.vehicle_name || !formData.license_plate || loading
                  }
                >
                  {loading ? "Menambahkan..." : "Tambah Kendaraan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Kendaraan</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Kendaraan"
                  value={formData.vehicle_name}
                  onChange={(e) =>
                    handleInputChange("vehicle_name", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <input
                  type="text"
                  placeholder="Plat Nomor"
                  value={formData.license_plate}
                  onChange={(e) =>
                    handleInputChange("license_plate", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <select
                  value={formData.vehicle_type}
                  onChange={(e) =>
                    handleInputChange("vehicle_type", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="MPV">MPV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>

                <input
                  type="text"
                  placeholder="Warna"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <label className="flex items-center p-3 bg-blue-50 rounded-xl border-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      handleInputChange("is_default", e.target.checked)
                    }
                    className="mr-3 w-5 h-5 cursor-pointer"
                  />
                  <span className="text-gray-700 font-semibold">Jadikan Kendaraan Utama</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedVehicle(null);
                    resetForm();
                  }}
                  className="px-5 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-semibold"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={updateVehicle}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 font-semibold"
                  disabled={
                    !formData.vehicle_name || !formData.license_plate || loading
                  }
                >
                  {loading ? "Memperbarui..." : "Perbarui Kendaraan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-center text-gray-800">
                Hapus Kendaraan
              </h2>
              <p className="text-gray-600 mb-2 text-center">
                Apakah Anda yakin ingin menghapus{" "}
                <strong>{selectedVehicle.vehicle_name}</strong>?
              </p>
              <p className="text-gray-600 text-center mb-6">
                (<span className="font-mono">{selectedVehicle.license_plate}</span>)
              </p>
              <p className="text-sm text-gray-500 text-center mb-8 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                ⚠️ Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedVehicle(null);
                  }}
                  className="px-5 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-semibold"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={deleteVehicle}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Menghapus..." : "Hapus Kendaraan"}
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
