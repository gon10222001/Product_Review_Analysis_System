/*
  # Update api_requests table for OpenAI API settings

  1. Changes
    - Add OpenAI API settings record (id=2)
    - Enable RLS with full access
    - Ensure both RapidAPI and OpenAI settings exist

  2. Security
    - Allow all operations through RLS
    - Maintain existing data
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "api_requests_full_access" ON api_requests;
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