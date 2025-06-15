/*
  # Remove price constraint from products table

  1. Changes
    - Drop the price constraint from products table
    - Allow any non-negative integer value for price

  2. Notes
    - This removes the upper limit on price values
    - The column remains NOT NULL and integer type
*/

-- Drop existing price constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_price;

-- Keep only the non-negative check
ALTER TABLE products ADD CONSTRAINT valid_price CHECK (prd_price >= 0);