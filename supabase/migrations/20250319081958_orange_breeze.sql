/*
  # Fix product order handling

  1. Changes
    - Add prd_order column if it doesn't exist
    - Add constraint for non-negative order values
    - Create index on prd_order column
    - Update existing records to have sequential order numbers

  2. Notes
    - Order numbers start from 1
    - NULL values are handled last in ordering
*/

-- Add prd_order column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'prd_order'
  ) THEN
    ALTER TABLE products ADD COLUMN prd_order integer;
  END IF;
END $$;

-- Add constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'valid_order'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT valid_order CHECK (prd_order >= 0);
  END IF;
END $$;

-- Create index if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_products_order'
  ) THEN
    CREATE INDEX idx_products_order ON products (prd_order);
  END IF;
END $$;

-- Update existing records to have sequential order numbers
WITH numbered_products AS (
  SELECT 
    prd_id,
    ROW_NUMBER() OVER (ORDER BY prd_crt_ts) as new_order
  FROM products
)
UPDATE products p
SET prd_order = np.new_order
FROM numbered_products np
WHERE p.prd_id = np.prd_id
  AND (p.prd_order IS NULL OR p.prd_order = 0);