/*
  # Add timestamp columns to api_requests table

  1. Changes
    - Add created_at and updated_at columns to api_requests table
    - Update stored procedure to not reference updated_at
*/

-- Add timestamp columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_requests' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE api_requests ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_requests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE api_requests ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;