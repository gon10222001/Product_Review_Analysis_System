/*
  # Fix RLS policies for products table

  1. Changes
    - Drop existing policies
    - Create new RLS policies that allow:
      - Anyone to view products
      - Authenticated users to insert/update products
      - Authenticated users to delete products

  2. Security
    - Maintain basic security while allowing batch process to work
*/

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON products FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON products FOR DELETE
TO authenticated
USING (true);