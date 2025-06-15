/**
 * API configuration constants
 */
export const API_CONFIG = {
  RETRY: {
    MAX_COUNT: 3,
    INTERVAL: 1000,
    MAX_DELAY: 5000,
    JITTER: 200
  },
  ENDPOINTS: {
    PRODUCTS: '/products',
    REVIEWS: '/reviews',
    SETTINGS: '/settings'
  },
  ERROR_CODES: {
    RATE_LIMIT: 429,
    SERVER_ERROR: 500,
    AUTH_REQUIRED: 401
  }
} as const;

export const API_CLIENT_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  retryConfig: {
    maxRetries: API_CONFIG.RETRY.MAX_COUNT,
    retryInterval: API_CONFIG.RETRY.INTERVAL,
    maxDelay: API_CONFIG.RETRY.MAX_DELAY
  }
} as const;