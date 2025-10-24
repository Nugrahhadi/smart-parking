/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

const ParkingLocations = () => {
  // Mock locations data
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Central Mall Parking",
      address: "Jl. Sudirman No. 123, Jakarta",
      totalSlots: 120,
      availableSlots: 42,
      occupancy: "65%",
      status: "active",
      coordinates: "-6.2088, 106.8456",
      hourlyRate: "Rp 5.000",
      sensors: { total: 120, online: 118 }
    },
    {
      id: 2,
      name: "City Plaza Parking",
      address: "Jl. Gatot Subroto No. 567, Jakarta",
      totalSlots: 80,
      availableSlots: 15,
      occupancy: "81%",
      status: "active",
      coordinates: "-6.2208, 106.8326",
      hourlyRate: "Rp 6.000",
      sensors: { total: 80, online: 80 }
    },
    {
      id: 3,
      name: "Station Parking",
      address: "Jl. Thamrin No. 45, Jakarta",
      totalSlots: 60,
      availableSlots: 8,
      occupancy: "87%",
      status: "active",
      coordinates: "-6.1928, 106.8236",
      hourlyRate: "Rp 4.000",
      sensors: { total: 60, online: 57 }
    },
    {
      id: 4,
      name: "Harbor View Parking",
      address: "Jl. Ancol Timur, Jakarta",
      totalSlots: 45,
      availableSlots: 22,
      occupancy: "51%",
      status: "maintenance",
      coordinates: "-6.1268, 106.8456",
      hourlyRate: "Rp 7.000",
      sensors: { total: 45, online: 36 }
    },
    {
      id: 5,
      name: "Greenville Mall Parking",
      address: "Jl. BSD Grand Boulevard, Tangerang",
      totalSlots: 150,
      availableSlots: 62,
      occupancy: "59%",
      status: "active",
      coordinates: "-6.2898, 106.6766",
      hourlyRate: "Rp 5.000",
      sensors: { total: 150, online: 147 }
    },
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar would be here, but we'll reuse the one from AdminDashboard */}
      
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
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
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
            <button className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center text-sm">
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
                {locations.map(location => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <MapPin size={16} className="text-blue-600" />
                        </div>
                        <div className="font-medium">{location.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{location.address}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-green-600 font-medium">{location.availableSlots}</span>
                        <span className="text-gray-500"> / {location.totalSlots}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: location.occupancy }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{location.occupancy}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        location.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {location.status === 'active' ? 'Active' : 'Maintenance'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{location.hourlyRate}/hr</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded-full">
                          <Edit size={16} className="text-blue-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded-full">
                          <BarChart3 size={16} className="text-purple-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded-full">
                          <Trash size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing 1 to 5 of 5 entries
              </div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                  <ChevronLeft size={16} />
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md bg-blue-600 text-white">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Details (Hidden by default, would be shown when a location is clicked) */}
        {/* This would be implemented with a state to show/hide and the selected location details */}
      </div>
    </div>
  );
};

export default ParkingLocations;