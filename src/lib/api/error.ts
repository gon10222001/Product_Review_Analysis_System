/**
 * Error handling utilities
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    if (status === 503) {
      message = 'RapidAPIのサービスが一時的に利用できません。しばらく時間をおいてから再度お試しください。';
    }
    
    super(message);
    this.name = 'ApiError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'ネットワークエラーが発生しました。インターネット接続を確認してください。') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AbortedError extends ApiError {
  constructor(message: string = 'リクエストがキャンセルされました。') {
    super(message);
    this.name = 'AbortedError';
  }
}

export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const networkErrorMessages = [
    'Failed to fetch',
    'Network request failed',
    'network error',
    'NetworkError',
    'Network Error',
    'net::ERR'
  ];

  return networkErrorMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error && 
    (error.name === 'AbortError' || error.message === 'AbortError')
  );
}

/**
 * Create error message from API response
 */
export async function createErrorMessage(
  response: Response,
  totalRetries: number = 0
): Promise<string> {
  let errorMessage = `APIリクエストが失敗しました。ステータス: ${response.status}`;
  let errorDetails = '';

  try {
    const errorData = await response.json();
    errorDetails = JSON.stringify(errorData);
  } catch {
    try {
      errorDetails = await response.text();
    } catch {
      errorDetails = 'レスポンスの詳細を取得できませんでした';
    }
  }

  if (errorDetails) {
    errorMessage += ` - ${errorDetails}`;
  }

  if (totalRetries > 0) {
    errorMessage += ` (${totalRetries}回リトライしましたが失敗しました)`;
  }

  return errorMessage;
}

export function handleApiError(error: unknown): never {
  if (isAbortError(error)) {
    throw new AbortedError();
  }

  if (isNetworkError(error)) {
    throw new NetworkError();
  }

  if (error instanceof ApiError) {
    throw error;
  }

  throw new ApiError(
    error instanceof Error ? error.message : 'APIリクエストの実行中にエラーが発生しました。'
  );
}