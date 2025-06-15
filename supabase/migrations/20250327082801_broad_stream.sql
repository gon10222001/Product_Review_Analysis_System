/*
  # Create api_queries table and migrate data

  1. New Tables
    - `api_queries`
      - `id` (uuid, primary key)
      - `api_query` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Data Migration
    - Move data from api_requests.api_keyword to api_queries.api_query
    - Clear api_keyword column after migration

  3. Security
    - Enable RLS on api_queries table
    - Add policies for public access
*/

-- Create api_queries table
CREATE TABLE api_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_query text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_queries ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
CREATE POLICY "Enable full access for all users"
ON api_queries
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER api_queries_updated_at
  BEFORE UPDATE ON api_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Migrate existing data
INSERT INTO api_queries (api_query)
SELECT DISTINCT api_keyword
FROM api_requests
WHERE api_keyword IS NOT NULL AND api_keyword != '';

-- Clear api_keyword column
UPDATE api_requests
SET api_keyword = ''
WHERE api_keyword IS NOT NULL AND api_keyword != '';