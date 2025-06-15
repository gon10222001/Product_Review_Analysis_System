/**
 * API constants and configuration
 */

export const API_CONSTANTS = {
  // API Configuration
  BASE_URL: 'https://real-time-amazon-data.p.rapidapi.com',
  HOST: 'real-time-amazon-data.p.rapidapi.com',
  
  // Endpoints
  ENDPOINTS: {
    SEARCH: '/search',
    PRODUCT_DETAILS: '/product-details',
    REVIEWS: '/product-reviews'
  },
  
  // Request Configuration
  REQUEST: {
    MAX_RETRIES: 3,
    INITIAL_RETRY_DELAY: 1000,
    BACKOFF_MULTIPLIER: 1.5,
    MAX_RETRY_DELAY: 5000,
    JITTER_MAX: 500,
    RETRYABLE_STATUSES: [408, 429, 500, 502, 503, 504],
    REQUEST_DELAY: 1000,
    TIMEOUT: 30000
  },
  
  // Default Parameters
  DEFAULTS: {
    COUNTRY: 'JP',
    REVIEWS_COUNTRY: 'JP',
    PAGE: 1,
    SORT: 'RELEVANCE',
    PAGE_SIZE: 10,
    PRODUCT_CONDITIONS: 'ALL',
    IS_PRIME: 'false',
    DEALS: 'NONE'
  },

  // Product Information Fields
  FIELDS: {
    MANUFACTURER: 'メーカー',
    VISCOSITY: '粘度'
  }
} as const;

/**
 * Create API request headers
 */
export function createApiHeaders(apiKey: string): HeadersInit {
  return {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': API_CONSTANTS.HOST,
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  };
}

/**
 * Create API request options
 */
export function createRequestOptions(
  apiKey: string,
  options: RequestInit = {}
): RequestInit {
  return {
    ...options,
    headers: {
      ...createApiHeaders(apiKey),
      ...options.headers
    },
    method: options.method || 'GET',
    signal: options.signal,
    keepalive: true,
    mode: 'cors',
    credentials: 'omit',
    timeout: API_CONSTANTS.REQUEST.TIMEOUT
  };
}