/*
  # Update API settings tables

  1. Changes
    - Drop NOT NULL constraint from api_keyword column
    - Create api_queries table
    - Migrate data from api_requests to api_queries
    - Set up RLS and triggers

  2. Security
    - Enable RLS on api_queries table
    - Allow full access to all users
*/

-- Drop NOT NULL constraint from api_keyword column
ALTER TABLE api_requests 
  ALTER COLUMN api_keyword DROP NOT NULL;

-- Set default value to empty string
ALTER TABLE api_requests 
  ALTER COLUMN api_keyword SET DEFAULT '';

-- Update any null values to empty string
UPDATE api_requests 
SET api_keyword = ''
WHERE api_keyword IS NULL;

-- Create api_queries table if not exists
CREATE TABLE IF NOT EXISTS api_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_query text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_queries ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Enable full access for all users" ON api_queries;

-- Create policy for full access
CREATE POLICY "Enable full access for all users"
ON api_queries
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_api_queries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_api_queries_timestamp ON api_queries;

-- Create trigger
CREATE TRIGGER update_api_queries_timestamp
  BEFORE UPDATE ON api_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_api_queries_timestamp();

-- Migrate existing data
INSERT INTO api_queries (api_query)
SELECT DISTINCT api_keyword
FROM api_requests
WHERE api_keyword IS NOT NULL AND api_keyword != ''
ON CONFLICT DO NOTHING;

-- Clear api_keyword column
UPDATE api_requests
SET api_keyword = ''
WHERE api_keyword IS NOT NULL AND api_keyword != '';