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
      - Insert/update api_requests
*/

-- Create api_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_requests (
  id bigint PRIMARY KEY,
  api_keyword text,
  api_key text
);

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Policy for viewing api_requests
CREATE POLICY "Enable read access for authenticated users"
  ON api_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for inserting/updating api_requests
CREATE POLICY "Enable insert/update for authenticated users"
  ON api_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);