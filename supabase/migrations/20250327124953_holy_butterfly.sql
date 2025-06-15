/*
  # Update api_queries table structure

  1. Changes
    - Drop existing api_queries table
    - Recreate table with integer id column
    - Add necessary constraints and triggers
    - Enable RLS with appropriate policies

  2. Security
    - Maintain existing RLS policies
    - Allow public access for all operations
*/

-- Drop existing table and related objects
DROP TABLE IF EXISTS api_queries CASCADE;

-- Create new api_queries table with integer id
CREATE TABLE api_queries (
  id integer PRIMARY KEY,
  api_query text NOT NULL,
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
CREATE OR REPLACE FUNCTION update_api_queries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_queries_timestamp
  BEFORE UPDATE ON api_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_api_queries_timestamp();