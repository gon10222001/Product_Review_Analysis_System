/*
  # Create API requests table

  1. New Tables
    - `api_requests`
      - `id` (integer, primary key)
      - `api_keyword` (text)
      - `api_key` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Initial Data
    - Insert default record with id=1
*/

-- Create api_requests table
CREATE TABLE IF NOT EXISTS api_requests (
  id integer PRIMARY KEY,
  api_keyword text NOT NULL DEFAULT '',
  api_key text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view api_requests"
  ON api_requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update api_requests"
  ON api_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial record
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;