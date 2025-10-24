-- Update vehicles table structure to match frontend expectations

-- Check if columns exist and add them if they don't
ALTER TABLE vehicles 
  ADD COLUMN IF NOT EXISTS vehicle_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Update existing records to have vehicle_name if they don't have one
UPDATE vehicles 
SET vehicle_name = CONCAT(COALESCE(brand, 'My'), ' ', COALESCE(model, 'Vehicle'))
WHERE vehicle_name IS NULL OR vehicle_name = '';

-- Show updated table structure
DESCRIBE vehicles;