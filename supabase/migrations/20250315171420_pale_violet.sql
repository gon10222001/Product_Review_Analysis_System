/*
  # Update sales volume column in products table

  1. Changes
    - Modify prd_sel_vol column to allow NULL values
    - Remove default value to show empty when no value is set

  2. Security
    - Maintain existing RLS policies
*/

-- Modify sales volume column
ALTER TABLE products ALTER COLUMN prd_sel_vol DROP DEFAULT;
ALTER TABLE products ALTER COLUMN prd_sel_vol DROP NOT NULL;