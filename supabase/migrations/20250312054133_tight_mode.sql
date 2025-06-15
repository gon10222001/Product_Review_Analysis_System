/*
  # Update stored procedure for API settings

  1. Changes
    - Remove updated_at from update statement
    - Simplify the function to focus on core functionality
*/

-- Update the function to not use updated_at
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
    api_key = p_api_key
  WHERE id = 1;

  -- Return the updated values
  RETURN QUERY
  SELECT ar.api_keyword, ar.api_key
  FROM api_requests ar
  WHERE ar.id = 1;
END;
$$;