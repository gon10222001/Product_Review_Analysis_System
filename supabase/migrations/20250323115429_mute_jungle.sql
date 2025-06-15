/*
  # Fix RLS policies for api_requests table

  1. Changes
    - Drop existing policies
    - Create new RLS policies that allow:
      - Public read access
      - Authenticated users to update records
    - Ensure policies work for both RapidAPI and OpenAI settings

  2. Security
    - Allow read access to all users
    - Restrict write operations to authenticated users
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "api_requests_policy" ON api_requests;
DROP POLICY IF EXISTS "Enable full access for all users" ON api_requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "Allow authenticated users to manage api_requests" ON api_requests;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON api_requests FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON api_requests FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users"
ON api_requests FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure both records exist
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES 
  (1, '', ''),
  (2, '', '')
ON CONFLICT (id) DO NOTHING;