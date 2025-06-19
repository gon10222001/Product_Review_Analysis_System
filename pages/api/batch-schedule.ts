import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabase';
import { logger } from '../../src/lib/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 有効なスケジュールを取得
    const { data: schedules, error: schedulesError } = await supabase
      .from('batch_schedule')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (schedulesError) {
      throw new Error(`Failed to get schedules: ${schedulesError.message}`);
    }

    if (!schedules || schedules.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: '実行するスケジュールがありません' 
      });
    }

    // 各スケジュールをチェックして実行
    const results = [];
    for (const schedule of schedules) {
      try {
        if (shouldExecuteSchedule(schedule.cron_expression)) {
          // バッチ処理履歴を作成
          const { data: history, error: historyError } = await supabase
            .from('batch_execution_history')
            .insert([{
              started_at: new Date().toISOString(),
              status: 'running'
            }])
            .select()
            .single();

          if (historyError) {
            throw new Error(`Failed to create batch history: ${historyError.message}`);
          }

          // 非同期でバッチ処理を実行
          executeBatchProcessAsync(history.id, schedule.id).catch(error => {
            logger.error('Async batch process error:', error);
          });

          results.push({
            schedule_id: schedule.id,
            schedule_name: schedule.name,
            execution_id: history.id,
            status: 'started'
          });
        }
      } catch (error) {
        logger.error(`Schedule execution error for ${schedule.name}:`, error);
        results.push({
          schedule_id: schedule.id,
          schedule_name: schedule.name,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'スケジュールチェック完了',
      results 
    });

  } catch (error) {
    console.error('Batch schedule error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'スケジュール実行中にエラーが発生しました。'
    });
  }
}

/**
 * スケジュールが実行すべきかチェック
 */
function shouldExecuteSchedule(cronExpression: string): boolean {
  const now = new Date();
  const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ');
  
  // 簡易的なcron式チェック（実際の実装ではcron-parserライブラリを使用）
  const currentMinute = now.getMinutes();
  const currentHour = now.getHours();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1; // getMonth()は0ベース
  const currentDayOfWeek = now.getDay(); // 0=日曜日

  return (
    matchesCronField(currentMinute, minute) &&
    matchesCronField(currentHour, hour) &&
    matchesCronField(currentDay, day) &&
    matchesCronField(currentMonth, month) &&
    matchesCronField(currentDayOfWeek, dayOfWeek)
  );
}

/**
 * cronフィールドのマッチング
 */
function matchesCronField(value: number, field: string): boolean {
  if (field === '*') return true;
  if (field.includes(',')) {
    return field.split(',').some(v => parseInt(v) === value);
  }
  if (field.includes('/')) {
    const [range, step] = field.split('/');
    const stepValue = parseInt(step);
    if (range === '*') {
      return value % stepValue === 0;
    }
  }
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(v => parseInt(v));
    return value >= start && value <= end;
  }
  return parseInt(field) === value;
}

/**
 * 非同期バッチ処理実行
 */
async function executeBatchProcessAsync(executionId: string, scheduleId: string): Promise<void> {
  const log = (message: string) => {
    console.log(`[Batch ${executionId}] ${message}`);
    logger.info(message, 'BatchProcess');
  };

  try {
    log('スケジュール実行によるバッチ処理を開始します...');

    // 1. APIキーの確認
    const apiKey = process.env.VITE_RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error('APIキーが環境変数に設定されていません。');
    }
    log('APIキーの確認完了');

    // 2. クエリの取得
    const { data: queries, error: queriesError } = await supabase
      .from('api_queries')
      .select('*');

    if (queriesError) {
      throw new Error(`クエリの取得に失敗しました: ${queriesError.message}`);
    }

    if (!queries || queries.length === 0) {
      throw new Error('実行するクエリがありません。');
    }
    log(`クエリを取得しました: ${queries.length}件`);

    // 3. 既存データの削除
    log('既存の商品データを削除中...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .not('prd_id', 'is', null);

    if (deleteError) {
      throw new Error(`商品データの削除に失敗しました: ${deleteError.message}`);
    }
    log('既存の商品データの削除が完了しました');

    // 4. 段階的にクエリを処理
    for (let queryIndex = 0; queryIndex < queries.length; queryIndex++) {
      const query = queries[queryIndex];
      log(`クエリ処理開始: ${query.api_query} (${queryIndex + 1}/${queries.length})`);

      let currentPage = 1;
      let hasMoreProducts = true;
      let totalProductsProcessed = 0;

      while (hasMoreProducts) {
        try {
          log(`ページ処理: ${query.api_query} - ページ${currentPage}`);

          // 商品検索
          const searchResponse = await searchProducts(query.api_query, apiKey, currentPage);
          
          if (!searchResponse.data?.products || searchResponse.data.products.length === 0) {
            hasMoreProducts = false;
            break;
          }

          log(`検索結果: ${searchResponse.data.products.length}件`);

          // 商品詳細を並列取得
          const processedCount = await processProductsInParallel(
            searchResponse.data.products,
            apiKey
          );

          totalProductsProcessed += processedCount;
          currentPage++;

          // 進捗を記録
          await updateBatchProgress(executionId, {
            query_index: queryIndex,
            current_page: currentPage,
            total_products_processed: totalProductsProcessed,
            status: 'processing'
          });

          // API制限を考慮して待機
          await sleep(1000);

        } catch (error) {
          log(`ページ処理エラー: ${error instanceof Error ? error.message : String(error)}`);
          currentPage++; // エラーでも次に進む
          await sleep(2000);
        }
      }

      log(`クエリ完了: ${query.api_query} - 合計${totalProductsProcessed}件処理`);
    }

    // 5. 処理完了
    await supabase
      .from('batch_execution_history')
      .update({
        ended_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', executionId);

    log('バッチ処理が正常に完了しました');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`バッチ処理エラー: ${errorMessage}`);

    // エラーを記録
    await supabase
      .from('batch_execution_history')
      .update({
        ended_at: new Date().toISOString(),
        status: 'error',
        error_message: errorMessage
      })
      .eq('id', executionId);
  }
}

/**
 * 商品検索
 */
async function searchProducts(query: string, apiKey: string, page: number): Promise<any> {
  const url = `https://amazon-product-reviews-keywords.p.rapidapi.com/product/search?keyword=${encodeURIComponent(query)}&country=JP&category=aps&page=${page}`;
  
  const response = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'amazon-product-reviews-keywords.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * 商品を並列処理
 */
async function processProductsInParallel(products: any[], apiKey: string): Promise<number> {
  const chunks = chunkArray(products, 3); // 3つずつ並列処理
  let processedCount = 0;

  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (product) => {
      try {
        const details = await getProductDetails(product.asin, apiKey);
        if (details) {
          await saveProduct(details);
          processedCount++;
        }
      } catch (error) {
        console.error(`商品詳細取得エラー: ${product.asin}`, error);
      }
    }));

    // チャンク間で待機
    await sleep(500);
  }

  return processedCount;
}

/**
 * 商品詳細取得
 */
async function getProductDetails(asin: string, apiKey: string): Promise<any> {
  const url = `https://amazon-product-reviews-keywords.p.rapidapi.com/product/details?asin=${asin}&country=JP`;
  
  const response = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'amazon-product-reviews-keywords.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

/**
 * 商品保存
 */
async function saveProduct(productData: any): Promise<void> {
  const product = {
    prd_id: productData.asin,
    name: productData.title,
    price: productData.price?.current_price || null,
    rating: productData.rating || null,
    review_count: productData.reviews_total || null,
    image_url: productData.thumbnail || null,
    url: productData.url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await supabase
    .from('products')
    .upsert([product], { onConflict: 'prd_id' });
}

/**
 * バッチ進捗更新
 */
async function updateBatchProgress(executionId: string, progress: any): Promise<void> {
  await supabase
    .from('batch_progress')
    .insert([{
      execution_id: executionId,
      ...progress,
      created_at: new Date().toISOString()
    }]);
}

/**
 * 配列をチャンクに分割
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 待機
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 