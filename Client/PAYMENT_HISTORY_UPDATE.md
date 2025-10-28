# 💳 Payment History - Frontend Update

## 📋 Summary

**File:** `Client/src/mobile/PaymentTab.jsx`

Payment History tab sudah diupdate untuk **mengambil data real dari database** melalui API `/api/payments/history` instead of dummy data.

## ✅ Changes Made

### 1. Remove Dummy Data

**Before:**

```javascript
// Mock transaction history
const transactions = [
  { id: 1, location: 'Central Mall Parking', ... },
  { id: 2, location: 'City Plaza Parking', ... },
  { id: 3, location: 'Station Parking', ... }
];
```

**After:**

```javascript
const [transactions, setTransactions] = useState([]);
// Data fetched from API: GET /api/payments/history
```

### 2. Add API Integration

**New Imports:**

```javascript
import { useEffect, useCallback } from "react";
import api from "../services/api";
```

**New States:**

```javascript
const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**Fetch Function:**

```javascript
const fetchPaymentHistory = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await api.get("/payments/history");

    if (response.data && response.data.payments) {
      // Transform API data to UI format
      const formattedTransactions = response.data.payments.map((payment) => ({
        id: payment.id,
        location: payment.location_name,
        date: formatDate(payment.payment_date),
        time: formatTimeRange(payment.start_time, payment.end_time),
        amount: formatCurrency(payment.amount),
        status: payment.payment_status,
        method: payment.payment_method,
        transaction_id: payment.transaction_id,
        vehicle: payment.license_plate,
        // ... more fields
      }));

      setTransactions(formattedTransactions);
    }
  } catch (err) {
    setError("Failed to load payment history");
  } finally {
    setLoading(false);
  }
}, []);
```

**Auto-Fetch on Tab Switch:**

```javascript
useEffect(() => {
  if (activeSection === "history") {
    fetchPaymentHistory();
  }
}, [activeSection, fetchPaymentHistory]);
```

### 3. Add Helper Functions

**Format Date:**

```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
// Example: "Oct 28, 2025"
```

**Format Time Range:**

```javascript
const formatTimeRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return `${formatTime(start)} - ${formatTime(end)}`;
};
// Example: "10:00 - 12:00"
```

**Format Currency:**

```javascript
const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount);
  return numAmount.toLocaleString("id-ID", { minimumFractionDigits: 0 });
};
// Example: "5.000" (Indonesian format)
```

### 4. Enhanced UI States

**Loading State:**

```jsx
{
  loading && (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 mt-2">Loading payment history...</p>
    </div>
  );
}
```

**Error State:**

```jsx
{
  error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <AlertCircle />
      <p>{error}</p>
      <button onClick={fetchPaymentHistory}>Try Again</button>
    </div>
  );
}
```

**Empty State:**

```jsx
{
  transactions.length === 0 && (
    <div className="text-center py-12">
      <Wallet size={48} className="text-gray-400" />
      <p>No Payment History</p>
    </div>
  );
}
```

**Data Display (Enhanced):**

```jsx
{
  transactions.map((transaction) => (
    <div key={transaction.id} className="bg-white rounded-lg p-4">
      {/* Location & Address */}
      <h3>{transaction.location}</h3>
      <p className="text-xs">{transaction.address}</p>

      {/* Date & Time */}
      <div>
        <Calendar /> {transaction.date}
      </div>
      <div>
        <Clock /> {transaction.time}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-2">
        <div>Vehicle: {transaction.vehicle}</div>
        <div>Payment: {transaction.method}</div>
        <div className="col-span-2">
          Transaction ID: {transaction.transaction_id}
        </div>
      </div>

      {/* Amount & Status */}
      <p>Rp {transaction.amount}</p>
      <div>
        <CheckCircle /> {transaction.status}
      </div>

      {/* Actions */}
      <button>Receipt</button>
      <button>Details</button>
    </div>
  ));
}
```

### 5. Refresh Button

```jsx
<button onClick={fetchPaymentHistory}>Refresh History</button>
```

## 📊 Data Mapping

### API Response → UI Component

| API Field          | UI Field         | Format              |
| ------------------ | ---------------- | ------------------- |
| `id`               | `id`             | Number              |
| `reservation_id`   | `reservation_id` | Number              |
| `location_name`    | `location`       | String              |
| `location_address` | `address`        | String              |
| `payment_date`     | `date`           | "Oct 28, 2025"      |
| `start_time`       | `time` (part 1)  | "10:00 - 12:00"     |
| `end_time`         | `time` (part 2)  | "10:00 - 12:00"     |
| `amount`           | `amount`         | "5.000" (formatted) |
| `payment_status`   | `status`         | "completed"         |
| `payment_method`   | `method`         | "ewallet"           |
| `transaction_id`   | `transaction_id` | "TRX-..."           |
| `license_plate`    | `vehicle`        | "R 5678 KC"         |
| `vehicle_type`     | `vehicleType`    | "Hatchback"         |
| `spot_number`      | `spotNumber`     | "R01"               |
| `zone_type`        | `zoneType`       | "Regular Parking"   |

## 🔄 User Flow

1. **User opens Payment tab**
2. **Click "Transaction History"** → `setActiveSection('history')`
3. **useEffect triggers** → `fetchPaymentHistory()`
4. **Show loading spinner** → `setLoading(true)`
5. **API Call:** `GET /api/payments/history`
6. **Transform data** → Format date, time, currency
7. **Update state** → `setTransactions(formatted)`
8. **Display transactions** → Show in UI
9. **User can refresh** → Click "Refresh History" button

## 🎯 Features

✅ **Real-time data** from database  
✅ **Auto-fetch** when switching to History tab  
✅ **Loading state** with spinner  
✅ **Error handling** with retry button  
✅ **Empty state** when no payments  
✅ **Rich data display:**

- Location name & address
- Date & time range
- Amount in IDR format
- Payment status & method
- Transaction ID
- Vehicle info
- Spot number & zone

✅ **Refresh button** to reload data  
✅ **Responsive design**  
✅ **No ESLint errors**

## 🧪 Testing

### Test Data Available

From test-payment-flow.html, ada 2 payments:

- Payment #1: Reservation #1 (sample data)
- Payment #2: Reservation #4 (user Arga's payment)

### Test Steps

1. **Start Backend Server**

   ```bash
   cd Server
   node app.js
   ```

2. **Start React App**

   ```bash
   cd Client
   npm run dev
   ```

3. **Test Payment History**
   - Login as: arga@gmail.com / Arga1234
   - Open SmartParkingApp
   - Click "Payments" tab (bottom navigation)
   - Click "Transaction History"
   - Should see payment data from database!

### Expected Result

```
💳 Transaction History

┌────────────────────────────────────┐
│ Central Mall Parking               │
│ Jl. Sudirman No. 123, Jakarta      │
│                                    │
│ 📅 Oct 28, 2025                    │
│ 🕐 10:01 - 11:01                   │
│                                    │
│ Vehicle: R 5678 KC                 │
│ Payment: Ewallet                   │
│ Transaction ID: TRX-1761645698233-4│
│                                    │
│              Rp 5.000   ✅ completed│
│                                    │
│ [Receipt]  [Details]               │
└────────────────────────────────────┘

[Refresh History]
```

## 🐛 Troubleshooting

### "Failed to load payment history"

**Cause:** Backend not running or authentication failed

**Solution:**

```bash
# 1. Check server running
cd Server
node app.js

# 2. Check login token exists
// Open DevTools → Application → LocalStorage
// Should have "token" key

# 3. Re-login if needed
```

### Empty payment list but data exists in DB

**Cause:** Data belongs to different user

**Solution:**

```sql
-- Check which user owns the payments
SELECT
  p.id,
  p.transaction_id,
  r.user_id,
  u.email
FROM payments p
JOIN reservations r ON p.reservation_id = r.id
JOIN users u ON r.user_id = u.id;

-- Login as that user in React app
```

### Date/Time showing wrong format

**Cause:** Timezone mismatch

**Solution:**

```javascript
// Already handled in formatDate() and formatTimeRange()
// Uses user's local timezone automatically
```

## 📝 Next Steps

1. ✅ Payment History updated - DONE
2. ⏳ Test in React app
3. ⏳ Implement Receipt download
4. ⏳ Implement Details modal
5. ⏳ Add filter by date range
6. ⏳ Add search by transaction ID

## 🔗 Related Files

- `Client/src/mobile/PaymentTab.jsx` - Updated component
- `Client/src/services/api.js` - API client
- `Server/routes/payment.js` - Backend API
- `Server/test-payment-flow.html` - Test page

---

**Last Updated:** October 28, 2025  
**Status:** ✅ Complete & Ready to Test  
**Author:** Smart Parking System Team
