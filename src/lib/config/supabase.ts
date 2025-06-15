/**
 * Supabase configuration constants
 */
export const SUPABASE_CONFIG = {
  RETRY: {
    MAX_COUNT: 3,
    INTERVAL: 1000,
    MAX_DELAY: 5000
  },
  ERROR_CODES: {
    AUTH_REQUIRED: 'PGRST301',
    CONN_REFUSED: 'ECONNREFUSED',
    TIMEOUT: 'ETIMEDOUT'
  }
} as const;

export const SUPABASE_CLIENT_CONFIG = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'product-review-system'
    }
  },
  db: {
    schema: 'public'
  },
  maxRetryCount: SUPABASE_CONFIG.RETRY.MAX_COUNT,
  retryInterval: SUPABASE_CONFIG.RETRY.INTERVAL
} as const;