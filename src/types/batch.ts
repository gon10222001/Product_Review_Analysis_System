export interface BatchExecutionHistory {
  id: string;
  started_at: string;
  ended_at: string | null;
  status: 'running' | 'completed' | 'aborted' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBatchExecutionHistory {
  started_at: string;
  status: 'running';
}

export interface UpdateBatchExecutionHistory {
  ended_at: string;
  status: 'completed' | 'aborted' | 'error';
  error_message?: string;
} 