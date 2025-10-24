import React, { useState } from 'react';
import { 
  BarChart, 
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  Download, 
  Filter, 
  RefreshCcw, 
  FileText, 
  DollarSign, 
  Users, 
  Clock, 
  ChevronDown,
  Send
} from 'lucide-react';

const AdminReports = () => {
  const [reportType, setReportType] = useState('usage');
  const [timeRange, setTimeRange] = useState('weekly');
  const [parkingLocation, setParkingLocation] = useState('all');
  
  // Mock data for usage chart
  const usageData = [
    { day: 'Mon', occupancy: 65, reservations: 48 },
    { day: 'Tue', occupancy: 72, reservations: 53 },
    { day: 'Wed', occupancy: 78, reservations: 61 },
    { day: 'Thu', occupancy: 75, reservations: 57 },
    { day: 'Fri', occupancy: 85, reservations: 78 },
    { day: 'Sat', occupancy: 92, reservations: 85 },
    { day: 'Sun', occupancy: 78, reservations: 71 }
  ];
  
  // Mock data for revenue chart
  const revenueData = [
    { day: 'Mon', revenue: 1250000 },
    { day: 'Tue', revenue: 1380000 },
    { day: 'Wed', revenue: 1530000 },
    { day: 'Thu', revenue: 1420000 },
    { day: 'Fri', revenue: 1680000 },
    { day: 'Sat', revenue: 2150000 },
    { day: 'Sun', revenue: 1850000 }
  ];
  
  // Mock data for location distribution
  const locationData = [
    { name: 'Central Mall', value: 45 },
    { name: 'City Plaza', value: 30 },
    { name: 'Station', value: 25 }
  ];
  
  // Mock data for hourly distribution
  const hourlyData = [
    { hour: '06:00', value: 15 },
    { hour: '08:00', value: 48 },
    { hour: '10:00', value: 65 },
    { hour: '12:00', value: 72 },
    { hour: '14:00', value: 68 },
    { hour: '16:00', value: 75 },
    { hour: '18:00', value: 82 },
    { hour: '20:00', value: 65 },
    { hour: '22:00', value: 42 }
  ];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Mock locations
  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'central', name: 'Central Mall Parking' },
    { id: 'city', name: 'City Plaza Parking' },
    { id: 'station', name: 'Station Parking' }
  ];
  
  // Format currency
  const formatCurrency = (value) => {
    return `Rp ${value.toLocaleString()}`;
  };
  
  // Export options
  const exportFormats = ['PDF', 'Excel', 'CSV', 'Image'];
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Reports & Analytics</h2>
        <p className="text-gray-600">View and export parking usage and revenue reports</p>
      </div>
      
      {/* Controls and Filters */}
      <div className="p-4 flex flex-wrap gap-3 border-b">
        {/* Report Type Selector */}
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <div className="px-3 py-2 flex items-center">
            <FileText size={16} className="text-gray-500 mr-2" />
            <span className="text-gray-700 text-sm">Report:</span>
          </div>
          <select 
            className="border-l border-gray-300 px-3 py-2 outline-none"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="usage">Usage & Occupancy</option>
            <option value="revenue">Revenue & Transactions</option>
            <option value="distribution">Parking Distribution</option>
            <option value="hourly">Hourly Usage</option>
          </select>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <div className="px-3 py-2 flex items-center">
            <Calendar size={16} className="text-gray-500 mr-2" />
            <span className="text-gray-700 text-sm">Period:</span>
          </div>
          <select 
            className="border-l border-gray-300 px-3 py-2 outline-none"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {/* Location Selector */}
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <div className="px-3 py-2 flex items-center">
            <Filter size={16} className="text-gray-500 mr-2" />
            <span className="text-gray-700 text-sm">Location:</span>
          </div>
          <select 
            className="border-l border-gray-300 px-3 py-2 outline-none"
            value={parkingLocation}
            onChange={(e) => setParkingLocation(e.target.value)}
          >
            {locations.map(location => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-grow"></div>
        
        {/* Refresh & Export Buttons */}
        <div className="flex space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-md flex items-center text-gray-700">
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </button>
          
          <div className="relative group">
            <button className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center">
              <Download size={16} className="mr-2" />
              Export
              <ChevronDown size={16} className="ml-2" />
            </button>
            
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-10">
              {exportFormats.map(format => (
                <button key={format} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">
                  Export as {format}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="p-4">
        {/* Usage & Occupancy Report */}
        {reportType === 'usage' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Weekly Occupancy & Reservations</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={usageData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, null]} 
                      labelFormatter={(label) => `${label}day`}
                    />
                    <Legend />
                    <Bar dataKey="occupancy" name="Occupancy (%)" fill="#3B82F6" />
                    <Bar dataKey="reservations" name="Reservations (%)" fill="#93C5FD" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <h4 className="font-medium">Average Occupancy</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600">78%</p>
                <p className="text-sm text-blue-800 mt-1">+5.2% from last week</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Users size={20} className="text-green-600" />
                  </div>
                  <h4 className="font-medium">Total Reservations</h4>
                </div>
                <p className="text-3xl font-bold text-green-600">453</p>
                <p className="text-sm text-green-800 mt-1">+12% from last week</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <Clock size={20} className="text-yellow-600" />
                  </div>
                  <h4 className="font-medium">Peak Time</h4>
                </div>
                <p className="text-3xl font-bold text-yellow-600">18:00</p>
                <p className="text-sm text-yellow-800 mt-1">Saturday peak hour</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Users size={20} className="text-purple-600" />
                  </div>
                  <h4 className="font-medium">New Users</h4>
                </div>
                <p className="text-3xl font-bold text-purple-600">87</p>
                <p className="text-sm text-purple-800 mt-1">+24% from last week</p>
              </div>
            </div>
            
            {/* Data Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Daily Occupancy Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Day</th>
                      <th className="py-3 px-4 text-left font-medium">Occupancy (%)</th>
                      <th className="py-3 px-4 text-left font-medium">Reservations (%)</th>
                      <th className="py-3 px-4 text-left font-medium">Peak Hour</th>
                      <th className="py-3 px-4 text-left font-medium">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usageData.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{day.day}</td>
                        <td className="py-3 px-4">{day.occupancy}%</td>
                        <td className="py-3 px-4">{day.reservations}%</td>
                        <td className="py-3 px-4">{Math.floor(Math.random() * 12) + 8}:00</td>
                        <td className="py-3 px-4">{Math.floor(Math.random() * 3) + 1}h {Math.floor(Math.random() * 60)}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Revenue Report */}
        {reportType === 'revenue' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Weekly Revenue</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <h4 className="font-medium">Total Revenue</h4>
                </div>
                <p className="text-3xl font-bold text-green-600">Rp 11.2M</p>
                <p className="text-sm text-green-800 mt-1">+8.5% from last week</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <h4 className="font-medium">Transactions</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600">587</p>
                <p className="text-sm text-blue-800 mt-1">+5% from last week</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <DollarSign size={20} className="text-purple-600" />
                  </div>
                  <h4 className="font-medium">Avg. Transaction</h4>
                </div>
                <p className="text-3xl font-bold text-purple-600">Rp 19K</p>
                <p className="text-sm text-purple-800 mt-1">+3.2% from last week</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <DollarSign size={20} className="text-yellow-600" />
                  </div>
                  <h4 className="font-medium">Highest Revenue</h4>
                </div>
                <p className="text-3xl font-bold text-yellow-600">Rp 2.15M</p>
                <p className="text-sm text-yellow-800 mt-1">Saturday</p>
              </div>
            </div>
            
            {/* Data Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Revenue Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Day</th>
                      <th className="py-3 px-4 text-left font-medium">Revenue</th>
                      <th className="py-3 px-4 text-left font-medium">Transactions</th>
                      <th className="py-3 px-4 text-left font-medium">Avg. Transaction</th>
                      <th className="py-3 px-4 text-left font-medium">Top Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {revenueData.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{day.day}</td>
                        <td className="py-3 px-4 font-medium text-green-600">{formatCurrency(day.revenue)}</td>
                        <td className="py-3 px-4">{Math.floor(day.revenue / 19000)}</td>
                        <td className="py-3 px-4">Rp {(day.revenue / Math.floor(day.revenue / 19000)).toLocaleString()}</td>
                        <td className="py-3 px-4">{locationData[Math.floor(Math.random() * locationData.length)].name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Distribution Report */}
        {reportType === 'distribution' && (
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Parking by Location</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Parking by User Type</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Regular Users', value: 65 },
                          { name: 'One-time Users', value: 25 },
                          { name: 'Subscribers', value: 10 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Users']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Location Data Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Location Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Location</th>
                      <th className="py-3 px-4 text-left font-medium">Total Slots</th>
                      <th className="py-3 px-4 text-left font-medium">Avg. Occupancy</th>
                      <th className="py-3 px-4 text-left font-medium">Peak Time</th>
                      <th className="py-3 px-4 text-left font-medium">Revenue Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Central Mall Parking</td>
                      <td className="py-3 px-4">120</td>
                      <td className="py-3 px-4">78%</td>
                      <td className="py-3 px-4">Saturday, 14:00-18:00</td>
                      <td className="py-3 px-4">45%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">City Plaza Parking</td>
                      <td className="py-3 px-4">80</td>
                      <td className="py-3 px-4">82%</td>
                      <td className="py-3 px-4">Friday, 16:00-20:00</td>
                      <td className="py-3 px-4">30%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Station Parking</td>
                      <td className="py-3 px-4">60</td>
                      <td className="py-3 px-4">65%</td>
                      <td className="py-3 px-4">Monday, 07:00-09:00</td>
                      <td className="py-3 px-4">25%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Hourly Usage Report */}
        {reportType === 'hourly' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Hourly Parking Occupancy</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                    <Bar dataKey="value" name="Occupancy (%)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Clock size={20} className="text-purple-600" />
                  </div>
                  <h4 className="font-medium">Peak Hour</h4>
                </div>
                <p className="text-3xl font-bold text-purple-600">18:00</p>
                <p className="text-sm text-purple-800 mt-1">82% occupancy</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <h4 className="font-medium">Slowest Hour</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600">06:00</p>
                <p className="text-sm text-blue-800 mt-1">15% occupancy</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Clock size={20} className="text-green-600" />
                  </div>
                  <h4 className="font-medium">Avg. Stay Duration</h4>
                </div>
                <p className="text-3xl font-bold text-green-600">2h 15m</p>
                <p className="text-sm text-green-800 mt-1">Weekday average</p>
              </div>
            </div>
            
            {/* Hourly Data Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Hourly Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Hour</th>
                      <th className="py-3 px-4 text-left font-medium">Occupancy (%)</th>
                      <th className="py-3 px-4 text-left font-medium">Avg. Vehicles</th>
                      <th className="py-3 px-4 text-left font-medium">New Entries</th>
                      <th className="py-3 px-4 text-left font-medium">Exits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hourlyData.map((hour, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{hour.hour}</td>
                        <td className="py-3 px-4">{hour.value}%</td>
                        <td className="py-3 px-4">{Math.floor(hour.value * 3.05)}</td>
                        <td className="py-3 px-4">{Math.floor(Math.random() * 25) + 5}</td>
                        <td className="py-3 px-4">{Math.floor(Math.random() * 20) + 5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scheduled Reports */}
      <div className="p-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Scheduled Reports</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
            <Plus size={16} className="mr-2" />
            Schedule New Report
          </button>
          </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">Daily Revenue Report</h4>
                <p className="text-sm text-gray-600">Sent every day at 23:00</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>
            </div>
            <div className="text-sm">
              <p className="flex items-center text-gray-600">
                <Users size={14} className="mr-1" />
                Recipients: Finance Team
              </p>
              <p className="flex items-center text-gray-600 mt-1">
                <FileText size={14} className="mr-1" />
                Format: PDF, Excel
              </p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">Weekly Occupancy Report</h4>
                <p className="text-sm text-gray-600">Sent every Monday at 08:00</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>
            </div>
            <div className="text-sm">
              <p className="flex items-center text-gray-600">
                <Users size={14} className="mr-1" />
                Recipients: Management
              </p>
              <p className="flex items-center text-gray-600 mt-1">
                <FileText size={14} className="mr-1" />
                Format: PDF, CSV
              </p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">Monthly Revenue Analysis</h4>
                <p className="text-sm text-gray-600">Sent on 1st of each month</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>
            </div>
            <div className="text-sm">
              <p className="flex items-center text-gray-600">
                <Users size={14} className="mr-1" />
                Recipients: Executive Team
              </p>
              <p className="flex items-center text-gray-600 mt-1">
                <FileText size={14} className="mr-1" />
                Format: PDF, Excel, PPT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;