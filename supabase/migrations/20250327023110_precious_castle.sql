/*
  # Add OpenAI API key column to api_requests table

  1. Changes
    - Add api_key column to api_requests table for OpenAI API key storage
    - Ensure column can store up to 200 characters
    - Maintain existing data and policies

  2. Security
    - Maintain existing RLS policies
*/

-- Add api_key column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_requests' AND column_name = 'api_key'
  ) THEN
    ALTER TABLE api_requests ADD COLUMN api_key text DEFAULT '';
  END IF;
END $$;

-- Ensure both configuration records exist
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES 
  (1, '', ''),  -- RapidAPI settings
  (2, '', '')   -- OpenAI API settings
ON CONFLICT (id) DO NOTHING;