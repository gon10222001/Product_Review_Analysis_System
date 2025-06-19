-- スケジュールテーブルの存在確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'batch_schedule'
);

-- テーブル構造の確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'batch_schedule'
ORDER BY ordinal_position;

-- 既存データの確認
SELECT * FROM batch_schedule;

-- テストデータの挿入（テーブルが存在しない場合のエラーを確認）
INSERT INTO batch_schedule (name, cron_expression, is_active, timezone, description)
VALUES ('テストスケジュール', '0 0 * * *', true, 'Asia/Tokyo', 'テスト用スケジュール')
ON CONFLICT DO NOTHING; 