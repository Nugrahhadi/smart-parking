# Zone-Based Parking Reservation System - Implementation Guide

## 📋 Overview

This guide documents the implementation of a **zone-based parking reservation system** that allows users to select a parking zone type (e.g., "VIP Royal Zone", "Electric Vehicle Station") and the backend automatically assigns an available spot from that zone.

---

## 🎯 Problem Solved

### Before:

- Frontend generated mock slot IDs (1, 2, 3...) that didn't match database records
- When users selected a zone, frontend sent non-existent spot IDs
- Backend couldn't find spots → "Parking spot not found" error
- No way to differentiate between zone types in database

### After:

- Database has `zone_type` column to categorize parking spots
- Frontend sends `zone_type` (e.g., "VIP Royal Zone") instead of specific `spotId`
- Backend searches for ANY available spot in that zone
- Backend assigns the first available spot automatically
- Returns assigned spot details to frontend

---

## 🗄️ Database Changes

### 1. Schema Update (`schema.sql`)

```sql
CREATE TABLE parking_spots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    spot_number VARCHAR(10) NOT NULL,
    status ENUM('available', 'occupied', 'reserved', 'maintenance') DEFAULT 'available',
    zone_type ENUM(
        'VIP Royal Zone',
        'Entertainment District',
        'Shopping Paradise',
        'Culinary Heaven',
        'Electric Vehicle Station',
        'Regular Parking'
    ) DEFAULT 'Regular Parking',  -- ✅ NEW COLUMN
    sensor_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES parking_locations(id) ON DELETE CASCADE
);
```

### 2. Migration for Existing Databases

Run this in **phpMyAdmin** or MySQL client:

```sql
-- Add zone_type column
ALTER TABLE parking_spots
ADD COLUMN zone_type ENUM(
  'VIP Royal Zone',
  'Entertainment District',
  'Shopping Paradise',
  'Culinary Heaven',
  'Electric Vehicle Station',
  'Regular Parking'
) DEFAULT 'Regular Parking' AFTER status;
```

### 3. Sample Data

See `Server/database/migrations/001_add_zone_type_to_parking_spots.sql` for complete INSERT statements.

Example:

```sql
-- VIP Royal Zone spots
INSERT INTO parking_spots (location_id, spot_number, status, zone_type) VALUES
(1, 'A01', 'available', 'VIP Royal Zone'),
(1, 'A02', 'available', 'VIP Royal Zone'),
(1, 'A03', 'available', 'VIP Royal Zone');

-- Entertainment District spots
INSERT INTO parking_spots (location_id, spot_number, status, zone_type) VALUES
(1, 'B01', 'available', 'Entertainment District'),
(1, 'B02', 'available', 'Entertainment District');
```

### 4. Verify Data

```sql
-- Check zone distribution
SELECT zone_type, COUNT(*) as total_spots
FROM parking_spots
WHERE location_id = 1
GROUP BY zone_type;

-- Expected output:
-- VIP Royal Zone: 15 spots
-- Entertainment District: 20 spots
-- Shopping Paradise: 25 spots
-- Culinary Heaven: 18 spots
-- Electric Vehicle Station: 10 spots
-- Regular Parking: 30 spots
```

---

## 🔧 Backend Changes (`Server/routes/reservation.js`)

### Key Modifications:

#### 1. Accept `zone_type` Parameter

```javascript
const {
  locationId,
  spotId,
  vehicleId,
  startTime,
  endTime,
  zone_type, // ✅ NEW: Zone type from frontend
  duration,
  totalPrice,
} = req.body;
```

#### 2. Updated Validation

```javascript
const requiredFields = {
  locationId: locationId,
  spotOrZone: spotId || slotId || zone_type, // ✅ Accept spotId OR zone_type
  vehicleId: vehicleId,
  startTime: startTime,
  endTime: endTime,
};
```

#### 3. Dynamic Query Logic

```javascript
if (zone_type && !finalSpotId) {
  // Search by zone_type - find ANY available spot in this zone
  console.log("🔍 Searching by ZONE TYPE:", zone_type);
  checkAvailabilityQuery = `
    SELECT ps.*, pl.price_per_hour
    FROM parking_spots ps
    JOIN parking_locations pl ON ps.location_id = pl.id
    WHERE ps.location_id = ? 
    AND ps.zone_type = ?
    AND ps.status = 'available'
    AND ps.id NOT IN (
      SELECT DISTINCT r.spot_id 
      FROM reservations r 
      WHERE r.spot_id IS NOT NULL 
      AND r.status IN ('active', 'pending')
      AND (r.start_time < ? AND r.end_time > ?)
    )
    LIMIT 1
  `;
  queryParams = [locationId, zone_type, endTime, startTime];
} else {
  // Original logic: Search by specific spotId
  // ... (existing code)
}
```

#### 4. Use Assigned Spot ID

```javascript
const spot = spotResults[0];
const assignedSpotId = spot.id; // ✅ Use the found spot's ID

console.log("📍 Assigned spot:");
console.log("   Spot ID:", assignedSpotId);
console.log("   Spot Number:", spot.spot_number);
console.log("   Zone Type:", spot.zone_type);
```

---

## 💻 Frontend Changes (`Client/src/mobile/ParkingReservationScreen.jsx`)

### Key Modifications:

#### 1. Send `zone_type` Instead of `spotId`

```javascript
const zone = mallZones[selectedSlot.zone];

const reservationData = {
  locationId: locationData.id,
  zone_type: zone.name, // ✅ Send "VIP Royal Zone", "Entertainment District", etc.
  vehicleId: selectedVehicle?.id || vehicles[0]?.id || null,
  startTime: formatDateTimeForMySQL(startTime),
  endTime: formatDateTimeForMySQL(endTime),
  totalPrice: totalPrice || 0,
  duration: duration,
  zone: selectedSlot.zone,
};
```

#### 2. Updated Validation

```javascript
const validation = {
  locationId:
    !!reservationData.locationId &&
    typeof reservationData.locationId === "number",
  zone_type:
    !!reservationData.zone_type &&
    typeof reservationData.zone_type === "string", // ✅ Validate zone_type
  vehicleId:
    reservationData.vehicleId !== null &&
    reservationData.vehicleId !== undefined,
  startTime:
    !!reservationData.startTime &&
    typeof reservationData.startTime === "string",
  endTime:
    !!reservationData.endTime && typeof reservationData.endTime === "string",
};
```

#### 3. Zone Name Mapping

```javascript
const mallZones = {
  vip: {
    name: "VIP Royal Zone", // ✅ Matches database ENUM value
    price: 25000,
    // ...
  },
  entertainment: {
    name: "Entertainment District", // ✅ Matches database ENUM value
    price: 15000,
    // ...
  },
  // ... other zones
};
```

---

## 🧪 Testing Guide

### Step 1: Run Database Migration

```sql
-- In phpMyAdmin, select database: parking_system
-- Execute:
SOURCE C:/laragon/www/parking-system/Server/database/migrations/001_add_zone_type_to_parking_spots.sql;
```

Or manually:

1. Open phpMyAdmin
2. Select `parking_system` database
3. Go to SQL tab
4. Paste ALTER TABLE and INSERT statements
5. Click "Go"

### Step 2: Verify Database Structure

```sql
-- Check if zone_type column exists
DESCRIBE parking_spots;

-- Expected output should include:
-- zone_type | enum('VIP Royal Zone','Entertainment District',...) | YES | | Regular Parking |
```

### Step 3: Verify Sample Data

```sql
-- Check zone distribution
SELECT zone_type, COUNT(*) as total,
       SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available_spots
FROM parking_spots
WHERE location_id = 1
GROUP BY zone_type;
```

### Step 4: Start Backend

```bash
cd Server
npm start
```

Expected console output:

```
Server running on port 5000
Connected to database
```

### Step 5: Start Frontend

```bash
cd Client
npm run dev
```

Expected:

```
VITE ready in 500 ms
Local: http://localhost:5174/
```

### Step 6: Test Reservation Flow

1. **Login** to the application
2. **Navigate** to parking location (e.g., Central Mall)
3. **Select a zone** (e.g., "VIP Royal Zone")
4. **Select vehicle** from dropdown
5. **Set duration** (e.g., 2 hours)
6. **Proceed to payment**
7. **Confirm reservation**

### Step 7: Monitor Console Logs

#### Frontend Console (Browser DevTools):

```
📤 CLIENT: Sending Reservation Request
🎯 Endpoint: POST http://localhost:5000/api/reservations

1️⃣ Validating required fields...
🔍 Raw values before validation:
   locationId: 1 Type: number
   zone_type: VIP Royal Zone Type: string
   vehicleId: 1 Type: number
   startTime: 2025-10-11 14:30:00 Type: string
   endTime: 2025-10-11 16:30:00 Type: string

✅ All validations passed!
```

#### Backend Console:

```
📥 SERVER: Received Reservation Request
👤 User ID: 1
📋 Fields Received:
   zone_type: VIP Royal Zone

🔍 STEP 4: Checking spot availability...
🔍 Searching by ZONE TYPE: VIP Royal Zone
📝 Executing availability check query...

✅ Spot is available!
📍 Assigned spot:
   Spot ID: 1
   Spot Number: A01
   Zone Type: VIP Royal Zone
   Status: available

✅ Reservation created successfully!
   Reservation ID: 5
```

### Step 8: Verify Database

```sql
-- Check latest reservation
SELECT r.*, ps.spot_number, ps.zone_type
FROM reservations r
JOIN parking_spots ps ON r.spot_id = ps.id
ORDER BY r.id DESC
LIMIT 1;

-- Expected output:
-- spot_id: 1
-- spot_number: A01
-- zone_type: VIP Royal Zone
-- status: pending
```

---

## 🔍 Troubleshooting

### Issue 1: "Parking spot not found"

**Cause:** No spots available in selected zone

**Solution:**

```sql
-- Check if spots exist for zone
SELECT * FROM parking_spots
WHERE zone_type = 'VIP Royal Zone'
AND status = 'available';

-- If empty, insert spots or change status
UPDATE parking_spots
SET status = 'available'
WHERE zone_type = 'VIP Royal Zone'
LIMIT 5;
```

### Issue 2: "Missing required fields: ['spotOrZone']"

**Cause:** Frontend not sending `zone_type`

**Check:**

1. Console logs in browser
2. Verify `reservationData` has `zone_type` field
3. Check zone name matches database ENUM values exactly

### Issue 3: "Parking spot is not available for the selected time"

**Cause:** All spots in zone are reserved for that time

**Solution:**

```sql
-- Check conflicting reservations
SELECT r.*, ps.spot_number
FROM reservations r
JOIN parking_spots ps ON r.spot_id = ps.id
WHERE ps.zone_type = 'VIP Royal Zone'
AND r.status IN ('active', 'pending')
AND r.start_time < '2025-10-11 16:30:00'
AND r.end_time > '2025-10-11 14:30:00';

-- Clear old reservations (if testing)
DELETE FROM reservations
WHERE status = 'pending'
AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### Issue 4: Zone name mismatch

**Cause:** Frontend zone name doesn't match database ENUM

**Check mapping:**

```javascript
// Frontend (must match exactly)
const mallZones = {
  vip: { name: "VIP Royal Zone" }, // ✅ Correct
  vip: { name: "VIP Zone" }, // ❌ Wrong - not in ENUM
};
```

```sql
-- Database ENUM values
SHOW COLUMNS FROM parking_spots LIKE 'zone_type';
```

---

## 📊 Expected Behavior

| Step | User Action                | Frontend                           | Backend                                   | Database                         |
| ---- | -------------------------- | ---------------------------------- | ----------------------------------------- | -------------------------------- |
| 1    | Select "VIP Royal Zone"    | Set selectedSlot.zone = "vip"      | -                                         | -                                |
| 2    | Click "Proceed to Payment" | Send zone_type: "VIP Royal Zone"   | Receive zone_type                         | -                                |
| 3    | Backend processes          | -                                  | Query: WHERE zone_type = "VIP Royal Zone" | Find first available spot        |
| 4    | Backend finds spot A01     | -                                  | assignedSpotId = 1                        | spot_id = 1, spot_number = "A01" |
| 5    | Create reservation         | -                                  | INSERT reservation                        | spot_id = 1, status = "pending"  |
| 6    | Update spot status         | -                                  | UPDATE spot status                        | status = "reserved"              |
| 7    | Return response            | Receive { spotNumber: "A01", ... } | Return success                            | -                                |

---

## 🎉 Success Criteria

✅ Database has `zone_type` column with correct ENUM values  
✅ Sample data inserted for all zones  
✅ Backend accepts `zone_type` parameter  
✅ Backend finds available spot by zone  
✅ Backend assigns spot automatically  
✅ Frontend sends zone name (not spotId)  
✅ Reservation created with correct spot_id  
✅ Spot status updated to "reserved"  
✅ Console logs show zone-based search  
✅ Success response includes assigned spot details

---

## 📝 API Contract

### Request (POST `/api/reservations`):

```json
{
  "locationId": 1,
  "zone_type": "VIP Royal Zone",
  "vehicleId": 1,
  "startTime": "2025-10-11 14:30:00",
  "endTime": "2025-10-11 16:30:00",
  "totalPrice": 50000,
  "duration": 2
}
```

### Response (Success - 201):

```json
{
  "message": "Reservation created successfully",
  "reservation": {
    "id": 5,
    "locationName": "Central Mall Parking",
    "spotNumber": "A01",
    "vehiclePlate": "B 1234 XYZ",
    "vehicleType": "car",
    "startTime": "2025-10-11T14:30:00.000Z",
    "endTime": "2025-10-11T16:30:00.000Z",
    "totalAmount": 50000,
    "status": "pending"
  }
}
```

### Response (Error - 400):

```json
{
  "message": "Parking spot is not available for the selected time",
  "details": {
    "spotExists": false,
    "requestedZone": "VIP Royal Zone",
    "requestedTime": {
      "start": "2025-10-11 14:30:00",
      "end": "2025-10-11 16:30:00"
    }
  },
  "hint": "No available spots in this zone for the selected time"
}
```

---

## 🔄 Migration Path for Existing Data

If you have existing reservations without zone information:

```sql
-- Option 1: Update existing spots to zones based on spot_number pattern
UPDATE parking_spots
SET zone_type = CASE
  WHEN spot_number LIKE 'A%' THEN 'VIP Royal Zone'
  WHEN spot_number LIKE 'B%' THEN 'Entertainment District'
  WHEN spot_number LIKE 'C%' THEN 'Shopping Paradise'
  WHEN spot_number LIKE 'D%' THEN 'Culinary Heaven'
  WHEN spot_number LIKE 'E%' THEN 'Electric Vehicle Station'
  ELSE 'Regular Parking'
END
WHERE location_id = 1;

-- Option 2: Keep existing spots as "Regular Parking" (already default)
-- No action needed

-- Verify update
SELECT zone_type, COUNT(*) FROM parking_spots GROUP BY zone_type;
```

---

## 📚 Additional Resources

- **Schema File:** `Server/database/schema.sql`
- **Migration File:** `Server/database/migrations/001_add_zone_type_to_parking_spots.sql`
- **Backend Route:** `Server/routes/reservation.js`
- **Frontend Component:** `Client/src/mobile/ParkingReservationScreen.jsx`

---

**Last Updated:** October 11, 2025  
**Version:** 1.0.0
