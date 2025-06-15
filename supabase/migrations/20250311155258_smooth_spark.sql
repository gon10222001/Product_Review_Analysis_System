/*
  # Fix RLS policies for api_requests table

  1. Security Changes
    - Drop existing policies to avoid conflicts
    - Create new policies that properly handle upsert operations
    - Ensure authenticated users can:
      - Read the configuration record (id=1)
      - Insert/update the configuration record (id=1)
      - Use upsert operations on the configuration record

  2. Important Notes
    - Policies are scoped to record with id=1 only
    - Upsert operations are now properly handled
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read api_requests" ON api_requests;
DROP POLICY IF EXISTS "Authenticated users can manage api_requests" ON api_requests;
DROP POLICY IF EXISTS "Authenticated users can insert/update api_requests" ON api_requests;

-- Create new policies with proper upsert support
CREATE POLICY "Allow authenticated users to read api_requests"
ON api_requests
FOR SELECT
TO authenticated
USING (id = 1);

CREATE POLICY "Allow authenticated users to insert api_requests"
ON api_requests
FOR INSERT
TO authenticated
WITH CHECK (id = 1);

CREATE POLICY "Allow authenticated users to update api_requests"
ON api_requests
FOR UPDATE
TO authenticated
USING (id = 1)
WITH CHECK (id = 1);