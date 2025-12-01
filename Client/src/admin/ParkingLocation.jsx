/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Plus,
  Download,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  BarChart3,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchLocations,
  formatCurrency,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../utils/api";
import AdminSidebar from "./components/AdminSidebar";

const ParkingLocations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    status: "active",
    price_per_hour: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await fetchLocations();
      setLocations(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error loading locations:", err);
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData({
      name: "",
      address: "",
      status: "active",
      price_per_hour: 0,
    });
    setShowModal(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      status: location.status,
      price_per_hour: location.hourly_rate || 0,
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        // Update existing location
        await updateLocation(editingLocation.id, formData);
        alert("Location updated successfully");
      } else {
        // Create new location
        await createLocation(formData);
        alert("Location created successfully");
      }
      setShowModal(false);
      loadLocations();
    } catch (err) {
      console.error("Error:", err);
      alert(err.message || "Failed to save location");
    }
  };

  const handleDeleteLocation = async (id) => {
    try {
      await deleteLocation(id);
      alert("Location deleted successfully");
      loadLocations();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error:", err);
      alert(err.message || "Failed to delete location");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab="locations"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <div className="bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold">Parking Locations</h2>
          <p className="text-gray-600">Manage all parking locations</p>
        </div>

        {/* Search and Filters */}
        <div className="p-4 flex flex-wrap gap-3">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search locations..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            />
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
          </div>

          <div className="flex space-x-2">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-2 flex items-center">
                <Filter size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-700 text-sm">Status:</span>
              </div>
              <select className="border-l border-gray-300 px-3 py-2 outline-none">
                <option>All</option>
                <option>Active</option>
                <option>Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center text-sm">
              <Download size={16} className="mr-2" />
              Export
            </button>
            <button
              onClick={handleAddLocation}
              className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center text-sm hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Add Location
            </button>
          </div>
        </div>

        {/* Locations Table */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Location</th>
                  <th className="py-3 px-4 text-left font-medium">Address</th>
                  <th className="py-3 px-4 text-left font-medium">Slots</th>
                  <th className="py-3 px-4 text-left font-medium">Occupancy</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Rate</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((location) => {
                  const occupancy =
                    location.total_slots > 0
                      ? Math.round(
                          (location.occupied_slots / location.total_slots) * 100
                        )
                      : 0;
                  const availableSlots =
                    location.total_slots - location.occupied_slots;

                  return (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <MapPin size={16} className="text-blue-600" />
                          </div>
                          <div className="font-medium">{location.name}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {location.address}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-green-600 font-medium">
                            {availableSlots || 0}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            / {location.total_slots || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${occupancy}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {occupancy}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            location.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {location.status === "active"
                            ? "Active"
                            : "Maintenance"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(location.hourly_rate)}/hr
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditLocation(location)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <Edit size={16} className="text-blue-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded-full">
                            <BarChart3 size={16} className="text-purple-500" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(location.id)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <Trash size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing 1 to {locations.length} of {locations.length} entries
              </div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                  <ChevronLeft size={16} />
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md bg-blue-600 text-white">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Location Details (Hidden by default, would be shown when a location is clicked) */}
        {/* This would be implemented with a state to show/hide and the selected location details */}

        {/* Add/Edit Location Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h3>

              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate (Rp) *
                    </label>
                    <input
                      type="number"
                      value={formData.price_per_hour}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price_per_hour: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingLocation ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-lg font-bold mb-2">Delete Location</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this location? This action
                cannot be undone.
              </p>

              <div className="flex space-x-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLocation(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingLocations;
