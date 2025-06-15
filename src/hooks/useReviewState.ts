import { useState, useCallback, useEffect, useRef } from 'react';
import type { Review } from '../lib/schemas';

export interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: Error | null;
  isRetrying: boolean;
  currentPage: number;
  isAllReviewsFetched: boolean;
  wasCancelled: boolean;
  isCancellable: boolean;
}

const initialState: ReviewState = {
  reviews: [],
  isLoading: true,
  error: null,
  isRetrying: false,
  currentPage: 1,
  isAllReviewsFetched: false,
  wasCancelled: false,
  isCancellable: false
};

// コンポーネントIDごとの状態を保持するMap
const stateMap = new Map<string, ReviewState>();

/**
 * Custom hook for managing review state
 * @param componentId - コンポーネントの識別子（例: 'top' または 'detail'）
 */
export function useReviewState(componentId: string) {
  const [state, setState] = useState<ReviewState>(initialState);
  const isMounted = useRef(false);

  useEffect(() => {
    console.log(`[${componentId}] コンポーネントがマウントされました`);
    isMounted.current = true;

    const existingState = stateMap.get(componentId);
    if (existingState) {
      setState(existingState);
    } else {
      stateMap.set(componentId, initialState);
    }

    return () => {
      console.log(`[${componentId}] コンポーネントがアンマウントされました`);
      isMounted.current = false;
      if (componentId === 'top') {
        stateMap.delete(componentId);
        setState(initialState);
      }
    };
  }, [componentId]);

  const resetState = useCallback(() => {
    if (!isMounted.current) return;
    
    console.log(`[${componentId}] レビュー状態をリセットします`);
    const newState = { ...initialState };
    stateMap.set(componentId, newState);
    setState(newState);

    // トップ画面の場合、他のコンポーネントの状態は保持
    if (componentId === 'top') {
      stateMap.delete(componentId);
    }
  }, [componentId]);

  const updateState = useCallback((newState: ReviewState | ((prev: ReviewState) => ReviewState)) => {
    if (!isMounted.current) return;

    setState(prev => {
      const nextState = typeof newState === 'function' ? newState(prev) : newState;
      if (isMounted.current) {
        stateMap.set(componentId, nextState);
      }
      return nextState;
    });
  }, [componentId]);

  return {
    state,
    setState: updateState,
    resetState
  };
}