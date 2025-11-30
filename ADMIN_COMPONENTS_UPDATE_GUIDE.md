# Admin Components Update Guide

This guide shows how to update all admin components to use real database data instead of mock data.

## ✅ COMPLETED: AdminDashboard.jsx

**Changes Made:**

- ✅ Removed all mock data (statistics, parkingData, parkingLocations, recentActivities)
- ✅ Added useEffect and useState hooks for data fetching
- ✅ Integrated with `/api/admin/dashboard/metrics` endpoint
- ✅ Integrated with `/api/admin/dashboard/chart` endpoint
- ✅ Integrated with `/api/admin/locations` endpoint
- ✅ Added loading and error states
- ✅ Added refresh button with auto-refresh every 60 seconds
- ✅ Real-time calculations for total/occupied/available slots
- ✅ Removed "Recent Activities" section (no backend API yet)

**API Endpoints Used:**

```javascript
GET / api / admin / dashboard / metrics; // Returns revenue, occupancy, reservations, users
GET / api / admin / dashboard / chart; // Returns hourly parking data
GET / api / admin / locations; // Returns all parking locations with stats
```

---

## 🔄 TODO: ParkingLocation.jsx

**Mock Data to Remove:**

```javascript
// Remove this:
const [locations, setLocations] = useState([
  /* hardcoded array */
]);
```

**Required Changes:**

1. **Add API Integration:**

```javascript
import { useState, useEffect } from "react";
import {
  fetchLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../utils/api";

const [locations, setLocations] = useState([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [editingLocation, setEditingLocation] = useState(null);

useEffect(() => {
  loadLocations();
}, []);

const loadLocations = async () => {
  setLoading(true);
  try {
    const result = await fetchLocations();
    setLocations(result.data);
  } catch (error) {
    console.error("Failed to load locations:", error);
  }
  setLoading(false);
};
```

2. **Add CRUD Handlers:**

```javascript
const handleCreate = async (formData) => {
  try {
    await createLocation(formData);
    loadLocations(); // Refresh list
    setShowModal(false);
  } catch (error) {
    alert("Failed to create location: " + error.message);
  }
};

const handleUpdate = async (id, formData) => {
  try {
    await updateLocation(id, formData);
    loadLocations();
    setShowModal(false);
  } catch (error) {
    alert("Failed to update location: " + error.message);
  }
};

const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this location?")) return;
  try {
    await deleteLocation(id);
    loadLocations();
  } catch (error) {
    alert("Failed to delete location: " + error.message);
  }
};
```

3. **Add Create/Edit Modal:**

```jsx
{
  showModal && (
    <LocationModal
      location={editingLocation}
      onSave={
        editingLocation
          ? (data) => handleUpdate(editingLocation.id, data)
          : handleCreate
      }
      onCancel={() => {
        setShowModal(false);
        setEditingLocation(null);
      }}
    />
  );
}
```

4. **Update Table Rendering:**

```jsx
{
  locations.map((location) => {
    const available = location.total_slots - location.occupied_slots;
    return (
      <tr key={location.id}>
        <td>{location.name}</td>
        <td>
          {available} / {location.total_slots}
        </td>
        <td>{location.occupancy_rate}%</td>
        <td>
          <span
            className={
              location.status === "active" ? "badge-green" : "badge-yellow"
            }
          >
            {location.status}
          </span>
        </td>
        <td>{formatCurrency(location.price_per_hour)}/hr</td>
        <td>
          <button
            onClick={() => {
              setEditingLocation(location);
              setShowModal(true);
            }}
          >
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(location.id)}>
            <Trash size={16} />
          </button>
        </td>
      </tr>
    );
  });
}
```

**Backend Endpoints:**

- `GET /api/admin/locations` - List all
- `POST /api/admin/locations` - Create new
- `PUT /api/admin/locations/:id` - Update
- `DELETE /api/admin/locations/:id` - Delete

---

## 🔄 TODO: AdminUserManagement.jsx

**Mock Data to Remove:**

```javascript
const users = [
  /* hardcoded array */
];
const transactionHistory = [
  /* hardcoded array */
];
const registeredVehicles = [
  /* hardcoded array */
];
```

**Required Changes:**

1. **Add API Integration:**

```javascript
import {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
} from "../utils/api";

const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [loading, setLoading] = useState(true);
const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

useEffect(() => {
  loadUsers();
}, [pagination.page]);

const loadUsers = async () => {
  setLoading(true);
  try {
    const result = await fetchUsers({
      page: pagination.page,
      limit: pagination.limit,
    });
    setUsers(result.data);
    setPagination((prev) => ({ ...prev, ...result.pagination }));
  } catch (error) {
    console.error("Failed to load users:", error);
  }
  setLoading(false);
};
```

2. **Add CRUD Handlers:**

```javascript
const handleCreateUser = async (userData) => {
  try {
    await createUser(userData);
    loadUsers();
  } catch (error) {
    alert("Failed to create user: " + error.message);
  }
};

const handleUpdateUser = async (id, userData) => {
  try {
    await updateUser(id, userData);
    loadUsers();
  } catch (error) {
    alert("Failed to update user: " + error.message);
  }
};

const handleDeleteUser = async (id) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await deleteUser(id);
    loadUsers();
    setSelectedUser(null);
  } catch (error) {
    alert("Failed to delete user: " + error.message);
  }
};
```

3. **Update Table:**

```jsx
{
  users.map((user) => (
    <tr key={user.id}>
      <td>{user.full_name}</td>
      <td>{user.email}</td>
      <td>
        <span className={user.role === "admin" ? "badge-purple" : "badge-blue"}>
          {user.role}
        </span>
      </td>
      <td>{formatDate(user.created_at)}</td>
      <td>
        <button onClick={() => handleUserSelect(user)}>View</button>
        <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
      </td>
    </tr>
  ));
}
```

**Backend Endpoints:**

- `GET /api/admin/users?page=1&limit=10` - List with pagination
- `GET /api/admin/users/:id` - Get single user
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

---

## 🔄 TODO: TransactionsScreen.jsx

**Mock Data to Remove:**

```javascript
const [transactions, setTransactions] = useState([
  /* hardcoded array */
]);
```

**Required Changes:**

1. **Add API Integration:**

```javascript
import {
  fetchTransactions,
  fetchTransaction,
  fetchTransactionsSummary,
} from "../utils/api";

const [transactions, setTransactions] = useState([]);
const [summary, setSummary] = useState({});
const [filters, setFilters] = useState({
  status: "",
  location_id: "",
  startDate: "",
  endDate: "",
});
const [pagination, setPagination] = useState({ page: 1, limit: 10 });

useEffect(() => {
  loadTransactions();
  loadSummary();
}, [filters, pagination.page]);

const loadTransactions = async () => {
  try {
    const result = await fetchTransactions({ ...filters, ...pagination });
    setTransactions(result.data);
    setPagination((prev) => ({ ...prev, ...result.pagination }));
  } catch (error) {
    console.error("Failed to load transactions:", error);
  }
};

const loadSummary = async () => {
  try {
    const result = await fetchTransactionsSummary();
    setSummary(result.data);
  } catch (error) {
    console.error("Failed to load summary:", error);
  }
};
```

2. **Update Summary Cards:**

```jsx
<div className="grid grid-cols-4 gap-4 p-4">
  <div className="bg-white p-4 rounded-lg">
    <h3>Today's Transactions</h3>
    <p>{summary.total_transactions || 0}</p>
  </div>
  <div className="bg-white p-4 rounded-lg">
    <h3>Today's Revenue</h3>
    <p>{formatCurrency(summary.total_revenue || 0)}</p>
  </div>
  <div className="bg-white p-4 rounded-lg">
    <h3>Average Amount</h3>
    <p>{formatCurrency(summary.avg_transaction_value || 0)}</p>
  </div>
  <div className="bg-white p-4 rounded-lg">
    <h3>Unique Users</h3>
    <p>{summary.unique_users || 0}</p>
  </div>
</div>
```

3. **Update Table:**

```jsx
{
  transactions.map((tx) => (
    <tr key={tx.transaction_id}>
      <td>{tx.transaction_id}</td>
      <td>
        {formatDate(tx.time_in)}
        <br />
        <span className="text-sm text-gray-500">{formatTime(tx.time_in)}</span>
      </td>
      <td>
        {tx.full_name}
        <br />
        <span className="text-sm">{tx.email}</span>
      </td>
      <td>{tx.location_name}</td>
      <td>{tx.duration_hours}h</td>
      <td>{formatCurrency(tx.total_fee)}</td>
      <td>
        <span
          className={
            tx.payment_status === "completed"
              ? "badge-green"
              : tx.payment_status === "pending"
              ? "badge-yellow"
              : "badge-red"
          }
        >
          {tx.payment_status}
        </span>
      </td>
    </tr>
  ));
}
```

**Backend Endpoints:**

- `GET /api/admin/transactions?page=1&limit=10` - List with filters
- `GET /api/admin/transactions/:id` - Get details
- `GET /api/admin/transactions/stats/summary` - Get summary stats

---

## 🔄 TODO: AdminReports.jsx

**Mock Data to Remove:**

```javascript
const usageData = [
  /* hardcoded */
];
const revenueData = [
  /* hardcoded */
];
const locationData = [
  /* hardcoded */
];
const hourlyData = [
  /* hardcoded */
];
```

**Required Changes:**

1. **Add API Integration (reuse existing endpoints):**

```javascript
import {
  fetchDashboardChart,
  fetchTransactionsSummary,
  fetchLocations,
} from "../utils/api";

const [usageData, setUsageData] = useState([]);
const [summary, setSummary] = useState({});

useEffect(() => {
  loadReportData();
}, [reportType, timeRange]);

const loadReportData = async () => {
  try {
    if (reportType === "usage") {
      const chartResult = await fetchDashboardChart();
      setUsageData(chartResult.data);
    }
    const summaryResult = await fetchTransactionsSummary();
    setSummary(summaryResult.data);
  } catch (error) {
    console.error("Failed to load report data:", error);
  }
};
```

2. **Update Charts with Real Data:**

```jsx
<LineChart data={usageData}>
  <Line dataKey="occupied" stroke="#3B82F6" />
  <Line dataKey="available" stroke="#10B981" />
</LineChart>
```

**Note:** Reports primarily aggregate data from transactions and dashboard endpoints.

---

## 🔄 TODO: SensorMonitoringScreen.jsx

**Status:** ⚠️ No backend API available yet

**Placeholder Implementation:**

```javascript
const [sensors, setSensors] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // TODO: Replace with actual API when backend is ready
  // For now, show empty state or message
  setLoading(false);
}, []);

return (
  <div className="p-8 text-center">
    <Cpu size={64} className="text-gray-300 mx-auto mb-4" />
    <h3 className="text-xl font-medium text-gray-700 mb-2">
      Sensor Monitoring Coming Soon
    </h3>
    <p className="text-gray-500">
      Sensor API endpoints are not yet implemented on the backend. This feature
      will be available once the sensor management system is completed.
    </p>
  </div>
);
```

**Required Backend Endpoints (to be created):**

- `GET /api/admin/sensors` - List all sensors
- `GET /api/admin/sensors/:id` - Get sensor details
- `PUT /api/admin/sensors/:id` - Update sensor
- `POST /api/admin/sensors/:id/restart` - Restart sensor

---

## 🔄 TODO: AdminSystemConfig.jsx

**Status:** ⚠️ No backend API available yet

**Placeholder Implementation:**

```javascript
const [config, setConfig] = useState({});
const [isSaving, setIsSaving] = useState(false);

const handleSave = () => {
  alert(
    "System configuration API not yet implemented on backend. Changes are not persisted."
  );
};

return (
  <div>
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded mb-4">
      <strong>Note:</strong> System configuration API is not yet implemented.
      Changes made here will not be saved to the database.
    </div>

    {/* Keep existing UI but disable save functionality */}
    <button
      onClick={handleSave}
      disabled
      className="opacity-50 cursor-not-allowed"
    >
      Save Changes (Not Available)
    </button>
  </div>
);
```

**Required Backend Endpoints (to be created):**

- `GET /api/admin/config` - Get all configuration
- `PUT /api/admin/config` - Update configuration
- `POST /api/admin/backup` - Create backup
- `GET /api/admin/logs` - Get system logs

---

## Summary of Changes

### ✅ **Completed**

1. **AdminDashboard.jsx** - Fully integrated with backend APIs

### 📋 **Needs Update (APIs Available)**

2. **ParkingLocation.jsx** - CRUD operations ready
3. **AdminUserManagement.jsx** - CRUD operations ready
4. **TransactionsScreen.jsx** - Read operations ready
5. **AdminReports.jsx** - Can reuse existing endpoints

### ⚠️ **Needs Backend API First**

6. **SensorMonitoringScreen.jsx** - No API endpoints yet
7. **AdminSystemConfig.jsx** - No API endpoints yet

## Testing Checklist

After updating each component:

- [ ] Remove all hardcoded mock data arrays
- [ ] Add `useEffect` hook for data fetching on component mount
- [ ] Add loading states (`loading` state variable)
- [ ] Add error handling (try-catch blocks)
- [ ] Test Create operation (if applicable)
- [ ] Test Read/List operation
- [ ] Test Update operation (if applicable)
- [ ] Test Delete operation (if applicable)
- [ ] Verify pagination works correctly
- [ ] Verify filtering works correctly
- [ ] Test with actual database (ensure server is running)
- [ ] Check console for any errors
- [ ] Verify data displays correctly in UI

## Common Utilities

**Import the API utility:**

```javascript
import { fetchLocations, formatCurrency, formatDate } from "../utils/api";
```

**Standard loading pattern:**

```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await fetchSomeData();
    setData(result.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Standard rendering pattern:**

```jsx
{
  loading ? (
    <div>Loading...</div>
  ) : error ? (
    <div className="text-red-600">{error}</div>
  ) : data.length === 0 ? (
    <div>No data found</div>
  ) : (
    data.map((item) => <ItemComponent key={item.id} item={item} />)
  );
}
```
