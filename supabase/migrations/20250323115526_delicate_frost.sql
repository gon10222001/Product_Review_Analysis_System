/*
  # Fix RLS policies for api_requests table

  1. Changes
    - Drop existing policies
    - Create new simplified RLS policies
    - Ensure both RapidAPI and OpenAI API records exist

  2. Security
    - Allow public read access
    - Allow authenticated users to update records
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "api_requests_policy" ON api_requests;
DROP POLICY IF EXISTS "Enable full access for all users" ON api_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON api_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON api_requests;

-- Create new simplified policies
CREATE POLICY "Enable read access for all users"
ON api_requests FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON api_requests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure both records exist
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES 
  (1, '', ''),
  (2, '', '')
ON CONFLICT (id) DO NOTHING;