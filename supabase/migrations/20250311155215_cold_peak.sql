/*
  # Fix RLS policies for api_requests table

  1. Security Changes
    - Enable RLS on `api_requests` table
    - Drop existing policies to avoid conflicts
    - Add policies for authenticated users to:
      - Read api_requests data
      - Insert/update api_requests data with id=1
    
  2. Important Notes
    - Policies are restricted to only allow operations on the record with id=1
    - This ensures only one configuration record can exist
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop read policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'api_requests' 
    AND policyname = 'Authenticated users can read api_requests'
  ) THEN
    DROP POLICY "Authenticated users can read api_requests" ON api_requests;
  END IF;

  -- Drop manage policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'api_requests' 
    AND policyname = 'Authenticated users can manage api_requests'
  ) THEN
    DROP POLICY "Authenticated users can manage api_requests" ON api_requests;
  END IF;
END $$;

-- Create new policies
CREATE POLICY "Authenticated users can read api_requests"
ON api_requests
FOR SELECT
TO authenticated
USING (id = 1);

CREATE POLICY "Authenticated users can manage api_requests"
ON api_requests
FOR ALL
TO authenticated
USING (id = 1)
WITH CHECK (id = 1);