import { supabase, isConnected } from './supabase';
import { Platform, Product, ApiSettings } from './schemas';
import { executeBatchProcess as executeNewBatchProcess } from './api/batch';
import { ApiError } from './api/error';
import { searchProducts as searchProductsFromDB } from './api/products';
import { logger } from './utils/logger';

interface SearchParams {
  platform: Platform;
  productName: string;
  viscosityGrade?: string;
  manufacturer?: string;
}

/**
 * Search products based on given criteria
 */
export async function searchProducts(params: SearchParams): Promise<Product[]> {
  return searchProductsFromDB(params);
}

/**
 * Get API settings from database
 */
export async function getApiSettings(): Promise<ApiSettings | null> {
  try {
    // Get queries from Supabase
    const { data: queriesResult, error: queriesError } = await supabase
      .from('api_queries')
      .select('api_query')
      .order('id', { ascending: true });

    if (queriesError) {
      logger.error('Query fetch error:', 'API', queriesError);
      throw new Error('APIクエリの取得中にエラーが発生しました。');
    }

    return {
      queries: queriesResult?.map(q => q.api_query) || []
    };
  } catch (error) {
    logger.error('Error in getApiSettings:', 'API', error);
    throw error instanceof Error ? error : new Error('API設定の取得中にエラーが発生しました。');
  }
}

/**
 * Save API settings to api_queries table
 */
export async function saveApiSettings(settings: ApiSettings): Promise<{ success: boolean }> {
  try {
    // Save queries to api_queries table
    if (settings.queries && settings.queries.length > 0) {
      // Delete existing queries
      await supabase
        .from('api_queries')
        .delete()
        .gt('id', 0); // Delete all records

      // Insert new queries with sequential IDs
      const queryInserts = settings.queries.map((query, index) => ({
        id: index + 1,
        api_query: query
      }));

      const { error: queryError } = await supabase
        .from('api_queries')
        .insert(queryInserts);

      if (queryError) {
        logger.error('Query save error:', 'API', queryError);
        throw new Error('クエリの保存中にエラーが発生しました。');
      }
    }

    return {
      success: true
    };
  } catch (error) {
    logger.error('Error in saveApiSettings:', 'API', error);
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('データベースへの接続に失敗しました。インターネット接続を確認してください。');
      }
      throw error;
    }
    return {
      success: false
    };
  }
}