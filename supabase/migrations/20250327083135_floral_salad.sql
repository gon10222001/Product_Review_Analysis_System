/*
  # Fix api_requests table constraints

  1. Changes
    - Drop NOT NULL constraint from api_keyword column
    - Set default value to empty string
    - Update existing records to use empty string instead of null

  2. Security
    - Maintain existing RLS policies
*/

-- Modify api_keyword column to allow null values temporarily
ALTER TABLE api_requests 
  ALTER COLUMN api_keyword DROP NOT NULL;

-- Set default value to empty string
ALTER TABLE api_requests 
  ALTER COLUMN api_keyword SET DEFAULT '';

-- Update any null values to empty string
UPDATE api_requests 
SET api_keyword = ''
WHERE api_keyword IS NULL;

-- Ensure both configuration records exist with non-null values
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES 
  (1, '', ''),  -- RapidAPI settings
  (2, '', '')   -- OpenAI API settings
ON CONFLICT (id) DO UPDATE 
SET api_keyword = '';