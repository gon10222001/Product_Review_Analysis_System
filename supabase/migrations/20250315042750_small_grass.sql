/*
  # Fix products table schema

  1. Changes
    - Rename timestamp columns to match application code
    - Drop and recreate table with correct schema
    - Maintain existing RLS policies
*/

-- Drop existing table
DROP TABLE IF EXISTS products CASCADE;

-- Create products table with correct schema
CREATE TABLE products (
  prd_id text PRIMARY KEY,
  prd_name text NOT NULL,
  prd_img_url text NOT NULL,
  prd_vsc_grd text,
  prd_maker text,
  prd_price integer NOT NULL,
  prd_avg_rtg numeric(3,2) DEFAULT 0,
  prd_rev_cnt integer DEFAULT 0,
  prd_platform text NOT NULL,
  prd_crt_ts timestamptz DEFAULT now(),
  prd_upd_ts timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT valid_platform CHECK (prd_platform IN ('Amazon', 'Youtube')),
  CONSTRAINT valid_price CHECK (prd_price >= 0),
  CONSTRAINT valid_rating CHECK (prd_avg_rtg >= 0 AND prd_avg_rtg <= 5),
  CONSTRAINT valid_review_count CHECK (prd_rev_cnt >= 0)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
CREATE POLICY "Enable full access for all users"
ON products
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create trigger for updating timestamp
CREATE OR REPLACE FUNCTION update_prd_upd_ts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prd_upd_ts = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_prd_upd_ts();