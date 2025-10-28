-- ============================================
-- RESET ALL PARKING SPOTS TO AVAILABLE
-- Clear test data and make all spots ready
-- ============================================

USE parking_system;

-- 1. Delete all pending/test reservations
DELETE FROM payments WHERE reservation_id IN (
  SELECT id FROM reservations WHERE status = 'pending'
);

DELETE FROM reservations WHERE status = 'pending';

-- 2. Reset ALL parking spots to available
UPDATE parking_spots SET status = 'available';

-- 3. Update parking_locations available_spots count
UPDATE parking_locations pl
SET available_spots = (
  SELECT COUNT(*) 
  FROM parking_spots ps 
  WHERE ps.location_id = pl.id 
    AND ps.status = 'available'
);

-- 4. Show results
SELECT '========== RESET COMPLETE ==========' as status;

SELECT 
  'PARKING SPOTS STATUS:' as info,
  zone_type,
  status,
  COUNT(*) as count
FROM parking_spots
GROUP BY zone_type, status
ORDER BY zone_type, status;

SELECT 
  'LOCATIONS:' as info,
  id,
  name,
  total_spots,
  available_spots
FROM parking_locations;

SELECT 
  'ACTIVE RESERVATIONS:' as info,
  COUNT(*) as count
FROM reservations
WHERE status IN ('active', 'pending');

SELECT '========== ALL SPOTS NOW AVAILABLE ==========' as status;
