// src/screens/MyVehiclesScreen.jsx
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Car, Bike, Loader, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FOOTER_H = 88;

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

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch("http://localhost:5000/api/vehicles", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to add vehicle");
      await fetchVehicles();
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVehicle.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update vehicle");
      await fetchVehicles();
      setShowEditForm(false);
      setSelectedVehicle(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVehicle.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete vehicle");
      await fetchVehicles();
      setShowDeleteConfirm(false);
      setSelectedVehicle(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Anda belum login. Redirecting ke halaman login...");
      setTimeout(() => navigate("/login"), 1500);
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

  const bottomSpacer = `calc(${FOOTER_H}px + env(safe-area-inset-bottom))`;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-5 pt-6 pb-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Kendaraan Saya
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Kelola dan atur kendaraan untuk reservasi.
          </p>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-5">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 px-5 pb-6">
        <div className="max-w-6xl mx-auto">
          {vehicles.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur rounded-2xl w-28 h-28 mx-auto mb-6 flex items-center justify-center shadow">
                <Car size={56} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">Belum ada kendaraan</h3>
              <p className="text-slate-500 mt-1">Tambahkan kendaraan pertama Anda untuk memulai.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className={`rounded-2xl p-5 shadow-lg ring-1 ring-slate-200/70 hover:shadow-xl transition-all bg-white ${
                    v.is_default ? "bg-gradient-to-br from-blue-50 to-blue-100 ring-blue-200" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow ${
                        v.is_default ? "bg-blue-500" : "bg-slate-200"
                      }`}
                    >
                      {v.vehicle_type === "Motorcycle" ? (
                        <Bike size={28} className={v.is_default ? "text-white" : "text-slate-700"} />
                      ) : (
                        <Car size={28} className={v.is_default ? "text-white" : "text-slate-700"} />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(v)}
                        className="p-2.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                        disabled={loading}
                        title="Edit kendaraan"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(v)}
                        className="p-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                        disabled={loading}
                        title="Hapus kendaraan"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg">{v.vehicle_name}</h3>
                  <p className="text-slate-700 font-mono text-sm mb-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    {v.license_plate}
                  </p>
                  <p className="text-sm text-slate-600 mb-3">
                    <span className="font-semibold">{v.vehicle_type}</span> • <span className="font-semibold">{v.color}</span>
                  </p>
                  {v.is_default && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                      ⭐ Kendaraan Utama
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={openAddForm}
              className="w-full h-14 md:h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl shadow-lg font-semibold text-base md:text-lg transition"
              disabled={loading}
            >
              <span className="inline-flex items-center justify-center">
                <Plus size={20} className="mr-2" />
                Tambah Kendaraan Baru
              </span>
            </button>
          </div>

          <div style={{ height: bottomSpacer }} />
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Tambah Kendaraan Baru</h2>
              <div className="space-y-4">
                <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Kendaraan" value={formData.vehicle_name} onChange={(e) => handleInputChange("vehicle_name", e.target.value)} />
                <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Plat Nomor" value={formData.license_plate} onChange={(e) => handleInputChange("license_plate", e.target.value)} />
                <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.vehicle_type} onChange={(e) => handleInputChange("vehicle_type", e.target.value)}>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="MPV">MPV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
                <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Warna" value={formData.color} onChange={(e) => handleInputChange("color", e.target.value)} />
                <label className="flex items-center p-3 bg-blue-50 rounded-xl border-2 border-blue-200 cursor-pointer hover:bg-blue-100">
                  <input type="checkbox" checked={formData.is_default} onChange={(e) => handleInputChange("is_default", e.target.checked)} className="mr-3 w-5 h-5 cursor-pointer" />
                  <span className="text-slate-700 font-semibold">Jadikan Kendaraan Utama</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setShowAddForm(false)} className="px-5 py-3 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold" disabled={loading}>Batal</button>
                <button onClick={addVehicle} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold" disabled={!formData.vehicle_name || !formData.license_plate || loading}>
                  {loading ? "Menambahkan..." : "Tambah Kendaraan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Kendaraan</h2>
              <div className="space-y-4">
                <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Kendaraan" value={formData.vehicle_name} onChange={(e) => handleInputChange("vehicle_name", e.target.value)} />
                <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Plat Nomor" value={formData.license_plate} onChange={(e) => handleInputChange("license_plate", e.target.value)} />
                <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.vehicle_type} onChange={(e) => handleInputChange("vehicle_type", e.target.value)}>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="MPV">MPV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
                <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Warna" value={formData.color} onChange={(e) => handleInputChange("color", e.target.value)} />
                <label className="flex items-center p-3 bg-blue-50 rounded-xl border-2 border-blue-200 cursor-pointer hover:bg-blue-100">
                  <input type="checkbox" checked={formData.is_default} onChange={(e) => handleInputChange("is_default", e.target.checked)} className="mr-3 w-5 h-5 cursor-pointer" />
                  <span className="text-slate-700 font-semibold">Jadikan Kendaraan Utama</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => { setShowEditForm(false); setSelectedVehicle(null); resetForm(); }} className="px-5 py-3 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold" disabled={loading}>Batal</button>
                <button onClick={updateVehicle} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold" disabled={!formData.vehicle_name || !formData.license_plate || loading}>
                  {loading ? "Memperbarui..." : "Perbarui Kendaraan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedVehicle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-center text-slate-800">Hapus Kendaraan</h2>
              <p className="text-slate-600 mb-2 text-center">
                Apakah Anda yakin ingin menghapus <strong>{selectedVehicle.vehicle_name}</strong>?
              </p>
              <p className="text-slate-600 text-center mb-6">
                (<span className="font-mono">{selectedVehicle.license_plate}</span>)
              </p>
              <p className="text-sm text-slate-500 text-center mb-8 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                ⚠️ Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setSelectedVehicle(null); }} className="px-5 py-3 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold" disabled={loading}>Batal</button>
                <button onClick={deleteVehicle} className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 font-semibold" disabled={loading}>
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
