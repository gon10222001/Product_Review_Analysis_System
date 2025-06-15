/*
  # Add OpenAI content field to api_requests table

  1. Changes
    - Add openai_content column to api_requests table
    - Set default value to empty string
    - Maintain existing data and policies

  2. Security
    - Maintain existing RLS policies
*/

-- Add openai_content column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_requests' AND column_name = 'openai_content'
  ) THEN
    ALTER TABLE api_requests ADD COLUMN openai_content text DEFAULT '';
  END IF;
END $$;

-- Ensure both configuration records exist with new column
INSERT INTO api_requests (id, api_keyword, api_key, openai_content)
VALUES 
  (1, '', '', ''),  -- RapidAPI settings
  (2, '', '', '')   -- OpenAI API settings
ON CONFLICT (id) DO NOTHING;