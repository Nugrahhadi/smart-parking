# 🔧 Server Crash Troubleshooting Guide

## 🐛 Issue: Server Stops After Reservation

### Symptoms:

- Node server crashes after creating reservation
- Frontend shows "ERR_CONNECTION_REFUSED"
- Terminal shows server stopped unexpectedly

### Root Causes Fixed:

#### 1. **Unhandled Errors in Zone-Based Search** ✅ FIXED

**Problem:** When `zone_type` is used and no spots available, error checking code used `undefined` spotId causing crash.

**Solution Applied:**

```javascript
// Before (CRASH):
if (spotResults.length === 0) {
  db.query(checkSpotExistsQuery, [endTime, startTime, finalSpotId, locationId]);
  // finalSpotId is undefined when using zone_type!
}

// After (SAFE):
if (spotResults.length === 0) {
  if (zone_type && !finalSpotId) {
    // Handle zone-based search failure gracefully
    return res.status(400).json({ message: "No spots available in zone" });
  }
  // Only check spotId if it exists
  db.query(checkSpotExistsQuery, [endTime, startTime, finalSpotId, locationId]);
}
```

#### 2. **No Global Error Handlers** ✅ FIXED

**Problem:** Uncaught exceptions and unhandled promise rejections crashed entire server.

**Solution Applied in `app.js`:**

```javascript
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  // Keep server running
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  // Keep server running
});
```

#### 3. **No Try-Catch in Route Handlers** ✅ FIXED

**Problem:** Any unexpected error in route logic crashed server.

**Solution Applied:**

```javascript
router.post("/", authenticateToken, (req, res) => {
  try {
    // All route logic here
  } catch (error) {
    console.error("❌ FATAL ERROR:", error);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
});
```

---

## 🚀 How to Restart Server Safely

### Windows PowerShell:

#### Option 1: Manual Restart

```powershell
# Stop server (Ctrl+C in terminal)
# Then restart:
cd C:\laragon\www\parking-system\Server
npm start
```

#### Option 2: Kill Process & Restart

```powershell
# Find Node process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Restart server
cd C:\laragon\www\parking-system\Server
npm start
```

#### Option 3: Using npm script (Recommended)

```powershell
# In Server directory
npm run dev  # If you have nodemon
# OR
npm start
```

---

## 🔍 Debugging Steps

### 1. Check Server Logs

Look for these error patterns in console:

**Zone Search Failed (Now Handled):**

```
❌ No available spots in zone: VIP Royal Zone
```

**Expected:** Returns 400 error to client, server keeps running

**Database Error (Now Handled):**

```
❌ Database error in my-reservations: Error: ...
```

**Expected:** Returns 500 error to client, server keeps running

**Uncaught Exception (Now Handled):**

```
❌ Uncaught Exception: Error: ...
Stack: ...
```

**Expected:** Logs error, server keeps running

### 2. Test API Endpoints

```powershell
# Test health check
curl http://localhost:5000/

# Test my-reservations (replace TOKEN)
curl http://localhost:5000/api/reservations/my-reservations `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Check Database Connection

```sql
-- In phpMyAdmin, verify:
SELECT * FROM reservations ORDER BY id DESC LIMIT 5;
SELECT * FROM parking_spots WHERE zone_type = 'VIP Royal Zone' LIMIT 5;
```

### 4. Frontend Console Logs

Open Browser DevTools → Console:

**Look for:**

```javascript
// Success pattern:
✅ All validations passed!
📥 SERVER: Reservation Response
📊 Status Code: 201

// Error pattern:
❌ Status Code: 400
message: "No parking spots available in the selected zone"
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "ERR_CONNECTION_REFUSED"

**Cause:** Server is not running or crashed

**Check:**

```powershell
# Is Node running?
Get-Process node

# Is port 5000 in use?
netstat -ano | findstr :5000
```

**Fix:**

```powershell
cd C:\laragon\www\parking-system\Server
npm start
```

### Issue 2: Server Crashes on Reservation

**Cause:** Database query error or validation issue

**Check Server Console for:**

```
❌ FATAL ERROR in reservation creation: ...
```

**Fix:**

1. Check if database migration ran:

```sql
DESCRIBE parking_spots;
-- Must have zone_type column
```

2. Check if sample data exists:

```sql
SELECT COUNT(*) FROM parking_spots WHERE location_id = 1;
-- Should be > 0
```

3. Restart with fresh logs:

```powershell
cd Server
npm start
```

### Issue 3: "No spots available" but spots exist in DB

**Cause:** Spots are marked as 'reserved' or time overlap

**Check:**

```sql
-- Check spot status
SELECT spot_number, status, zone_type
FROM parking_spots
WHERE zone_type = 'VIP Royal Zone';

-- Check existing reservations
SELECT r.*, ps.spot_number
FROM reservations r
JOIN parking_spots ps ON r.spot_id = ps.id
WHERE r.status IN ('active', 'pending')
AND ps.zone_type = 'VIP Royal Zone';
```

**Fix:**

```sql
-- Reset spot status (for testing only)
UPDATE parking_spots
SET status = 'available'
WHERE zone_type = 'VIP Royal Zone';

-- Clear old test reservations (for testing only)
DELETE FROM reservations
WHERE status = 'pending'
AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### Issue 4: Database Connection Lost

**Cause:** MySQL server stopped or too many connections

**Check:**

```powershell
# In Laragon Control Panel
# Check if MySQL is running (green icon)
```

**Fix:**

1. Start MySQL in Laragon
2. Restart Node server
3. Test connection:

```javascript
// Server console should show:
Connected to MySQL database
```

---

## 📊 Health Check Checklist

Before testing, verify:

- [ ] MySQL is running in Laragon
- [ ] Database `parking_system` exists
- [ ] Table `parking_spots` has `zone_type` column
- [ ] Sample spots inserted (118 spots across 6 zones)
- [ ] Node server running on port 5000
- [ ] Frontend running on port 5174
- [ ] No errors in server console
- [ ] Token authentication working

**Quick Verification Commands:**

```sql
-- Database check
USE parking_system;
SHOW TABLES;
DESCRIBE parking_spots;
SELECT zone_type, COUNT(*) FROM parking_spots GROUP BY zone_type;
```

```powershell
# Server check
cd Server
npm start
# Should see: "Server is running on port 5000"

# Frontend check
cd Client
npm run dev
# Should see: "Local: http://localhost:5174/"
```

---

## 🔄 Automatic Restart (Recommended)

### Install nodemon for auto-restart:

```powershell
cd C:\laragon\www\parking-system\Server
npm install --save-dev nodemon
```

### Update package.json:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

### Use dev mode:

```powershell
npm run dev
```

**Benefits:**

- Auto-restarts on file changes
- No manual restart needed
- Faster development

---

## 📝 Error Log Locations

**Server Errors:**

- Console output in terminal where `npm start` was run
- Check for red text with "❌" prefix

**Frontend Errors:**

- Browser DevTools → Console (F12)
- Network tab shows failed requests

**Database Errors:**

- Server console shows SQL errors
- phpMyAdmin error messages

---

## 🎯 Expected Console Output (Success)

### Server Console:

```
Server is running on port 5000
Connected to MySQL database

📥 SERVER: Received Reservation Request
👤 User ID: 1
   zone_type: VIP Royal Zone

🔍 STEP 4: Checking spot availability...
🔍 Searching by ZONE TYPE: VIP Royal Zone
✅ Spot is available!
📍 Assigned spot:
   Spot ID: 1
   Spot Number: A01
   Zone Type: VIP Royal Zone

✅ Reservation created successfully!
   Reservation ID: 5
```

### Frontend Console:

```
📤 CLIENT: Sending Reservation Request
✅ All validations passed!

📥 SERVER: Reservation Response
📊 Status Code: 201
✅ Reservation created!
```

---

## 🆘 Still Having Issues?

1. **Clear all reservations and reset:**

```sql
DELETE FROM reservations WHERE status = 'pending';
UPDATE parking_spots SET status = 'available';
```

2. **Check for port conflicts:**

```powershell
netstat -ano | findstr :5000
# If something else is using port 5000, change PORT in .env
```

3. **Reinstall dependencies:**

```powershell
cd Server
rm -rf node_modules
npm install
npm start
```

4. **Check Node.js version:**

```powershell
node --version
# Should be v14+ or higher
```

---

**Last Updated:** October 11, 2025  
**Related Docs:**

- `ZONE_BASED_RESERVATION_GUIDE.md`
- `QUICK_START_ZONE_SYSTEM.md`
