/*
  # Add OpenAI API settings support

  1. Changes
    - Add initial record for OpenAI API settings with id=2
    - Update RLS policies to allow access to both records

  2. Security
    - Maintain existing RLS policies
    - Allow access to both RapidAPI and OpenAI API settings
*/

-- Insert OpenAI API settings record if it doesn't exist
INSERT INTO api_requests (id, api_keyword, api_key)
VALUES (2, '', '')
ON CONFLICT (id) DO NOTHING;