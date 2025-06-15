/**
 * Error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AppError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error && 
    (error.message.includes('Failed to fetch') || 
     error.message.includes('Network request failed'))
  );
}

export function handleApiError(error: unknown): never {
  if (error instanceof AppError) {
    throw error;
  }

  if (isNetworkError(error)) {
    throw new AppError(
      'ネットワークエラーが発生しました。インターネット接続を確認してください。',
      'NETWORK_ERROR'
    );
  }

  throw new AppError(
    error instanceof Error ? error.message : '予期せぬエラーが発生しました。',
    'UNKNOWN_ERROR'
  );
}