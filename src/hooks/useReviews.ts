import { useCallback, useEffect, useRef } from 'react';
import { useReviewState } from './useReviewState';
import { useAbortController } from './useAbortController';
import { fetchAllProductReviews } from '../lib/api/reviews';
import { ApiError } from '../lib/api/error';
import { Review } from '../lib/schemas';

/**
 * Custom hook for managing product reviews
 */
export function useReviews(componentId: string) {
  const {
    state: { reviews, isLoading, error, isRetrying, wasCancelled, isCancellable, currentPage, isAllReviewsFetched },
    setState,
    resetState
  } = useReviewState(componentId);
  const { getSignal, cleanup, isAborted } = useAbortController();
  const isMountedRef = useRef(true);
  const currentProductIdRef = useRef<string | null>(null);
  const requestInProgressRef = useRef(false);
  const retryCountRef = useRef(0);
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const lastRequestIdRef = useRef<number | null>(null);
  const accumulatedReviewsRef = useRef<Review[]>([]);

  // レビューを日付の降順でソートし、重複を除去する関数
  const sortAndDeduplicateReviews = useCallback((reviews: Review[]): Review[] => {
    // 重複を除去（タイトル、内容、評価、日付が同じものを重複とみなす）
    const uniqueReviews = Array.from(new Map(
      reviews.map(review => [
        `${review.title}-${review.content}-${review.rating}-${review.review_date}`,
        review
      ])
    ).values());

    // 日付の降順でソート
    return uniqueReviews.sort((a, b) => {
      const dateA = new Date(a.review_date.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日.*/, '$1/$2/$3'));
      const dateB = new Date(b.review_date.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日.*/, '$1/$2/$3'));
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  // レビューの表示を更新する関数
  const updateReviewDisplay = useCallback((sortedReviews: Review[], page: number | '完了') => {
    if (!isMountedRef.current) return;

    console.log('=== レビュー表示を更新します ===');
    console.log('表示するレビュー数:', sortedReviews.length);

    setState(prev => ({
      ...prev,
      reviews: sortedReviews,
      isLoading: false,
      isCancellable: false,
      isAllReviewsFetched: true,
      currentPage: typeof page === 'number' ? page : prev.currentPage
    }));
  }, [setState]);

  const handleCleanup = useCallback(() => {
    if (!isMountedRef.current) return;

    console.log('=== レビュー取得の停止処理を開始 ===');
    cleanup();
    requestInProgressRef.current = false;
    currentProductIdRef.current = null;
    lastRequestIdRef.current = null;

    if (accumulatedReviewsRef.current.length > 0) {
      const sortedReviews = sortAndDeduplicateReviews(accumulatedReviewsRef.current);
      updateReviewDisplay(sortedReviews, '完了');
    }

    console.log('=== レビュー取得の停止処理が完了 ===');
  }, [cleanup, updateReviewDisplay, sortAndDeduplicateReviews]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      handleCleanup();
    };
  }, [handleCleanup]);

  const loadReviews = useCallback(async (productId: string) => {
    if (wasCancelled || !isMountedRef.current) return;

    const currentRequestId = Date.now();

    try {
      cleanup();
      requestInProgressRef.current = false;
      currentProductIdRef.current = null;
      lastRequestIdRef.current = null;

      currentProductIdRef.current = productId;
      requestInProgressRef.current = true;
      lastRequestIdRef.current = currentRequestId;
      accumulatedReviewsRef.current = [];

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        isRetrying: false,
        wasCancelled: false,
        isCancellable: true,
        isAllReviewsFetched: false,
        currentPage: 1
      }));

      const reviews = await fetchAllProductReviews(
        productId,
        apiKey,
        {
          onProgress: (newReviews, hasMore, page) => {
            if (!isMountedRef.current || lastRequestIdRef.current !== currentRequestId) return;

            accumulatedReviewsRef.current = [...accumulatedReviewsRef.current, ...newReviews];
            const sortedReviews = sortAndDeduplicateReviews(accumulatedReviewsRef.current);
            
            setState(prev => ({
              ...prev,
              reviews: sortedReviews,
              currentPage: page,
              isAllReviewsFetched: !hasMore
            }));
          },
          onError: (error) => {
            if (!isMountedRef.current || lastRequestIdRef.current !== currentRequestId) return;
            setState(prev => ({
              ...prev,
              error,
              isLoading: false,
              isCancellable: false
            }));
          }
        },
        getSignal()
      );

      if (!isMountedRef.current || lastRequestIdRef.current !== currentRequestId) return;

      const sortedReviews = sortAndDeduplicateReviews(reviews);
      updateReviewDisplay(sortedReviews, '完了');

    } catch (error) {
      if (!isMountedRef.current || lastRequestIdRef.current !== currentRequestId) return;

      if (error instanceof Error && error.name === 'AbortError') {
        console.log('レビュー取得が中断されました');
        return;
      }

      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('レビューの取得中にエラーが発生しました'),
        isLoading: false,
        isCancellable: false
      }));
    } finally {
      if (isMountedRef.current && lastRequestIdRef.current === currentRequestId) {
        requestInProgressRef.current = false;
      }
    }
  }, [apiKey, cleanup, getSignal, setState, sortAndDeduplicateReviews, updateReviewDisplay, wasCancelled]);

  return {
    reviews,
    isLoading,
    error,
    isRetrying,
    wasCancelled,
    isCancellable,
    currentPage,
    isAllReviewsFetched,
    loadReviews,
    cleanup: handleCleanup
  };
}