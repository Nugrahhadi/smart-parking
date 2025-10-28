-- ============================================
-- PARKING SYSTEM DATABASE MIGRATION
-- Date: October 28, 2025
-- Purpose: Fix schema and ensure payment flow works
-- ============================================

USE parking_system;

-- ============================================
-- 1. ENSURE ALL TABLES HAVE CORRECT SCHEMA
-- ============================================

-- Fix users table (if needed)
ALTER TABLE users 
  MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT,
  MODIFY COLUMN name VARCHAR(100) NOT NULL,
  MODIFY COLUMN email VARCHAR(100) NOT NULL UNIQUE,
  MODIFY COLUMN password VARCHAR(255) NOT NULL,
  MODIFY COLUMN phone VARCHAR(20),
  MODIFY COLUMN role ENUM('admin', 'user') DEFAULT 'user';

-- Fix parking_locations table
ALTER TABLE parking_locations
  MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT;

-- Fix parking_spots table
ALTER TABLE parking_spots
  MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT;

-- Fix vehicles table
ALTER TABLE vehicles
  MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT;

-- Fix reservations table
ALTER TABLE reservations
  MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT,
  MODIFY COLUMN total_amount DECIMAL(10,2) NOT NULL;

-- ============================================
-- 2. ENSURE PAYMENTS TABLE EXISTS AND IS CORRECT
-- ============================================

-- Drop and recreate payments table to ensure schema is correct
DROP TABLE IF EXISTS payments;

CREATE TABLE payments (
  id INT(11) NOT NULL AUTO_INCREMENT,
  reservation_id INT(11) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'card', 'ewallet', 'bank_transfer') NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  payment_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reservation_id (reservation_id),
  CONSTRAINT fk_payments_reservation 
    FOREIGN KEY (reservation_id) 
    REFERENCES reservations(id) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Reservations indexes
ALTER TABLE reservations
  ADD INDEX IF NOT EXISTS idx_user_id (user_id),
  ADD INDEX IF NOT EXISTS idx_location_id (location_id),
  ADD INDEX IF NOT EXISTS idx_spot_id (spot_id),
  ADD INDEX IF NOT EXISTS idx_vehicle_id (vehicle_id),
  ADD INDEX IF NOT EXISTS idx_status (status),
  ADD INDEX IF NOT EXISTS idx_created_at (created_at);

-- Parking spots indexes
ALTER TABLE parking_spots
  ADD INDEX IF NOT EXISTS idx_location_id (location_id),
  ADD INDEX IF NOT EXISTS idx_status (status),
  ADD INDEX IF NOT EXISTS idx_zone_type (zone_type);

-- ============================================
-- 4. ADD FOREIGN KEY CONSTRAINTS (if not exists)
-- ============================================

-- Note: MySQL may reject if constraints already exist
-- We'll use ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS syntax

-- Check if foreign keys exist, add if they don't
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = 'parking_system' 
    AND TABLE_NAME = 'reservations' 
    AND CONSTRAINT_NAME = 'fk_reservations_user'
);

SET @sql = IF(
  @constraint_exists = 0,
  'ALTER TABLE reservations ADD CONSTRAINT fk_reservations_user 
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
  'SELECT "FK fk_reservations_user already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 5. VERIFY DATA INTEGRITY
-- ============================================

-- Check for orphaned reservations (reservations without valid user)
SELECT 
  'Orphaned reservations (no user):' as check_type,
  COUNT(*) as count
FROM reservations r
LEFT JOIN users u ON r.user_id = u.id
WHERE u.id IS NULL;

-- Check for reservations without payment
SELECT 
  'Reservations without payment:' as check_type,
  COUNT(*) as count
FROM reservations r
LEFT JOIN payments p ON r.id = p.reservation_id
WHERE r.status IN ('active', 'completed') 
  AND p.id IS NULL;

-- ============================================
-- 6. UPDATE EXISTING DATA
-- ============================================

-- Update reservations that are 'pending' and have no payment
-- Keep them as pending so user can pay
UPDATE reservations 
SET status = 'pending'
WHERE status = 'active' 
  AND id NOT IN (SELECT reservation_id FROM payments);

-- ============================================
-- 7. CREATE SAMPLE PAYMENT FOR TESTING
-- ============================================

-- Insert sample payment for existing reservation (if any)
-- This is just for testing - delete if not needed
INSERT INTO payments (reservation_id, amount, payment_method, payment_status, transaction_id, payment_date)
SELECT 
  r.id,
  r.total_amount,
  'ewallet',
  'completed',
  CONCAT('TRX-MIGRATION-', r.id),
  NOW()
FROM reservations r
WHERE r.status = 'pending'
  AND r.id NOT IN (SELECT reservation_id FROM payments)
LIMIT 1;

-- Update that reservation to active
UPDATE reservations r
JOIN payments p ON r.id = p.reservation_id
SET r.status = 'active'
WHERE p.payment_status = 'completed'
  AND r.status = 'pending';

-- ============================================
-- 8. SHOW FINAL STATE
-- ============================================

SELECT '========== MIGRATION COMPLETE ==========' as status;

-- Show table structures
SELECT 
  'TABLES:' as info,
  TABLE_NAME,
  ENGINE,
  TABLE_ROWS,
  CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'parking_system'
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Show reservations with payment status
SELECT 
  'RESERVATIONS WITH PAYMENTS:' as info,
  r.id,
  r.user_id,
  r.status as reservation_status,
  r.total_amount,
  p.id as payment_id,
  p.payment_status,
  p.payment_method
FROM reservations r
LEFT JOIN payments p ON r.id = p.reservation_id
ORDER BY r.created_at DESC
LIMIT 10;

-- Show summary
SELECT 
  'SUMMARY:' as info,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM parking_locations) as total_locations,
  (SELECT COUNT(*) FROM parking_spots) as total_spots,
  (SELECT COUNT(*) FROM vehicles) as total_vehicles,
  (SELECT COUNT(*) FROM reservations) as total_reservations,
  (SELECT COUNT(*) FROM payments) as total_payments;

SELECT '========== READY TO USE ==========' as status;
