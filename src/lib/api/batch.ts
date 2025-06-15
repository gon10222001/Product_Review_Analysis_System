/**
 * Batch processing functionality
 */

import { supabase } from '../supabase';
import { logger } from '../utils/logger';
import { getJSTISOString, sleep } from '../utils/index';
import type { Database } from '../../types/supabase';
import type { ProductSearchResponse, ProductDetailsResponse } from './types';
import { createClient } from '@supabase/supabase-js';
import { API_CONSTANTS } from './constants';
import { extractSalesVolume } from './utils';
import { supabase as supabaseClient } from '../supabase/client';
import { BatchExecutionHistory, CreateBatchExecutionHistory, UpdateBatchExecutionHistory } from '../../types/batch';

type DbProduct = Database['public']['Tables']['products']['Insert'];
type ApiQuery = {
  id: number;
  api_query: string;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL = API_CONSTANTS.BASE_URL;

// 並列処理の設定
const CONCURRENT_REQUESTS = 5; // 同時に実行するリクエスト数
let orderCounter = 1; // 商品の順序を管理するカウンター

async function makeApiRequest<T>(url: string, apiKey: string, signal?: AbortSignal): Promise<T> {
  const headers = {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
  };

  logger.info('APIリクエストの詳細: ' + JSON.stringify({ url, headers }, null, 2));

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-cache',
      signal
    });

    // 中断チェック
    if (signal?.aborted) {
      throw new Error('バッチ処理が中断されました');
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('APIレスポンスエラー: ' + JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      }, null, 2));
      
      if (response.status === 400) {
        throw new Error(`不正なリクエスト: ${errorText}`);
      } else if (response.status === 401) {
        throw new Error('認証エラー: APIキーが無効です');
      } else if (response.status === 429) {
        throw new Error('レート制限に達しました');
      } else {
        throw new Error(`APIリクエストが失敗しました: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    logger.info('APIレスポンス成功: ' + JSON.stringify({
      status: response.status,
      dataSize: JSON.stringify(data).length
    }, null, 2));
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('バッチ処理が中断されました');
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('APIリクエストエラー: ' + JSON.stringify({
      message: errorMessage,
      url,
      timestamp: new Date().toISOString()
    }, null, 2));
    throw error;
  }
}

async function searchProducts(query: string, apiKey: string, page: number, signal?: AbortSignal): Promise<ProductSearchResponse> {
  const url = new URL('/search', API_BASE_URL);
  url.searchParams.append('query', query);
  url.searchParams.append('country', 'JP');
  url.searchParams.append('page', page.toString());
  url.searchParams.append('sort_by', 'RELEVANCE');
  url.searchParams.append('product_condition', 'ALL');
  url.searchParams.append('is_prime', 'false');
  url.searchParams.append('deals_and_discounts', 'NONE');

  logger.info('検索パラメータ: ' + JSON.stringify({
    query,
    country: 'JP',
    page: page.toString(),
    sort_by: 'RELEVANCE',
    product_condition: 'ALL',
    is_prime: 'false',
    deals_and_discounts: 'NONE'
  }, null, 2));

  const response = await makeApiRequest<ProductSearchResponse>(url.toString(), apiKey, signal);
  
  // レスポンスデータの検証
  if (!response.data?.products) {
    logger.warn('検索結果が空です');
    throw new Error('検索結果が空です');
  }

  logger.info('検索結果: ' + JSON.stringify({
    totalProducts: response.data.products.length,
    firstProduct: response.data.products[0]
  }, null, 2));

  return response;
}

async function getProductDetails(asin: string, apiKey: string, signal?: AbortSignal): Promise<ProductDetailsResponse> {
  const url = new URL('/product-details', API_BASE_URL);
  url.searchParams.append('asin', asin);
  url.searchParams.append('country', 'JP');

  const response = await makeApiRequest<ProductDetailsResponse>(url.toString(), apiKey, signal);
  
  // レスポンスデータの検証
  if (!response.data?.product_information) {
    logger.warn(`商品詳細の取得に失敗しました: ASIN=${asin}`);
    throw new Error(`商品詳細の取得に失敗しました: ASIN=${asin}`);
  }

  logger.info('Product Details API Response:', JSON.stringify(response, null, 2));
  return response;
}

// バッチ処理履歴を作成
async function createBatchExecutionHistory(data: CreateBatchExecutionHistory, supabaseClient?: any): Promise<BatchExecutionHistory> {
  const { data: history, error } = await (supabaseClient || supabaseClient)
    .from('batch_execution_history')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating batch execution history:', error);
    throw error;
  }

  return history;
}

// バッチ処理履歴を更新
async function updateBatchExecutionHistory(id: string, data: UpdateBatchExecutionHistory, supabaseClient?: any): Promise<BatchExecutionHistory> {
  const { data: history, error } = await (supabaseClient || supabaseClient)
    .from('batch_execution_history')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating batch execution history:', error);
    throw error;
  }

  return history;
}

/**
 * 商品詳細を並列で取得する関数
 */
async function fetchProductDetailsInParallel(
  products: any[],
  apiKey: string,
  signal?: AbortSignal,
  supabaseClient?: any
): Promise<void> {
  // 商品をチャンクに分割
  const chunks = [];
  for (let i = 0; i < products.length; i += CONCURRENT_REQUESTS) {
    chunks.push(products.slice(i, i + CONCURRENT_REQUESTS));
  }

  for (const chunk of chunks) {
    // チャンク内の商品を並列で処理
    await Promise.all(chunk.map(async (product) => {
      try {
        const detailsResponse = await getProductDetails(product.asin, apiKey, signal);
        
        // 商品データの検証
        if (!product.asin || !product.product_title) {
          logger.warn(`商品データが不完全です: ${JSON.stringify(product, null, 2)}`);
          return;
        }

        // 既存の商品データを確認
        const { data: existingProduct } = await (supabaseClient || supabase)
          .from('products')
          .select('prd_id')
          .eq('prd_id', product.asin as any)
          .single();

        if (existingProduct) {
          logger.info(`商品は既に存在します。スキップします: ASIN=${product.asin}`);
          return;
        }

        // 商品詳細情報から粘度グレードを探す
        const viscosityGradeKeys = ['粘度グレード', '粘度', 'グレード', '粘度規格'];
        let viscosityGrade = null;
        for (const key of viscosityGradeKeys) {
          const value = detailsResponse.data?.product_information?.[key]?.trim();
          if (value) {
            viscosityGrade = value;
            break;
          }
        }

        // 価格の変換（￥3,049 → 3049）
        const price = product.product_price 
          ? parseInt(product.product_price.replace(/[^0-9]/g, '')) 
          : 0;

        // 評価の変換（文字列 → 数値）
        const rating = product.product_star_rating 
          ? parseFloat(product.product_star_rating) 
          : null;

        // レビュー数の変換（文字列 → 数値）
        const reviewCount = product.product_num_ratings 
          ? parseInt(product.product_num_ratings) 
          : null;

        // 販売数の抽出
        const salesVolume = extractSalesVolume(detailsResponse.data?.sales_volume || null);

        // Supabase用のデータを作成
        const supabaseProduct: DbProduct = {
          prd_id: product.asin,
          prd_name: product.product_title.trim(),
          prd_img_url: product.product_photo || '',
          prd_price: price,
          prd_avg_rtg: rating,
          prd_rev_cnt: reviewCount,
          prd_platform: 'Amazon',
          prd_vsc_grd: viscosityGrade,
          prd_maker: detailsResponse.data?.product_information?.['メーカー']?.trim() || null,
          prd_sel_vol: salesVolume,
          prd_order: orderCounter++,
          prd_crt_ts: getJSTISOString(),
          prd_upd_ts: getJSTISOString()
        };

        // データの検証
        if (!supabaseProduct.prd_id || !supabaseProduct.prd_name) {
          logger.warn(`必須フィールドが不足しています: ${JSON.stringify(supabaseProduct, null, 2)}`);
          return;
        }

        // 商品データを即座に保存
        const { error: insertError } = await (supabaseClient || supabase)
          .from('products')
          .insert(supabaseProduct as any);

        if (insertError) {
          logger.error(`商品データの保存に失敗: ASIN=${product.asin}, エラー: ${insertError.message}`);
          throw new Error(`商品データの保存に失敗しました: ${insertError.message}`);
        }

        logger.info(`商品データを保存: ASIN=${product.asin}, 商品名=${product.product_title}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('商品詳細の取得中にエラーが発生:', errorMessage);
        // エラーが発生しても処理を継続
      }
    }));

    // チャンク間の待機時間を短縮（500msに設定）
    if (!signal?.aborted) {
      await sleep(500);
    }
  }
}

/**
 * Execute batch process
 */
export async function executeBatchProcess(
  onLog: (message: string) => void,
  signal?: AbortSignal,
  supabaseClient?: any
): Promise<void> {
  const log = (message: string) => {
    console.log(message);
    onLog(message);
  };

  let history: BatchExecutionHistory | null = null;

  try {
    // バッチ処理の開始時刻を記録（日本時間）
    const startedAt = getJSTISOString();

    // バッチ処理履歴を作成（開始時）
    history = await createBatchExecutionHistory({
      started_at: startedAt,
      status: 'running'
    }, supabaseClient);

    try {
      // 1. APIキーの確認（環境変数から取得）
      const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
      if (!apiKey) {
        throw new Error('APIキーが環境変数に設定されていません。');
      }
      log('APIキーの確認完了');

      // 2. クエリの取得と確認
      const { data: queries, error: queriesError } = await (supabaseClient || supabase)
        .from('api_queries')
        .select('*');

      if (queriesError) {
        logger.error('クエリ取得エラー:', queriesError.message);
        throw new Error('クエリの取得に失敗しました。');
      }

      if (!queries || queries.length === 0) {
        throw new Error('実行するクエリがありません。');
      }
      log(`クエリを取得しました: ${queries.length}件`);

      // テーブル"products"のデータを全件削除
      try {
        log('既存の商品データを削除中...');
        
        // 削除前のデータ件数を確認
        const { count: beforeCount, error: countError } = await (supabaseClient || supabase)
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          logger.error('データ件数の取得エラー:', countError.message);
          throw new Error(`データ件数の取得中にエラーが発生しました: ${countError.message}`);
        }

        log(`削除前のデータ件数: ${beforeCount || 0}件`);

        // 削除実行
        const { error: deleteError } = await (supabaseClient || supabase)
          .from('products')
          .delete()
          .not('prd_id', 'is', null); // 全レコードを削除

        if (deleteError) {
          logger.error('削除エラー:', deleteError.message);
          throw new Error(`商品データの削除中にエラーが発生しました: ${deleteError.message}`);
        }

        // 削除後のデータ件数を確認
        const { count: afterCount, error: afterCountError } = await (supabaseClient || supabase)
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (afterCountError) {
          logger.error('データ件数の取得エラー:', afterCountError.message);
        } else {
          log(`削除後のデータ件数: ${afterCount || 0}件`);
        }

        log('既存の商品データの削除が完了しました');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('商品データの削除中にエラーが発生:', errorMessage);
        throw new Error('既存の商品データの削除に失敗しました。');
      }

      // 3. 商品データの検索と4. 商品詳細の取得
      for (const query of (queries as any[])) {
        // 中断チェック
        if (signal?.aborted) {
          const endedAt = getJSTISOString();
          await updateBatchExecutionHistory(history.id, {
            ended_at: endedAt,
            status: 'aborted',
            error_message: '中断ボタン押下'
          }, supabaseClient);
          log('バッチ処理が中断されました');
          return;
        }

        try {
          let currentPage = 1;
          let hasMoreProducts = true;
          
          while (hasMoreProducts) {
            // 中断チェック
            if (signal?.aborted) {
              const endedAt = getJSTISOString();
              await updateBatchExecutionHistory(history.id, {
                ended_at: endedAt,
                status: 'aborted',
                error_message: '中断ボタン押下'
              }, supabaseClient);
              log('バッチ処理が中断されました');
              return;
            }

            // 検索クエリとページ番号を表示
            log(`検索クエリ: ${query.api_query}、ページ：${currentPage}`);

            // 商品データの検索
            const searchResponse = await searchProducts(query.api_query, apiKey, currentPage, signal);
            
            // 検索結果の件数を表示
            log(`検索結果: ${searchResponse.data?.products.length || 0}件`);
            
            // 並列処理で商品詳細を取得
            await fetchProductDetailsInParallel(
              searchResponse.data?.products || [],
              apiKey,
              signal,
              supabaseClient
            );

            if (searchResponse.data?.products.length === 0) {
              hasMoreProducts = false;
            } else {
              currentPage++;
            }

            // ページ間の待機時間を短縮（1000msに設定）
            if (!signal?.aborted) {
              await sleep(1000);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('商品データの検索中にエラーが発生:', errorMessage);
          throw new Error('商品データの検索に失敗しました。');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('バッチ処理中にエラーが発生:', errorMessage);
      throw new Error('バッチ処理に失敗しました。');
    }

    // バッチ処理の終了時刻を記録（日本時間）
    const endedAt = getJSTISOString();

    // バッチ処理履歴を更新（終了時）
    history = await updateBatchExecutionHistory(history.id, {
      ended_at: endedAt,
      status: 'completed'
    }, supabaseClient);

    log('バッチ処理が正常に完了しました');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('バッチ処理中にエラーが発生:', errorMessage);
    
    // エラー発生時も履歴を更新
    if (history) {
      const endedAt = getJSTISOString();
      await updateBatchExecutionHistory(history.id, {
        ended_at: endedAt,
        status: 'error',
        error_message: errorMessage
      }, supabaseClient);
    }
    
    throw new Error('バッチ処理に失敗しました。');
  }
}