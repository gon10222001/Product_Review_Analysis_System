/**
 * API request handling
 */

import { API_CONSTANTS, createRequestOptions } from './constants';
import { ApiError, createErrorMessage, handleApiError, isAbortError } from './error';
import { addCacheBuster, calculateRetryDelay, sleep, validateApiResponse } from './utils';
import type { ApiResponse, RetryableStatusCode } from './types';

/**
 * Make API request with retry logic
 */
export async function makeApiRequest<T>(
  url: string,
  apiKey: string,
  options: RequestInit = {},
  signal?: AbortSignal,
  retryCount = 0,
  totalRetries = 0,
  onRetryStatusChange?: (isRetrying: boolean) => void
): Promise<T> {
  try {
    // Check for abort before making request
    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    // Update retry status if needed
    if (retryCount > 0 && onRetryStatusChange) {
      onRetryStatusChange(true);
    }

    const requestUrl = addCacheBuster(url);
    const requestOptions = createRequestOptions(apiKey, { 
      ...options,
      signal,
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    let response: Response;
    try {
      response = await fetch(requestUrl, requestOptions);
    } catch (fetchError) {
      // Check for abort after fetch attempt
      if (signal?.aborted) {
        throw new Error('AbortError');
      }

      // Handle network errors with retry
      if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
        if (retryCount < API_CONSTANTS.REQUEST.MAX_RETRIES) {
          const delayMs = calculateRetryDelay(retryCount);
          await sleep(delayMs, signal);
          
          return makeApiRequest<T>(
            url, apiKey, options, signal,
            retryCount + 1, totalRetries + 1, onRetryStatusChange
          );
        }
        throw new ApiError('APIサーバーに接続できません。インターネット接続を確認してください。');
      }
      throw fetchError;
    }

    // Check for abort after response received
    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    // Handle retryable status codes
    if (API_CONSTANTS.REQUEST.RETRYABLE_STATUSES.includes(response.status as RetryableStatusCode)) {
      if (retryCount < API_CONSTANTS.REQUEST.MAX_RETRIES) {
        const delayMs = calculateRetryDelay(retryCount);
        await sleep(delayMs, signal);

        // サービス利用不可（503）の場合は、より長い待機時間を設定
        const isServiceUnavailable = response.status === 503;
        if (isServiceUnavailable) {
          await sleep(API_CONSTANTS.REQUEST.MAX_RETRY_DELAY, signal);
        }

        return makeApiRequest<T>(
          url, apiKey, options, signal,
          retryCount + 1, totalRetries + 1, onRetryStatusChange
        );
      }
    }

    if (!response.ok) {
      const errorMessage = await createErrorMessage(response, totalRetries);
      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return handleApiError(error);
  } finally {
    if (onRetryStatusChange && (retryCount >= API_CONSTANTS.REQUEST.MAX_RETRIES || signal?.aborted)) {
      onRetryStatusChange(false);
    }
  }
}