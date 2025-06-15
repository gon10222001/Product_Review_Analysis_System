/*
  # Update OpenAI API key storage capacity

  1. Changes
    - Modify openai_api_key column to support longer API keys
    - Ensure column can store up to 200 characters

  2. Security
    - Maintain existing RLS policies
*/

-- Modify openai_api_key column to support longer API keys
ALTER TABLE api_requests 
  ALTER COLUMN openai_api_key TYPE text,
  ALTER COLUMN openai_api_key SET DEFAULT '';

-- Ensure both configuration records exist with new column type
INSERT INTO api_requests (id, api_keyword, api_key, openai_api_key)
VALUES 
  (1, '', '', ''),  -- RapidAPI settings
  (2, '', '', '')   -- OpenAI API settings
ON CONFLICT (id) DO NOTHING;