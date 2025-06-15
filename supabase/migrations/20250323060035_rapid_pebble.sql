/*
  # Update api_requests table schema

  1. Changes
    - Add openai_api_key column to api_requests table
    - Update stored procedure to handle new column
    - Maintain existing data and policies

  2. Security
    - Maintain existing RLS policies
    - Ensure secure handling of API keys
*/

-- Add openai_api_key column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_requests' AND column_name = 'openai_api_key'
  ) THEN
    ALTER TABLE api_requests ADD COLUMN openai_api_key text DEFAULT '';
  END IF;
END $$;

-- Update stored procedure to handle openai_api_key
CREATE OR REPLACE FUNCTION update_api_settings(
  p_keyword TEXT,
  p_api_key TEXT,
  p_openai_api_key TEXT DEFAULT NULL
)
RETURNS TABLE (
  api_keyword TEXT,
  api_key TEXT,
  openai_api_key TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the settings
  UPDATE api_requests
  SET 
    api_keyword = p_keyword,
    api_key = p_api_key,
    openai_api_key = COALESCE(p_openai_api_key, openai_api_key)
  WHERE id = 1;

  -- Return the updated values
  RETURN QUERY
  SELECT ar.api_keyword, ar.api_key, ar.openai_api_key
  FROM api_requests ar
  WHERE ar.id = 1;
END;
$$;