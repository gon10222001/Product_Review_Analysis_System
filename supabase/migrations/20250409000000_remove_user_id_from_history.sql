-- search_historyテーブルからuser_idカラムを削除（存在する場合のみ）
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'search_history' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE search_history DROP COLUMN user_id;
    END IF;
END $$;

-- product_historyテーブルからuser_idカラムを削除（存在する場合のみ）
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'product_history' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE product_history DROP COLUMN user_id;
    END IF;
END $$; 