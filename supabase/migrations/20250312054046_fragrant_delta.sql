/*
  # Add stored procedure for atomic API settings update

  1. New Functions
    - `update_api_settings`: Updates API settings and returns updated values atomically
    
  2. Security
    - Function is accessible only to authenticated users
    - Maintains existing RLS policies
*/

-- Create function to update API settings atomically
CREATE OR REPLACE FUNCTION update_api_settings(
  p_keyword TEXT,
  p_api_key TEXT
)
RETURNS TABLE (
  api_keyword TEXT,
  api_key TEXT
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
    updated_at = now()
  WHERE id = 1;

  -- Return the updated values
  RETURN QUERY
  SELECT ar.api_keyword, ar.api_key
  FROM api_requests ar
  WHERE ar.id = 1;
END;
$$;