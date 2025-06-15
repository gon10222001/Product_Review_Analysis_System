import { Product } from '../schemas';
import { Review } from '../schemas';
import { analyzeReviews } from '../analysis/reviewAnalyzer';
import { saveAnalysisResults } from '../db/analysisResults';
import { logger } from '../utils/logger';
import { ApiError } from '../api/types';
import { fetchAllProductReviews } from '../api/reviews';
import { API_CONSTANTS } from '../api/constants';

interface BatchProgress {
  current: number;
  total: number;
  status: 'processing' | 'completed' | 'error';
  error?: string;
  currentProduct?: Product;
}

export class BatchProcessor {
  private products: Product[];
  private onProgress: (progress: BatchProgress) => void;
  private concurrency: number;
  private isCancelled: boolean;

  constructor(
    products: Product[],
    onProgress: (progress: BatchProgress) => void,
    concurrency: number = 10 // デフォルトの並列処理数を10に増やす
  ) {
    this.products = products;
    this.onProgress = onProgress;
    this.concurrency = concurrency;
    this.isCancelled = false;
  }

  async process(): Promise<void> {
    try {
      const total = this.products.length;
      let processed = 0;

      // 商品をチャンクに分割
      const chunks = this.chunkArray(this.products, this.concurrency);

      for (const chunk of chunks) {
        if (this.isCancelled) {
          logger.info('Batch processing cancelled by user', 'BatchProcessor');
          this.onProgress({
            current: processed,
            total,
            status: 'error',
            error: '処理がユーザーによりキャンセルされました'
          });
          return;
        }

        // チャンク内の商品を並列処理
        await Promise.all(chunk.map(async (product) => {
          if (this.isCancelled) return;

          try {
            this.onProgress({
              current: processed,
              total,
              status: 'processing',
              currentProduct: product
            });

            // レビュー取得
            const reviews = await this.fetchReviewsWithRetry(product.id);
            if (!reviews || reviews.length === 0) {
              logger.warn(`No reviews found for product: ${product.id}`, 'BatchProcessor');
              processed++;
              return;
            }

            // レビュー分析
            const analysisResults = await analyzeReviews(reviews, product.id);
            if (!analysisResults || analysisResults.length === 0) {
              logger.warn(`No analysis results for product: ${product.id}`, 'BatchProcessor');
              processed++;
              return;
            }

            // 分析結果の保存
            await saveAnalysisResults(analysisResults, product.id);

            processed++;
            this.onProgress({
              current: processed,
              total,
              status: 'processing',
              currentProduct: product
            });

          } catch (error) {
            logger.error(`Error processing product ${product.id}:`, error, 'BatchProcessor');
            // エラーが発生しても処理を継続
            processed++;
          }
        }));

        // API制限を考慮して、チャンク間で少し待機（50msに短縮）
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this.onProgress({
        current: processed,
        total,
        status: 'completed'
      });

    } catch (error) {
      logger.error('Error in batch processing:', error, 'BatchProcessor');
      this.onProgress({
        current: 0,
        total: this.products.length,
        status: 'error',
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      });
    }
  }

  private async fetchReviewsWithRetry(productId: string, maxRetries: number = 3): Promise<Review[]> {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await fetchAllProductReviews(
          productId,
          process.env.RAPIDAPI_KEY || '',
          {
            onProgress: (reviews, hasMore, currentPage) => {
              logger.info(`Fetched page ${currentPage} for product ${productId}`, 'BatchProcessor');
            },
            onError: (error) => {
              logger.error(`Error fetching reviews for product ${productId}:`, error, 'BatchProcessor');
            }
          }
        );
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw error;
        }
        // リトライ時の待機時間を最適化（500ms * retries）
        await new Promise(resolve => setTimeout(resolve, 500 * retries));
      }
    }
    return [];
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  cancel(): void {
    this.isCancelled = true;
  }
} 