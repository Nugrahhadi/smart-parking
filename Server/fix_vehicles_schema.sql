-- ========================================
-- STEP 1: PERIKSA SKEMA TABEL VEHICLES
-- ========================================

USE parking_system;

-- Lihat struktur tabel lengkap
DESCRIBE vehicles;

-- Lihat CREATE statement
SHOW CREATE TABLE vehicles\G

-- ========================================
-- STEP 2: PERBAIKI KOLOM VEHICLE_TYPE
-- ========================================

-- Ubah vehicle_type menjadi VARCHAR yang cukup panjang
ALTER TABLE vehicles 
  MODIFY vehicle_type VARCHAR(50) NOT NULL;

-- Atau jika ingin menggunakan ENUM (pilih salah satu):
-- ALTER TABLE vehicles 
--   MODIFY vehicle_type ENUM('Sedan','SUV','MPV','Hatchback','Motorcycle','sedan','suv','mpv','hatchback','motorcycle') NOT NULL;

-- ========================================
-- STEP 3: PERBAIKI KOLOM IS_DEFAULT
-- ========================================

-- Pastikan is_default adalah TINYINT(1) untuk boolean
ALTER TABLE vehicles 
  MODIFY is_default TINYINT(1) NOT NULL DEFAULT 0;

-- ========================================
-- STEP 4: VERIFIKASI PERUBAHAN
-- ========================================

DESCRIBE vehicles;

-- Cek data yang ada
SELECT * FROM vehicles LIMIT 5;

-- ========================================
-- STEP 5: CEK WARNINGS (jika ada error)
-- ========================================

SHOW WARNINGS;

-- ========================================
-- STEP 6: TEST INSERT MANUAL
-- ========================================

-- Test insert dengan data contoh (ganti user_id sesuai kebutuhan)
INSERT INTO vehicles 
  (user_id, vehicle_name, license_plate, vehicle_type, color, is_default, created_at)
VALUES 
  (1, 'Test Vehicle', 'TEST123', 'Sedan', 'Black', 0, NOW());

-- Cek hasilnya
SELECT * FROM vehicles WHERE license_plate = 'TEST123';

-- Hapus test data
DELETE FROM vehicles WHERE license_plate = 'TEST123';
