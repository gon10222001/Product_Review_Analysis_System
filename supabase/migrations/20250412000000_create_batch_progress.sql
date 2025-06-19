-- バッチ処理の進捗を記録するテーブルを作成
CREATE TABLE IF NOT EXISTS batch_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID REFERENCES batch_execution_history(id) ON DELETE CASCADE,
  query_index INTEGER NOT NULL,
  current_page INTEGER NOT NULL,
  total_products_processed INTEGER DEFAULT 0,
  status TEXT NOT NULL, -- 'processing', 'completed', 'error'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE batch_progress ENABLE ROW LEVEL SECURITY;

-- パブリックアクセスを許可
CREATE POLICY "パブリックアクセスを許可"
  ON batch_progress
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_batch_progress_execution_id ON batch_progress(execution_id);
CREATE INDEX IF NOT EXISTS idx_batch_progress_created_at ON batch_progress(created_at); 