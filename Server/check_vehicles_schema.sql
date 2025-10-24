-- Check vehicles table structure
DESCRIBE vehicles;

-- Check if vehicle_name column exists
SHOW COLUMNS FROM vehicles LIKE 'vehicle_name';

-- Check if is_default column exists
SHOW COLUMNS FROM vehicles LIKE 'is_default';

-- If columns don't exist, add them
ALTER TABLE vehicles 
  ADD COLUMN IF NOT EXISTS vehicle_name VARCHAR(255) DEFAULT NULL;

ALTER TABLE vehicles 
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Update existing records
UPDATE vehicles 
SET vehicle_name = CONCAT(COALESCE(brand, 'My'), ' ', COALESCE(model, 'Vehicle'))
WHERE vehicle_name IS NULL OR vehicle_name = '';

-- Verify table structure
DESCRIBE vehicles;

-- Show sample data
SELECT * FROM vehicles LIMIT 5;
