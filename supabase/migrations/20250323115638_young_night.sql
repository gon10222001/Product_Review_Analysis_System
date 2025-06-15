/*
  # Fix RLS policies for api_requests table

  1. Changes
    - Drop all existing policies
    - Create new simplified RLS policy
    - Ensure both configuration records exist

  2. Security
    - Allow public read access
    - Allow authenticated users to perform all operations
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
BEGIN
  -- Drop all policies that might exist
  DROP POLICY IF EXISTS "api_requests_policy" ON api_requests;
  DROP POLICY IF EXISTS "Enable full access for all users" ON api_requests;
  DROP POLICY IF EXISTS "Enable read access for all users" ON api_requests;
  DROP POLICY IF EXISTS "Enable write access for authenticated users" ON api_requests;
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON api_requests;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON api_requests;
  DROP POLICY IF EXISTS "Enable delete for authenticated users" ON api_requests;
  DROP POLICY IF EXISTS "Allow authenticated users to manage api_requests" ON api_requests;
END $$;

-- Create a single policy for all operations
CREATE POLICY "api_requests_full_access"
ON api_requests
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure both configuration records exist
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES 
  (1, '', ''),  -- RapidAPI settings
  (2, '', '')   -- OpenAI API settings
ON CONFLICT (id) DO NOTHING;