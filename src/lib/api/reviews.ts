/**
 * Review API handling utilities
 */

import { API_CONSTANTS } from './constants';
import { makeApiRequest } from './request';
import { createApiUrls } from './utils';
import { ApiError } from './error';
import type { Review, ReviewApiResponse } from './types';

/**
 * Map raw review data to Review type
 */
function mapReview(review: ReviewApiResponse['data']['reviews'][0]): Review {
  return {
    id: review.review_id,
    product_id: review.reviewed_product_asin,
    reviewer_name: review.review_author,
    rating: parseInt(review.review_star_rating),
    review_date: review.review_date,
    title: review.review_title,
    content: review.review_comment,
    helpful_count: review.helpful_vote_statement 
      ? parseInt(review.helpful_vote_statement.split(' ')[0]) 
      : 0,
    verified_purchase: review.is_verified_purchase,
    user_id: review.review_author_id || null,
    created_at: null,
    updated_at: null
  };
}

/**
 * Fetch reviews for a product
 */
export async function fetchProductReviews(
  productId: string,
  apiKey: string,
  page: number = 1,
  signal?: AbortSignal,
  onRetryStatusChange?: (isRetrying: boolean) => void
): Promise<{ reviews: Review[]; hasMore: boolean; totalPages: number }> {
  const url = createApiUrls.reviews(productId, page);
  
  // Log API request parameters
  console.log('API Request Parameters:', {
    productId,
    page,
    url,
    timestamp: new Date().toISOString()
  });

  const response = await makeApiRequest<ReviewApiResponse>(
    url,
    apiKey,
    { signal },
    signal,
    0,
    0,
    onRetryStatusChange
  );

  // Log detailed API response for debugging
  console.log('API Response Details:', {
    status: response?.status,
    request_id: response?.request_id,
    parameters: response?.parameters,
    data: {
      reviews_count: response?.data?.reviews?.length,
      reviews: response?.data?.reviews?.map(review => ({
        review_id: review.review_id,
        review_author: review.review_author,
        review_star_rating: review.review_star_rating,
        review_date: review.review_date,
        review_title: review.review_title,
        review_comment: review.review_comment?.substring(0, 100) + '...',
        is_verified_purchase: review.is_verified_purchase,
        helpful_vote_statement: review.helpful_vote_statement
      }))
    }
  });

  // Validate response structure
  if (!response?.data?.reviews) {
    throw new ApiError('APIレスポンスの形式が無効です');
  }

  const reviews = response.data.reviews.map(mapReview);
  // レビューが存在する場合は次のページを取得する
  const hasMore = reviews.length > 0;
  const totalPages = 1; // APIから総ページ数が返ってこないため、1ページとして扱う

  console.log(`ページ ${page} のAPI実行結果:`, {
    reviews_count: reviews.length,
    hasMore,
    totalPages
  });

  // 画面の表示値を取得してログ出力
  setTimeout(() => {
    const reviewListTitle = document.querySelector('.text-xl.font-bold.text-gray-900');
    const reviewCount = document.querySelector('.text-sm.text-gray-600');
    if (reviewListTitle && reviewCount) {
      console.log('画面の表示値:', {
        title: reviewListTitle.textContent,
        count: reviewCount.textContent
      });
    }
  }, 0);

  return { reviews, hasMore, totalPages };
}

/**
 * Fetch all reviews for a product across multiple pages
 */
export async function fetchAllProductReviews(
  productId: string,
  apiKey: string,
  options?: {
    onProgress?: (reviews: Review[], hasMore: boolean, currentPage: number) => void;
    onError?: (error: Error | ApiError) => void;
  },
  signal?: AbortSignal
): Promise<Review[]> {
  const allReviews: Review[] = [];
  let currentPage = 1;
  let hasMoreReviews = true;
  const MAX_PAGES = 100; // 最大ページ数を100に制限

  try {
    while (hasMoreReviews && currentPage <= MAX_PAGES) {
      // 中断チェックを最初に行う
      if (signal?.aborted) {
        console.log('レビュー取得が中断されました');
        throw new Error('AbortError');
      }

      const { reviews, hasMore } = await fetchProductReviews(
        productId,
        apiKey,
        currentPage,
        signal
      );

      // 中断チェックを再度行う
      if (signal?.aborted) {
        console.log('レビュー取得が中断されました');
        throw new Error('AbortError');
      }

      // レビューが存在する場合は次のページを取得する
      hasMoreReviews = reviews.length > 0;

      if (reviews.length > 0) {
        allReviews.push(...reviews);
        options?.onProgress?.(reviews, hasMoreReviews, currentPage);
      }

      if (!hasMoreReviews) {
        console.log('レビューが存在しないため、取得を終了します');
        break;
      }

      // ページ間の待機時間を設定（API制限対策）
      if (hasMoreReviews) {
        try {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, 1000); // 1秒待機
            signal?.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('AbortError'));
            }, { once: true });
          });
        } catch (error) {
          if (error instanceof Error && error.message === 'AbortError') {
            console.log('レビュー取得が中断されました');
            throw error;
          }
        }
      }

      currentPage++;
    }

    return allReviews;
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error.message === 'AbortError')) {
      console.log('レビュー取得が中断されました');
      throw error;
    }

    const apiError = error instanceof ApiError ? error : new ApiError(
      error instanceof Error ? error.message : 'レビューの取得中にエラーが発生しました。'
    );

    if (options?.onError) {
      options.onError(apiError);
    }

    throw apiError;
  }
}