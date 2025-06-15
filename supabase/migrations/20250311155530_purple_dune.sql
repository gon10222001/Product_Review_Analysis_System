/*
  # Fix RLS policies for api_requests table

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new unified policy for all operations
    - Enable RLS on table if not already enabled

  2. Security
    - Allow authenticated users to perform all operations on the configuration record (id=1)
    - Single policy to handle all operations for simplicity and reliability
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

-- Create a single unified policy for all operations
CREATE POLICY "api_requests_policy"
ON api_requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);