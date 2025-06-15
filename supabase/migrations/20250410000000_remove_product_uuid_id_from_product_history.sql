-- product_historyテーブルからproduct_uuid_idカラムを削除（存在する場合のみ）
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'product_history' 
        AND column_name = 'product_uuid_id'
    ) THEN
        ALTER TABLE product_history DROP COLUMN product_uuid_id;
    END IF;
END $$; 