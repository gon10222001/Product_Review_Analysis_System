/*
  # Add sales volume column to products table

  1. Changes
    - Add prd_sel_vol column to products table
    - Set default value to 0
    - Add constraint to ensure non-negative values

  2. Security
    - Maintain existing RLS policies
*/

-- Add sales volume column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'prd_sel_vol'
  ) THEN
    ALTER TABLE products ADD COLUMN prd_sel_vol integer DEFAULT 0;
    
    -- Add constraint for non-negative values
    ALTER TABLE products ADD CONSTRAINT valid_sales_volume CHECK (prd_sel_vol >= 0);
  END IF;
END $$;