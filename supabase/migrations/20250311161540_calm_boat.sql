/*
  # Create and configure api_requests table

  1. New Tables
    - `api_requests`
      - `id` (bigint, primary key)
      - `api_keyword` (text)
      - `api_key` (text)

  2. Security
    - Enable RLS on `api_requests` table
    - Add policies for authenticated users to:
      - View api_requests
      - Update api_requests where id = 1
      - Insert api_requests where id = 1
*/

-- Create api_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_requests (
  id bigint PRIMARY KEY,
  api_keyword text,
  api_key text
);

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON api_requests;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON api_requests;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON api_requests;
END $$;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON api_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for authenticated users"
  ON api_requests
  FOR UPDATE
  TO authenticated
  USING (id = 1)
  WITH CHECK (id = 1);

CREATE POLICY "Enable insert for authenticated users"
  ON api_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (id = 1);

-- Insert initial record with id=1
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;