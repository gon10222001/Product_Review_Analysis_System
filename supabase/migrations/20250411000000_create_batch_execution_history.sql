-- バッチ処理の実行履歴を記録するテーブルを作成
CREATE TABLE IF NOT EXISTS batch_execution_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL, -- 'running', 'completed', 'aborted', 'error'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE batch_execution_history ENABLE ROW LEVEL SECURITY;

-- パブリックアクセスを許可
CREATE POLICY "パブリックアクセスを許可"
  ON batch_execution_history
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true); 