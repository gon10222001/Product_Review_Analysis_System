import { Review } from '../types/review';

const REVIEWS_PER_PAGE = 10;

export const fetchAllProductReviews = async (
  productId: string,
  apiKey: string,
  options: {
    onProgress?: (reviews: Review[], hasMore: boolean, page: number) => void;
    signal?: AbortSignal;
  } = {}
): Promise<Review[]> => {
  const { onProgress, signal } = options;
  const allReviews: Review[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && !signal?.aborted) {
    try {
      const response = await fetchProductReviews({
        productId,
        page,
        limit: REVIEWS_PER_PAGE,
        sort: 'date_desc'
      });

      console.log(`API Response for page ${page}:`, {
        totalReviews: response.data.reviews.length,
        reviews: response.data.reviews.map(review => ({
          title: review.title,
          date: review.review_date,
          content: review.content.substring(0, 50) + '...'  // 長すぎる場合は省略
        }))
      });

      if (signal?.aborted) {
        throw new Error('Request was aborted');
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch reviews');
      }

      // 重複チェック
      const uniqueReviews = response.data.reviews.filter((newReview: Review) => 
        !allReviews.some(existingReview => 
          existingReview.title === newReview.title && 
          existingReview.content === newReview.content && 
          existingReview.rating === newReview.rating &&
          existingReview.review_date === newReview.review_date
        )
      );

      if (uniqueReviews.length > 0) {
        allReviews.push(...uniqueReviews);
        onProgress?.(uniqueReviews, response.data.hasMore, page);
      }

      hasMore = response.data.hasMore;
      page++;
    } catch (error) {
      if (error instanceof Error && error.message === 'Request was aborted') {
        throw error;
      }
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  return allReviews;
}; 