import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { logger } from './utils/logger';
import { validateEnvironmentVariables } from './utils/validation';
import { AppError } from './utils/error';
import { ERROR_MESSAGES } from './constants';
import { withRetry } from './utils/retry';

// Validate required environment variables
validateEnvironmentVariables(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with improved configuration
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key) => {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              const item = localStorage.getItem(key);
              return item ? JSON.parse(item) : null;
            }
            return null;
          } catch (error) {
            logger.error('Failed to get item from storage', 'Database', { error });
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem(key, JSON.stringify(value));
            }
          } catch (error) {
            logger.error('Failed to set item in storage', 'Database', { error });
          }
        },
        removeItem: (key) => {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            logger.error('Failed to remove item from storage', 'Database', { error });
          }
        }
      }
    },
    global: {
      headers: {
        'x-application-name': 'product-review-system',
        'Cache-Control': 'no-cache'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 1
      }
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  }
);

// Connection state management
let isInitialConnectionTested = false;
let lastConnectionTest = 0;
const CONNECTION_TEST_INTERVAL = 5000; // 5 seconds
const CONNECTION_TEST_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

/**
 * Test Supabase connection with improved retry logic
 */
export async function testConnection(retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<boolean> {
  try {
    // Skip test if one was performed recently
    const now = Date.now();
    if (isInitialConnectionTested && (now - lastConnectionTest) < CONNECTION_TEST_INTERVAL) {
      return true;
    }

    const result = await withRetry(
      async () => {
        logger.info('Testing Supabase connection...', 'Database');

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TEST_TIMEOUT);
        });

        // Create the actual test query
        const testPromise = supabase
          .from('products')
          .select('count')
          .limit(1)
          .maybeSingle();

        // Race between timeout and test query
        const { error } = await Promise.race([
          testPromise,
          timeoutPromise
        ]) as { error: Error | null };

        if (error) {
          throw error;
        }

        logger.info('Supabase connection successful', 'Database');
        return true;
      },
      {
        maxRetries: retries,
        delay,
        onRetry: (attempt, maxRetries) => {
          logger.info(`Retrying connection (${attempt}/${maxRetries})...`, 'Database');
        },
        shouldRetry: (error) => {
          if (error instanceof Error) {
            const retryableErrors = [
              'failed to fetch',
              'network request failed',
              'network error',
              'connection failed',
              'connection timeout',
              'socket hang up',
              'econnrefused',
              'etimedout',
              'aborted',
              'pool timeout'
            ];

            return retryableErrors.some(msg => 
              error.message.toLowerCase().includes(msg.toLowerCase())
            );
          }
          return false;
        }
      }
    );

    if (result) {
      isInitialConnectionTested = true;
      lastConnectionTest = Date.now();
    }

    return result;
  } catch (error) {
    logger.error('All connection attempts failed', 'Database', error);
    return false;
  }
}

// Export a function to check connection status with retry
export async function isConnected(): Promise<boolean> {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new AppError(ERROR_MESSAGES.DATABASE_CONNECTION);
    }
    return true;
  } catch (error) {
    logger.error('Connection check error:', 'Database', error);
    return false;
  }
}

// Initialize connection test
testConnection().catch(error => {
  logger.error('Initial connection test failed:', 'Database', error);
});