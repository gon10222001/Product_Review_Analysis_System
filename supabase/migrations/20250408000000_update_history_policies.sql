-- Drop existing policies
DROP POLICY IF EXISTS "Users can create search history" ON search_history;
DROP POLICY IF EXISTS "Users can read own search history" ON search_history;
DROP POLICY IF EXISTS "Users can delete own search history" ON search_history;

-- Create new policies for public access
CREATE POLICY "Anyone can create search history"
  ON search_history
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read search history"
  ON search_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can delete search history"
  ON search_history
  FOR DELETE
  TO public
  USING (true);

-- Drop existing policies for product_history
DROP POLICY IF EXISTS "Users can create product history" ON product_history;
DROP POLICY IF EXISTS "Users can read own product history" ON product_history;
DROP POLICY IF EXISTS "Users can delete own product history" ON product_history;

-- Create new policies for public access to product_history
CREATE POLICY "Anyone can create product history"
  ON product_history
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read product history"
  ON product_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can delete product history"
  ON product_history
  FOR DELETE
  TO public
  USING (true); 