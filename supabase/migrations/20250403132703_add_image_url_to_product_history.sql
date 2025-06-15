-- Add image_url column to product_history table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'product_history' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE product_history
        ADD COLUMN image_url TEXT;
    END IF;
END $$;
