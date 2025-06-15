/**
 * Application constants
 */

// Platform options
export const PLATFORMS = ['Amazon'] as const;

// Default filter values
export const DEFAULT_FILTERS = {
  VISCOSITY_GRADE: '',
  MANUFACTURER: '',
  PRODUCT_NAME: ''
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_VISCOSITY: '該当する粘度グレードがありません',
  INVALID_MANUFACTURER: '該当するメーカーがありません',
  DATABASE_CONNECTION: 'データベースへの接続に失敗しました。インターネット接続を確認してください。',
  API_SETTINGS: 'API設定の取得中にエラーが発生しました。',
  PRODUCT_SEARCH: '商品の検索中にエラーが発生しました。',
  RETRY_CONNECTION: '接続を再試行しています...',
  CONNECTION_FAILED: '接続に失敗しました。インターネット接続を確認してください。'
} as const;

// Validation
export const VALIDATION = {
  MAX_PRODUCT_NAME_LENGTH: 100,
  MIN_PRICE: 0,
  MAX_RATING: 5,
  MIN_RATING: 0
} as const;

// API Constants
export const API = {
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  RETRY_BACKOFF: 1.5,
  TIMEOUT: 30000,
  BATCH_SIZE: 10
} as const;

// Database Constants
export const DATABASE = {
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  RETRY_BACKOFF: 1.5,
  CONNECTION_TIMEOUT: 10000
} as const;