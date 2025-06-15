/*
  # Update RLS policies for full access

  1. Changes
    - Enable RLS on products table
    - Grant full access (read/write) to all users
    - Remove authentication requirements

  2. Security
    - WARNING: This configuration allows unrestricted access to all data
    - Suitable for development/testing environments only
*/

-- Products table policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Enable full access for all users" ON products;

-- Create new open access policy
CREATE POLICY "Enable full access for all users"
ON products
FOR ALL
TO public
USING (true)
WITH CHECK (true);