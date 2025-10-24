-- Migration: Add zone_type column to parking_spots table
-- Date: 2025-10-11
-- Purpose: Support parking zone categorization (VIP, Entertainment, Shopping, etc.)

-- ============================================
-- STEP 1: ADD zone_type COLUMN
-- ============================================
ALTER TABLE parking_spots
ADD COLUMN zone_type ENUM(
  'VIP Royal Zone',
  'Entertainment District',
  'Shopping Paradise',
  'Culinary Heaven',
  'Electric Vehicle Station',
  'Regular Parking'
) DEFAULT 'Regular Parking' AFTER status;

-- ============================================
-- STEP 2: SAMPLE DATA FOR CENTRAL MALL PARKING (location_id = 1)
-- ============================================
-- Clear existing sample spots (optional - comment out if you want to keep existing data)
-- DELETE FROM parking_spots WHERE location_id = 1;

-- VIP Royal Zone (Spots A01-A15)
INSERT INTO parking_spots (location_id, spot_number, status, zone_type) VALUES
(1, 'A01', 'available', 'VIP Royal Zone'),
(1, 'A02', 'available', 'VIP Royal Zone'),
(1, 'A03', 'available', 'VIP Royal Zone'),
(1, 'A04', 'available', 'VIP Royal Zone'),
(1, 'A05', 'available', 'VIP Royal Zone'),
(1, 'A06', 'available', 'VIP Royal Zone'),
(1, 'A07', 'available', 'VIP Royal Zone'),
(1, 'A08', 'available', 'VIP Royal Zone'),
(1, 'A09', 'available', 'VIP Royal Zone'),
(1, 'A10', 'available', 'VIP Royal Zone'),
(1, 'A11', 'available', 'VIP Royal Zone'),
(1, 'A12', 'available', 'VIP Royal Zone'),
(1, 'A13', 'available', 'VIP Royal Zone'),
(1, 'A14', 'available', 'VIP Royal Zone'),
(1, 'A15', 'available', 'VIP Royal Zone');

-- Entertainment District (Spots B01-B20)
INSERT INTO parking_spots (location_id, spot_number, status, zone_type) VALUES
(1, 'B01', 'available', 'Entertainment District'),
(1, 'B02', 'available', 'Entertainment District'),
(1, 'B03', 'available', 'Entertainment District'),
(1, 'B04', 'available', 'Entertainment District'),
(1, 'B05', 'available', 'Entertainment District'),
(1, 'B06', 'available', 'Entertainment District'),
(1, 'B07', 'available', 'Entertainment District'),
(1, 'B08', 'available', 'Entertainment District'),
(1, 'B09', 'available', 'Entertainment District'),
(1, 'B10', 'available', 'Entertainment District'),
(1, 'B11', 'available', 'Entertainment District'),
(1, 'B12', 'available', 'Entertainment District'),
(1, 'B13', 'available', 'Entertainment District'),
(1, 'B14', 'available', 'Entertainment District'),
(1, 'B15', 'available', 'Entertainment District'),
(1, 'B16', 'available', 'Entertainment District'),
(1, 'B17', 'available', 'Entertainment District'),
(1, 'B18', 'available', 'Entertainment District'),
(1, 'B19', 'available', 'Entertainment District'),
(1, 'B20', 'available', 'Entertainment District');

-- Shopping Paradise (Spots C01-C25)
INSERT INTO parking_spots (location_id, spot_number, status, zone_type) VALUES
(1, 'C01', 'available', 'Shopping Paradise'),
(1, 'C02', 'available', 'Shopping Paradise'),
(1, 'C03', 'available', 'Shopping Paradise'),
(1, 'C04', 'available', 'Shopping Paradise'),
(1, 'C05', 'available', 'Shopping Paradise'),
(1, 'C06', 'available', 'Shopping Paradise'),
(1, 'C07', 'available', 'Shopping Paradise'),
(1, 'C08', 'available', 'Shopping Paradise'),
(1, 'C09', 'available', 'Shopping Paradise'),
(1, 'C10', 'available', 'Shopping Paradise'),
(1, 'C11', 'available', 'Shopping Paradise'),
(1, 'C12', 'available', 'Shopping Paradise'),
(1, 'C13', 'available', 'Shopping Paradise'),
(1, 'C14', 'available', 'Shopping Paradise'),
(1, 'C15', 'available', 'Shopping Paradise'),
(1, 'C16', 'available', 'Shopping Paradise'),
(1, 'C17', 'available', 'Shopping Paradise'),
(1, 'C18', 'available', 'Shopping Paradise'),
(1, 'C19', 'available', 'Shopping Paradise'),
(1, 'C20', 'available', 'Shopping Paradise'),
(1, 'C21', 'available', 'Shopping Paradise'),
(1, 'C22', 'available', 'Shopping Paradise'),
(1, 'C23', 'available', 'Shopping Paradise'),
(1, 'C24', 'available', 'Shopping Paradise'),
(1, 'C25', 'available', 'Shopping Paradise');

-- Culinary Heaven (Spots D01-D18)
INSERT INTO parking_spots (location_id, spot_number, status, zone_type) VALUES
(1, 'D01', 'available', 'Culinary Heaven'),
(1, 'D02', 'available', 'Culinary Heaven'),
(1, 'D03', 'available', 'Culinary Heaven'),
(1, 'D04', 'available', 'Culinary Heaven'),
(1, 'D05', 'available', 'Culinary Heaven'),
(1, 'D06', 'available', 'Culinary Heaven'),
(1, 'D07', 'available', 'Culinary Heaven'),
(1, 'D08', 'available', 'Culinary Heaven'),
(1, 'D09', 'available', 'Culinary Heaven'),
(1, 'D10', 'available', 'Culinary Heaven'),
(1, 'D11', 'available', 'Culinary Heaven'),
(1, 'D12', 'available', 'Culinary Heaven'),
(1, 'D13', 'available', 'Culinary Heaven'),
(1, 'D14', 'available', 'Culinary Heaven'),
(1, 'D15', 'available', 'Culinary Heaven'),
(1, 'D16', 'available', 'Culinary Heaven'),
(1, 'D17', 'available', 'Culinary Heaven'),
(1, 'D18', 'available', 'Culinary Heaven');

-- Electric Vehicle Station (Spots E01-E10)
INSERT INTO parking_spots (location_id, spot_number, status, zone_type) VALUES
(1, 'E01', 'available', 'Electric Vehicle Station'),
(1, 'E02', 'available', 'Electric Vehicle Station'),
(1, 'E03', 'available', 'Electric Vehicle Station'),
(1, 'E04', 'available', 'Electric Vehicle Station'),
(1, 'E05', 'available', 'Electric Vehicle Station'),
(1, 'E06', 'available', 'Electric Vehicle Station'),
(1, 'E07', 'available', 'Electric Vehicle Station'),
(1, 'E08', 'available', 'Electric Vehicle Station'),
(1, 'E09', 'available', 'Electric Vehicle Station'),
(1, 'E10', 'available', 'Electric Vehicle Station');

-- Regular Parking (Spots F01-F30)
INSERT INTO parking_spots (location_id, spot_number, status, zone_type) VALUES
(1, 'F01', 'available', 'Regular Parking'),
(1, 'F02', 'available', 'Regular Parking'),
(1, 'F03', 'available', 'Regular Parking'),
(1, 'F04', 'available', 'Regular Parking'),
(1, 'F05', 'available', 'Regular Parking'),
(1, 'F06', 'available', 'Regular Parking'),
(1, 'F07', 'available', 'Regular Parking'),
(1, 'F08', 'available', 'Regular Parking'),
(1, 'F09', 'available', 'Regular Parking'),
(1, 'F10', 'available', 'Regular Parking'),
(1, 'F11', 'available', 'Regular Parking'),
(1, 'F12', 'available', 'Regular Parking'),
(1, 'F13', 'available', 'Regular Parking'),
(1, 'F14', 'available', 'Regular Parking'),
(1, 'F15', 'available', 'Regular Parking'),
(1, 'F16', 'available', 'Regular Parking'),
(1, 'F17', 'available', 'Regular Parking'),
(1, 'F18', 'available', 'Regular Parking'),
(1, 'F19', 'available', 'Regular Parking'),
(1, 'F20', 'available', 'Regular Parking'),
(1, 'F21', 'available', 'Regular Parking'),
(1, 'F22', 'available', 'Regular Parking'),
(1, 'F23', 'available', 'Regular Parking'),
(1, 'F24', 'available', 'Regular Parking'),
(1, 'F25', 'available', 'Regular Parking'),
(1, 'F26', 'available', 'Regular Parking'),
(1, 'F27', 'available', 'Regular Parking'),
(1, 'F28', 'available', 'Regular Parking'),
(1, 'F29', 'available', 'Regular Parking'),
(1, 'F30', 'available', 'Regular Parking');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
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
-- TOTAL: 118 spots

-- View all zones with their spots
SELECT id, spot_number, zone_type, status 
FROM parking_spots 
WHERE location_id = 1 
ORDER BY zone_type, spot_number;
