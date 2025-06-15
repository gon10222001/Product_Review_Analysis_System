/**
 * Retry utility for async operations with exponential backoff
 */

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  onRetry?: (attempt: number, maxRetries: number) => void;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultShouldRetry = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Retry on network errors and specific error messages
    const retryableMessages = [
      'failed to fetch',
      'network request failed',
      'network error',
      'connection failed',
      'connection refused',
      'timeout',
      'socket hang up',
      'econnrefused',
      'etimedout',
      'aborted',
      'pool timeout'
    ];

    return retryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
  return false;
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 5,
    delay = 1000,
    onRetry,
    shouldRetry = defaultShouldRetry
  } = options;

  let lastError: Error | null = null;
  let attempt = 1;
  
  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        break;
      }

      if (onRetry) {
        onRetry(attempt, maxRetries);
      }

      // Calculate exponential backoff with jitter
      const backoff = Math.min(delay * Math.pow(1.5, attempt - 1), 10000);
      const jitter = Math.random() * 200;
      await new Promise(resolve => setTimeout(resolve, backoff + jitter));
      
      attempt++;
    }
  }

  throw lastError;
}