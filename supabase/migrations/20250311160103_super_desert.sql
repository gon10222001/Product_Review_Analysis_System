/*
  # Add RLS policies for api_requests table

  1. Security Changes
    - Enable RLS on api_requests table
    - Add policies for:
      - Authenticated users can view api_requests
      - Authenticated users can insert/update api_requests
      - Authenticated users can delete api_requests

  2. Notes
    - All operations are restricted to authenticated users only
    - Each user can access all api_requests records (shared configuration)
*/

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Policy for viewing api_requests
CREATE POLICY "Authenticated users can view api_requests"
ON api_requests
FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting/updating api_requests
CREATE POLICY "Authenticated users can insert/update api_requests"
ON api_requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);