import React, { useCallback } from 'react';

const useReviews = () => {
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const [state, setState] = React.useState({
    isFetching: false,
    error: null,
    reviews: [],
    analysis: null
  });

  const abortFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState(prev => ({
        ...prev,
        isFetching: false,
        error: null,
        reviews: prev.reviews,
        analysis: null
      }));
    }
  }, []);

  const handleCleanup = useCallback(() => {
    console.log('=== レビュー取得の停止処理を開始 ===');
    console.log('1. AbortControllerのクリーンアップを実行');
    cleanup();
    console.log('2. リクエスト状態をリセット');
    requestInProgressRef.current = false;
    currentProductIdRef.current = null;
    lastRequestIdRef.current = null;
    console.log('3. 状態を更新');
    setState(prev => ({
      ...prev,
      wasCancelled: true,
      isLoading: false,
      error: null,
      isRetrying: false,
      isCancellable: false,
      reviews: prev.reviews,
      currentPage: prev.currentPage
    }));
    console.log('=== レビュー取得の停止処理が完了 ===');
  }, [cleanup, setState]);

  return {
    state,
    abortFetch
  };
};

export default useReviews; 