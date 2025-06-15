/*
  # Add platform field to products table

  1. Changes
    - Add platform field to products table if it doesn't exist
    - Ensure platform field has proper constraints
    - Handle existing constraint gracefully

  2. Security
    - Maintain existing constraints and validations
*/

DO $$ 
BEGIN
  -- Add platform column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'platform'
  ) THEN
    ALTER TABLE products ADD COLUMN platform text NOT NULL DEFAULT 'Amazon';
  END IF;

  -- Add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'valid_platform'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT valid_platform CHECK (platform IN ('Amazon', 'Youtube'));
  END IF;
END $$;