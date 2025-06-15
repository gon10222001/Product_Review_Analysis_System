/*
  # Fix API Settings RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified RLS policy for api_requests table
    - Enable RLS on table

  2. Security
    - Allow authenticated users to perform all operations on api_requests table
    - Simplified policy structure for better maintainability
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to select api_requests" ON api_requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert api_requests" ON api_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update api_requests" ON api_requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete api_requests" ON api_requests;

-- Create a single policy for all operations
CREATE POLICY "Enable all operations for authenticated users"
ON api_requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);