/*
  # Update RLS policies for history tables

  1. Changes
    - Drop existing RLS policies for search_history and product_history
    - Create new policies that allow public access to both tables
    - Enable RLS on both tables

  2. Security
    - Allow all operations (read/write) for all users
    - Remove user_id restrictions
*/

-- Drop existing policies for search_history
DROP POLICY IF EXISTS "Users can create search history" ON search_history;
DROP POLICY IF EXISTS "Users can read own search history" ON search_history;
DROP POLICY IF EXISTS "Users can delete own search history" ON search_history;

-- Drop existing policies for product_history
DROP POLICY IF EXISTS "Users can create product history" ON product_history;
DROP POLICY IF EXISTS "Users can read own product history" ON product_history;
DROP POLICY IF EXISTS "Users can delete own product history" ON product_history;

-- Enable RLS on both tables
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_history ENABLE ROW LEVEL SECURITY;

-- Create new open access policy for search_history
CREATE POLICY "Enable full access for all users on search_history"
ON search_history
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create new open access policy for product_history
CREATE POLICY "Enable full access for all users on product_history"
ON product_history
FOR ALL
TO public
USING (true)
WITH CHECK (true);