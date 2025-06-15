/*
  # Add constraint and index for product order column

  1. Changes
    - Add constraint for non-negative values if not exists
    - Add index for efficient ordering if not exists

  2. Security
    - Maintain existing RLS policies
*/

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