/*
  # Update price column to support 8 digits

  1. Changes
    - Modify prd_price column to support values up to 99,999,999
    - Update valid_price constraint to match new range
    - Maintain existing data

  2. Notes
    - Price values must remain non-negative
    - Existing constraint is dropped and recreated
*/

-- Drop existing constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_price;

-- Modify price column to support 8 digits
ALTER TABLE products ALTER COLUMN prd_price TYPE integer;

-- Add new constraint for 8-digit price
ALTER TABLE products ADD CONSTRAINT valid_price CHECK (prd_price >= 0 AND prd_price <= 99999999);