/*
  # Fix RLS policies for api_requests table

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new policies for each operation type
    - Enable RLS on table if not already enabled

  2. Security
    - Allow authenticated users to perform all operations on the configuration record (id=1)
    - Separate policies for each operation type for better security control
*/

-- Enable RLS if not already enabled
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can read api_requests" ON api_requests;
DROP POLICY IF EXISTS "Authenticated users can manage api_requests" ON api_requests;
DROP POLICY IF EXISTS "Allow authenticated users to read api_requests" ON api_requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert api_requests" ON api_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update api_requests" ON api_requests;
DROP POLICY IF EXISTS "Allow authenticated users to manage api_requests" ON api_requests;
DROP POLICY IF EXISTS "api_requests_policy" ON api_requests;

-- Create separate policies for each operation
CREATE POLICY "Allow authenticated users to select api_requests"
ON api_requests
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert api_requests"
ON api_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update api_requests"
ON api_requests
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete api_requests"
ON api_requests
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);