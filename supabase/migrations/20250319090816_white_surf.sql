/*
  # Fix product ordering

  1. Changes
    - Reset all product order numbers to ensure correct sequential ordering
    - Add NOT NULL constraint to prd_order column
    - Ensure index exists for performance

  2. Notes
    - Orders products by creation timestamp to maintain logical order
    - Ensures all products have a valid order number
*/

-- Make prd_order NOT NULL and set default
ALTER TABLE products 
  ALTER COLUMN prd_order SET NOT NULL,
  ALTER COLUMN prd_order SET DEFAULT 0;

-- Drop and recreate the index for better performance
DROP INDEX IF EXISTS idx_products_order;
CREATE INDEX idx_products_order ON products (prd_order);

-- Reset all order numbers to ensure correct sequential ordering
WITH numbered_products AS (
  SELECT 
    prd_id,
    ROW_NUMBER() OVER (
      ORDER BY 
        prd_platform DESC, -- Amazon first, then Youtube
        prd_crt_ts ASC    -- Then by creation time
    ) as new_order
  FROM products
)
UPDATE products p
SET prd_order = np.new_order
FROM numbered_products np
WHERE p.prd_id = np.prd_id;