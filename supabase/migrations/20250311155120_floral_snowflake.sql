/*
  # Add RLS policies for api_requests table

  1. Security
    - Enable RLS on `api_requests` table
    - Add policies for authenticated users to:
      - Read api_requests
      - Insert/update api_requests
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read api_requests
CREATE POLICY "Authenticated users can read api_requests"
ON api_requests
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert/update api_requests
CREATE POLICY "Authenticated users can insert/update api_requests"
ON api_requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);