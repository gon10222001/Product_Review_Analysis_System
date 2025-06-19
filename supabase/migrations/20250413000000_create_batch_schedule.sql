-- バッチ処理のスケジュール設定を管理するテーブルを作成
CREATE TABLE IF NOT EXISTS batch_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- スケジュール名
  cron_expression TEXT NOT NULL, -- cron式
  is_active BOOLEAN DEFAULT true, -- 有効/無効
  timezone TEXT DEFAULT 'Asia/Tokyo', -- タイムゾーン
  description TEXT, -- 説明
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- デフォルトのスケジュールを挿入（毎日午前0時）
INSERT INTO batch_schedule (name, cron_expression, description) 
VALUES ('毎日午前0時', '0 0 * * *', '毎日午前0時にバッチ処理を実行')
ON CONFLICT DO NOTHING;

-- RLSを有効化
ALTER TABLE batch_schedule ENABLE ROW LEVEL SECURITY;

-- パブリックアクセスを許可
CREATE POLICY "パブリックアクセスを許可"
  ON batch_schedule
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_batch_schedule_active ON batch_schedule(is_active);
CREATE INDEX IF NOT EXISTS idx_batch_schedule_created_at ON batch_schedule(created_at); 