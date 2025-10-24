import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Edit, 
  Trash, 
  UserPlus, 
  Download, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

const AdminUserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Mock user data
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      role: 'User',
      registeredDate: '12 Jan 2023',
      lastLogin: '2 hours ago',
      vehiclesCount: 2,
      transactionsCount: 15
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 987-6543',
      status: 'active',
      role: 'User',
      registeredDate: '24 Feb 2023',
      lastLogin: '1 day ago',
      vehiclesCount: 1,
      transactionsCount: 8
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      phone: '+1 (555) 456-7890',
      status: 'suspended',
      role: 'User',
      registeredDate: '3 Mar 2023',
      lastLogin: '15 days ago',
      vehiclesCount: 3,
      transactionsCount: 22
    },
    {
      id: 4,
      name: 'Emily Wilson',
      email: 'emily.wilson@example.com',
      phone: '+1 (555) 234-5678',
      status: 'inactive',
      role: 'User',
      registeredDate: '18 Apr 2023',
      lastLogin: '2 months ago',
      vehiclesCount: 1,
      transactionsCount: 3
    },
    {
      id: 5,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1 (555) 876-5432',
      status: 'active',
      role: 'Admin',
      registeredDate: '5 Dec 2022',
      lastLogin: '3 hours ago',
      vehiclesCount: 2,
      transactionsCount: 0
    },
  ];
  
  // Mock transaction history for the selected user
  const transactionHistory = [
    {
      id: 'TRX-12345',
      date: '15 Jun 2023',
      time: '14:32',
      location: 'Central Mall Parking',
      slot: 'B-42',
      duration: '2h 15m',
      amount: 'Rp 25.000',
      status: 'completed'
    },
    {
      id: 'TRX-12344',
      date: '10 Jun 2023',
      time: '10:15',
      location: 'City Plaza Parking',
      slot: 'A-12',
      duration: '1h 30m',
      amount: 'Rp 18.000',
      status: 'completed'
    },
    {
      id: 'TRX-12343',
      date: '5 Jun 2023',
      time: '16:45',
      location: 'Station Parking',
      slot: 'C-08',
      duration: '3h 00m',
      amount: 'Rp 30.000',
      status: 'refunded'
    },
  ];
  
  // Mock registered vehicles
  const registeredVehicles = [
    {
      id: 1,
      licensePlate: 'B 1234 CD',
      type: 'SUV',
      make: 'Toyota',
      model: 'RAV4',
      color: 'Silver'
    },
    {
      id: 2,
      licensePlate: 'B 5678 EF',
      type: 'Sedan',
      make: 'Honda',
      model: 'Civic',
      color: 'Black'
    }
  ];
  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };
  
  // Function to render user status badge
  const renderStatusBadge = (status) => {
    let bgColor, textColor, icon;
    
    switch(status) {
      case 'active':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <Check size={14} className="mr-1" />;
        break;
      case 'suspended':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <X size={14} className="mr-1" />;
        break;
      case 'inactive':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <X size={14} className="mr-1" />;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = null;
    }
    
    return (
      <span className={`flex items-center px-2 py-1 rounded-full text-xs ${bgColor} ${textColor}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="flex h-full">
      {/* Main User List */}
      <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${showDetails ? 'hidden md:block md:w-1/2 lg:w-2/3' : 'w-full'}`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage users and their access rights</p>
        </div>
        
        {/* Search and Filters */}
        <div className="p-4 flex flex-wrap gap-3">
          <div className="flex-grow relative">
            <input 
              type="text" 
              placeholder="Search users..." 
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
                <option>Suspended</option>
                <option>Inactive</option>
              </select>
            </div>
            
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-2 flex items-center">
                <Filter size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-700 text-sm">Role:</span>
              </div>
              <select className="border-l border-gray-300 px-3 py-2 outline-none">
                <option>All</option>
                <option>User</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
          
          <div>
            <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              <UserPlus size={16} className="mr-2" />
              Add User
            </button>
          </div>
        </div>
        
        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-4 text-left font-medium">Name</th>
                <th className="py-3 px-4 text-left font-medium">Email</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-left font-medium">Role</th>
                <th className="py-3 px-4 text-left font-medium">Registered Date</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">{renderStatusBadge(user.status)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.registeredDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded-full"
                        onClick={() => handleUserSelect(user)}
                      >
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <Edit size={16} className="text-blue-500" />
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
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1 to 5 of 42 entries
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* User Details Sidebar */}
      {showDetails && selectedUser && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full md:w-1/2 lg:w-1/3 border-l">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold">User Details</h3>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full"
              onClick={() => setShowDetails(false)}
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <User size={40} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">{selectedUser.name}</h2>
              <p className={`mt-1 text-sm px-2 py-0.5 rounded-full ${
                selectedUser.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedUser.role}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p>{renderStatusBadge(selectedUser.status)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registered</p>
                <p className="font-medium">{selectedUser.registeredDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">{selectedUser.lastLogin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicles</p>
                <p className="font-medium">{selectedUser.vehiclesCount}</p>
              </div>
            </div>
            
            {/* Tabs for details */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <a href="#" className="border-b-2 border-blue-500 py-2 text-sm font-medium text-blue-600">
                  Transactions
                </a>
                <a href="#" className="border-b-2 border-transparent py-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                  Vehicles
                </a>
                <a href="#" className="border-b-2 border-transparent py-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                  Access Rights
                </a>
              </nav>
            </div>
            
            {/* Transaction History */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Transaction History</h4>
                <button className="text-blue-600 text-sm flex items-center">
                  <Download size={14} className="mr-1" />
                  Export
                </button>
              </div>
              
              <div className="space-y-3">
                {transactionHistory.map(transaction => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{transaction.id}</p>
                        <p className="text-sm text-gray-600">{transaction.date}, {transaction.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>{transaction.location}</p>
                      <p>Slot: {transaction.slot}, Duration: {transaction.duration}</p>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-bold">{transaction.amount}</span>
                      <button className="text-blue-600 text-sm">Details</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-2 text-blue-600 text-sm font-medium mt-3">
                View All Transactions
              </button>
            </div>
            
            {/* Registered Vehicles (Initially Hidden) */}
            <div className="mt-4 hidden">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Registered Vehicles</h4>
                <button className="text-blue-600 text-sm flex items-center">
                  <UserPlus size={14} className="mr-1" />
                  Add Vehicle
                </button>
              </div>
              
              <div className="space-y-3">
                {registeredVehicles.map(vehicle => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{vehicle.licensePlate}</p>
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                    </div>
                    <div className="mt-1 text-sm">
                      <p>{vehicle.make} {vehicle.model}</p>
                      <p>{vehicle.type}, {vehicle.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Access Rights Management (Initially Hidden) */}
            <div className="mt-4 hidden">
              <h4 className="font-medium mb-3">Access Rights</h4>
              
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Role</p>
                      <p className="text-sm text-gray-600">Set user's system-wide permissions</p>
                    </div>
                    <select className="border border-gray-300 rounded-md px-3 py-1">
                      <option>User</option>
                      <option>Admin</option>
                      <option>Manager</option>
                    </select>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium mb-2">Permissions</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Reserve parking spaces</label>
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Access transaction history</label>
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Manage multiple vehicles</label>
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">View analytics dashboard</label>
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Manage other users</label>
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md">
                  Cancel
                </button>
                <button className="flex-1 py-2 bg-blue-600 text-white rounded-md">
                  Save Changes
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t flex space-x-2">
              <button className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-md">
                Edit
              </button>
              {selectedUser.status === 'active' ? (
                <button className="flex-1 py-2 border border-red-600 text-red-600 rounded-md">
                  Suspend
                </button>
              ) : (
                <button className="flex-1 py-2 border border-green-600 text-green-600 rounded-md">
                  Activate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;