# 🚀 QUICK REFERENCE - Debugging 400 & 500 Errors

## **IMMEDIATE ACTIONS**

### **1. Open Two Windows Side-by-Side:**

- **Left:** Browser Console (F12 → Console tab)
- **Right:** Backend Terminal (PowerShell running `node app.js`)

### **2. Current Status:**

✅ **Backend server restarted with debugging enabled**
✅ **Client-side logging added to both screens**
✅ **Server-side comprehensive error handling added**

---

## **WHAT TO DO NOW**

### **Test Reservation Creation:**

1. **Navigate to:** Parking Reservation screen
2. **Try to book:** Select spot → Click "Book Now"
3. **Watch BOTH consoles simultaneously**

#### **Frontend Console Will Show:**

```
📤 CLIENT: Sending Reservation Request
  🎯 Endpoint: POST http://localhost:5000/api/reservations
  📦 Payload: {...}
  📋 Payload fields: [table with all fields]
```

#### **Backend Terminal Will Show:**

```
📥 SERVER: Received Reservation Request
  👤 User ID: 1
  📦 Request Body: {...}
  📋 Fields Received: [table showing what was received]
```

#### **If 400 Error:**

```
❌ Validation Failed - Missing Required Fields: ['vehicleId']
Expected Fields: ["locationId", "spotId", "vehicleId", "startTime", "endTime"]
Received Fields: ["locationId", "slotId", "zone", "duration", ...]
```

**→ ACTION:** Add the missing field to client payload

---

### **Test Vehicle Creation:**

1. **Navigate to:** My Vehicles screen
2. **Click:** "Add Vehicle" button
3. **Fill form** and click "Save"
4. **Watch BOTH consoles**

#### **Frontend Console Will Show:**

```
📤 CLIENT: Adding New Vehicle
  📦 Payload: {
    "vehicle_name": "Toyota Camry",
    "license_plate": "B1234XYZ",
    "vehicle_type": "sedan",
    "color": "white"
  }
```

#### **Backend Terminal Will Show:**

```
📝 POST /api/vehicles - Request body: {...}
👤 User ID: 1
💾 Inserting vehicle: {...}
✅ Vehicle added successfully, ID: 5
```

#### **If 500 Error:**

```
❌ Database error inserting vehicle: Unknown column 'vehicle_name'
Error code: ER_BAD_FIELD_ERROR
SQL State: 42S02
```

**→ ACTION:** Run SQL to add missing column (see below)

---

## **COMMON FIXES**

### **Fix 1: Missing vehicleId (400 Error)**

**File:** `Client/src/mobile/ParkingReservationScreen.jsx`

**Find:**

```javascript
const reservationData = {
  locationId: locationData.id,
  slotId: selectedSlot.id,
  // ...
};
```

**Change to:**

```javascript
const reservationData = {
  locationId: locationData.id,
  spotId: selectedSlot.id, // Changed slotId → spotId
  vehicleId: selectedVehicle?.id || 1, // ✅ ADD THIS LINE
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
};
```

---

### **Fix 2: Missing vehicle_name Column (500 Error)**

**Open:** phpMyAdmin or HeidiSQL

**Run:**

```sql
USE parking_system;

ALTER TABLE vehicles
  ADD COLUMN vehicle_name VARCHAR(255) DEFAULT NULL;

ALTER TABLE vehicles
  ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
```

**Verify:**

```sql
DESCRIBE vehicles;
```

---

### **Fix 3: Duplicate License Plate (500 Error)**

**Option A:** Use different license plate

**Option B:** Delete existing vehicle

```sql
DELETE FROM vehicles
WHERE license_plate = 'B1234XYZ'
AND user_id = 1;
```

---

## **EMOJI LEGEND**

### **Frontend Console:**

- 📤 = Sending request to server
- 📥 = Received response from server
- 📦 = Data/payload
- 📋 = Field details
- 🎯 = Endpoint URL
- 🔑 = Authentication token
- ✅ = Success
- ❌ = Error

### **Backend Terminal:**

- 📥 = Received request from client
- 📝 = POST request logging
- 👤 = User authentication
- 💾 = Database operation
- 🔍 = Validation/checking
- ✅ = Success
- ❌ = Error with details

---

## **TROUBLESHOOTING FLOWCHART**

```
┌─────────────────────────┐
│   Try to create item    │
│  (reservation/vehicle)  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Check Frontend Console  │
│   for 📤 CLIENT logs    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Check Backend Terminal │
│   for 📥 SERVER logs    │
└────────────┬────────────┘
             │
             ▼
        ┌────┴────┐
        │ Success? │
        └────┬────┘
         Yes │ No
             │
    ┌────────┴────────┐
    ▼                 ▼
  ✅ DONE      ┌──────────────┐
               │ Error 400?   │
               │ Error 500?   │
               └──────┬───────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
  ┌──────────┐              ┌──────────────┐
  │ 400 Bad  │              │ 500 Internal │
  │ Request  │              │    Error     │
  └────┬─────┘              └──────┬───────┘
       │                           │
       ▼                           ▼
┌──────────────┐          ┌─────────────────┐
│ Check which  │          │ Check error code│
│ fields are   │          │ in backend log  │
│ missing      │          └────────┬────────┘
└──────┬───────┘                   │
       │              ┌─────────────┴──────────────┐
       ▼              ▼                            ▼
┌──────────────┐  ┌─────────────┐       ┌──────────────────┐
│ Add missing  │  │ER_BAD_FIELD?│       │  ER_DUP_ENTRY?   │
│ fields to    │  │ Add column  │       │  Change value or │
│ client code  │  │ to database │       │  delete existing │
└──────────────┘  └─────────────┘       └──────────────────┘
```

---

## **EXPECTED CONSOLE OUTPUT**

### **✅ SUCCESS - Reservation:**

**Frontend:**

```
📤 CLIENT: Sending Reservation Request
  📦 Payload: {locationId: 1, spotId: 'A-15', vehicleId: 1, ...}
📥 SERVER: Reservation Response
  📊 Status Code: 201
  ✅ Response OK: true
✅ Reservation created successfully!
```

**Backend:**

```
📥 SERVER: Received Reservation Request
  👤 User ID: 1
  📦 Request Body: {...}
🔍 Checking spot availability...
✅ Reservation created, ID: 42
```

---

### **✅ SUCCESS - Vehicle:**

**Frontend:**

```
📤 CLIENT: Adding New Vehicle
  📦 Payload: {vehicle_name: "Toyota Camry", ...}
📥 SERVER: Add Vehicle Response
  📊 Status Code: 201
  ✅ Response OK: true
✅ Vehicle added successfully!
```

**Backend:**

```
📝 POST /api/vehicles - Request body: {...}
👤 User ID: 1
💾 Inserting vehicle: {...}
✅ Vehicle added successfully, ID: 5
```

---

## **FILES TO CHECK IF ISSUES PERSIST**

1. **Frontend Payload:**

   - `Client/src/mobile/ParkingReservationScreen.jsx` (line ~455)
   - `Client/src/mobile/MyVehiclesScreen.jsx` (line ~63)

2. **Backend Validation:**

   - `Server/routes/reservation.js` (line ~33)
   - `Server/routes/vehicles.js` (line ~92)

3. **Database:**
   - phpMyAdmin → parking_system → Structure
   - Check tables: `reservations`, `vehicles`, `parking_spots`

---

## **HELP RESOURCES**

- 📚 **Full Guide:** `SYSTEMATIC_DEBUGGING_GUIDE.md`
- 🔧 **Backend Fixes:** `BACKEND_FIXES.md`
- 🐛 **Data Issues:** `DEBUGGING_GUIDE.md`

---

## **NEXT STEPS**

1. ✅ Backend already restarted
2. ✅ Refresh frontend (Ctrl+R)
3. ✅ Open browser console (F12)
4. ✅ Keep backend terminal visible
5. ✅ Test reservation creation
6. ✅ Test vehicle creation
7. ✅ Follow console logs
8. ✅ Apply fixes based on error messages
9. ✅ Repeat test

---

**Pro Tip:** Take a screenshot of BOTH consoles when you see an error and share it for faster debugging!

**Status:** ✅ Ready to test with comprehensive logging enabled!
