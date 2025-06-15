/**
 * API utility functions
 */

import { API_CONSTANTS } from './constants';
import { AbortedError } from './error';
import { ProductSearchParams } from './types';

/**
 * Extract numeric value from string
 */
export function extractNumber(str: string | null, defaultValue: number | null = 0): number | null {
  if (!str) return defaultValue;
  
  // Remove commas and currency symbols
  const cleaned = str.replace(/[,¥$]/g, '');
  
  // Extract numbers using regex
  const matches = cleaned.match(/\d+/g);
  if (!matches) return defaultValue;
  
  const lastNumber = matches[matches.length - 1];
  const value = parseInt(lastNumber, 10);
  
  return isNaN(value) ? defaultValue : value;
}

/**
 * Create a promise that resolves after a delay and can be aborted
 */
export async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    throw new AbortedError();
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new AbortedError());
      }, { once: true });
    }
  });
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
export function calculateRetryDelay(retryCount: number): number {
  const baseDelay = API_CONSTANTS.REQUEST.INITIAL_RETRY_DELAY * 
    Math.pow(API_CONSTANTS.REQUEST.BACKOFF_MULTIPLIER, retryCount);
  
  const maxDelay = API_CONSTANTS.REQUEST.MAX_RETRY_DELAY;
  const jitter = Math.random() * API_CONSTANTS.REQUEST.JITTER_MAX;
  
  return Math.min(baseDelay + jitter, maxDelay);
}

/**
 * Add cache buster to URL
 */
export function addCacheBuster(url: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.append('_', Date.now().toString());
  return urlObj.toString();
}

/**
 * Create API URLs
 */
export const createApiUrls = {
  search: (params: ProductSearchParams): string => {
    const searchParams = new URLSearchParams({
      query: params.keyword,
      country: params.country || API_CONSTANTS.DEFAULTS.COUNTRY,
      page: String(params.page || API_CONSTANTS.DEFAULTS.PAGE),
      sort_by: params.sort || API_CONSTANTS.DEFAULTS.SORT,
      product_condition: API_CONSTANTS.DEFAULTS.PRODUCT_CONDITIONS,
      is_prime: API_CONSTANTS.DEFAULTS.IS_PRIME,
      deals_and_discounts: API_CONSTANTS.DEFAULTS.DEALS
    });

    return `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.SEARCH}?${searchParams}`;
  },

  reviews: (productId: string, page: number = 1): string => {
    const searchParams = new URLSearchParams({
      asin: productId,
      country: API_CONSTANTS.DEFAULTS.REVIEWS_COUNTRY,
      page: String(page),
      sort_by: 'MOST_RECENT',
      star_rating: 'ALL',
      verified_purchases_only: 'false',
      images_or_videos_only: 'false',
      current_format_only: 'false'
    });

    return `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.REVIEWS}?${searchParams}`;
  },

  productDetails: (productId: string): string => {
    const searchParams = new URLSearchParams({
      asin: productId,
      country: API_CONSTANTS.DEFAULTS.COUNTRY
    });

    return `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.PRODUCT_DETAILS}?${searchParams}`;
  }
};

/**
 * Validate API response data
 */
export function validateApiResponse<T>(data: unknown): T {
  if (!data || typeof data !== 'object') {
    throw new Error('無効なAPIレスポンス形式です。');
  }

  const response = data as Record<string, unknown>;

  if ('error' in response) {
    throw new Error(
      typeof response.error === 'string' ? response.error : 'APIエラーが発生しました。'
    );
  }

  if (response.status === 'error' || response.status === 'fail') {
    throw new Error(
      typeof response.message === 'string' ? response.message : 'APIリクエストが失敗しました。'
    );
  }

  return data as T;
}

/**
 * Extract sales volume from string
 * Example: "過去1か月で300点以上購入されました" -> 300
 */
export function extractSalesVolume(str: string | null): number | null {
  if (!str) return null;
  
  // Extract numbers using regex
  const matches = str.match(/\d+/g);
  if (!matches) return null;
  
  const lastNumber = matches[matches.length - 1];
  const value = parseInt(lastNumber, 10);
  
  return isNaN(value) ? null : value;
}