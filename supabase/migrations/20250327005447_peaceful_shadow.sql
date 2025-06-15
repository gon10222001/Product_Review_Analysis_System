/*
  # Remove unused columns from api_requests table

  1. Changes
    - Drop openai_api_key column
    - Drop openai_content column
    - Remove unused columns that are not referenced in the application

  2. Notes
    - Columns are dropped safely using IF EXISTS
    - No data migration needed as columns are unused
*/

-- Drop unused columns
ALTER TABLE api_requests 
  DROP COLUMN IF EXISTS openai_api_key,
  DROP COLUMN IF EXISTS openai_content;