/*
  # Fix API Settings RLS Policies

  1. Changes
    - Drop existing policies
    - Create new RLS policies for api_requests table
    - Add specific policy for id=1 record

  2. Security
    - Allow authenticated users to:
      - Read the configuration record (id=1)
      - Update the configuration record (id=1)
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "api_requests_policy" ON api_requests;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON api_requests;
DROP POLICY IF EXISTS "Authenticated users can view api_requests" ON api_requests;
DROP POLICY IF EXISTS "Authenticated users can insert/update api_requests" ON api_requests;

-- Create new policies
CREATE POLICY "api_requests_select_policy"
ON api_requests
FOR SELECT
TO authenticated
USING (id = 1);

CREATE POLICY "api_requests_update_policy"
ON api_requests
FOR UPDATE
TO authenticated
USING (id = 1)
WITH CHECK (id = 1);

-- Ensure the initial record exists
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;