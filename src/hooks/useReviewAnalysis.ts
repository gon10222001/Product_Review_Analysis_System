import { useState, useEffect, useCallback, useRef } from 'react';
import type { Review } from '../lib/schemas';
import { analyzeReviewsWithOpenAI } from '../lib/openai';
import { useAbortController } from './useAbortController';

// 型定義
interface AnalysisResult {
  keyword?: string;
  positive: string[];
  negative: string[];
}

interface UseReviewAnalysisProps {
  reviews: Review[];
  isAllReviewsFetched: boolean;
  wasCancelled: boolean;
}

interface UseReviewAnalysisReturn {
  keyword1: string;
  setKeyword1: (value: string) => void;
  analysisResults: AnalysisResult[];
  isAnalyzing: boolean;
  error: Error | null;
  updateReviewPoints: () => Promise<void>;
  deleteAnalysisResult: (index: number) => void;
  shouldShowAnalysis: boolean;
  isInitialAnalysis: boolean;
}

// レビューを分割する関数
const splitReviews = (reviews: Review[], chunkSize: number = 10): Review[][] => {
  const chunks: Review[][] = [];
  for (let i = 0; i < reviews.length; i += chunkSize) {
    chunks.push(reviews.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * レビュー分析のカスタムフック
 */
export function useReviewAnalysis({
  reviews,
  isAllReviewsFetched,
  wasCancelled
}: UseReviewAnalysisProps): UseReviewAnalysisReturn {
  // State
  const [keyword1, setKeyword1] = useState('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialAnalysis, setIsInitialAnalysis] = useState(true);

  // Refs
  const { getSignal, cleanup, isAborted } = useAbortController();
  const analysisInProgressRef = useRef(false);
  const mountedRef = useRef(true);
  const prevReviewsRef = useRef<Review[]>([]);
  const prevIsAllReviewsFetchedRef = useRef(false);
  const prevWasCancelledRef = useRef(false);

  // レビュー分析の実行
  const analyzeWithOpenAI = useCallback(async () => {
    if (reviews.length === 0 || !mountedRef.current) {
      if (mountedRef.current) {
        setIsAnalyzing(false);
        analysisInProgressRef.current = false;
      }
      return;
    }

    try {
      setError(null);
      const reviewChunks = splitReviews(reviews);
      const results: AnalysisResult[] = [];
      
      for (const chunk of reviewChunks) {
        if (!mountedRef.current) return;
        
        try {
          const signal = getSignal();
          const chunkTexts = chunk.map(review => 
            `評価: ${review.rating}点\nタイトル: ${review.title}\n内容: ${review.content}`
          );
          const result = await analyzeReviewsWithOpenAI(chunkTexts, signal);
          if (result) {
            results.push(result);
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            console.log('Analysis aborted');
            continue;
          }
          throw err;
        }
      }
      
      if (mountedRef.current && results.length > 0) {
        const combinedResult: AnalysisResult = {
          positive: Array.from(new Set(results.flatMap(r => r.positive))).slice(0, 3),
          negative: Array.from(new Set(results.flatMap(r => r.negative))).slice(0, 3)
        };
        setAnalysisResults(prev => [...prev, combinedResult]);
      }
    } catch (err) {
      console.error('Error analyzing reviews:', err);
      if (mountedRef.current) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Analysis aborted');
        } else {
          setError(err instanceof Error ? err : new Error('レビューの分析中にエラーが発生しました'));
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsAnalyzing(false);
        analysisInProgressRef.current = false;
      }
    }
  }, [reviews, getSignal]);

  // レビュー状態の変更を監視
  useEffect(() => {
    if (isAnalyzing || analysisInProgressRef.current || reviews.length === 0) {
      return;
    }

    const shouldAnalyze = (
      (wasCancelled && !prevWasCancelledRef.current) ||
      (isAllReviewsFetched && !prevIsAllReviewsFetchedRef.current && !wasCancelled)
    );

    if (shouldAnalyze) {
      setIsAnalyzing(true);
      analysisInProgressRef.current = true;
      
      analyzeWithOpenAI().catch(err => {
        console.error('Failed to start analysis:', err);
        if (mountedRef.current) {
          setIsAnalyzing(false);
          analysisInProgressRef.current = false;
        }
      });
    }

    prevWasCancelledRef.current = wasCancelled;
    prevIsAllReviewsFetchedRef.current = isAllReviewsFetched;
    prevReviewsRef.current = [...reviews];
  }, [wasCancelled, isAllReviewsFetched, reviews, analyzeWithOpenAI]);

  // レビューが変更された時のリセット
  useEffect(() => {
    if (reviews.length === 0) {
      setAnalysisResults([]);
      setError(null);
      setIsAnalyzing(false);
      setIsInitialAnalysis(true);
      analysisInProgressRef.current = false;
      prevReviewsRef.current = [];
      prevIsAllReviewsFetchedRef.current = false;
      prevWasCancelledRef.current = false;
    }
  }, [reviews]);

  // コンポーネントのアンマウント時のクリーンアップ
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // 追加分析の実行
  const updateReviewPoints = useCallback(async () => {
    if (!reviews.length || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reviewChunks = splitReviews(reviews);
      const results: AnalysisResult[] = [];
      
      for (const chunk of reviewChunks) {
        if (!mountedRef.current) return;
        
        try {
          const signal = getSignal();
          const chunkTexts = chunk.map(review => 
            `評価: ${review.rating}点\nタイトル: ${review.title}\n内容: ${review.content}`
          );
          const result = await analyzeReviewsWithOpenAI(chunkTexts, signal, keyword1);
          if (result) {
            results.push(result);
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            console.log('Analysis aborted');
            continue;
          }
          throw err;
        }
      }
      
      if (mountedRef.current && results.length > 0) {
        const combinedResult: AnalysisResult = {
          positive: Array.from(new Set(results.flatMap(r => r.positive))).slice(0, 3),
          negative: Array.from(new Set(results.flatMap(r => r.negative))).slice(0, 3),
          keyword: keyword1
        };
        setAnalysisResults(prev => [...prev, combinedResult]);
        setIsInitialAnalysis(false);
      }
    } catch (err) {
      console.error('Error analyzing reviews:', err);
      if (mountedRef.current) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Analysis aborted');
        } else {
          setError(err instanceof Error ? err : new Error('レビューの分析中にエラーが発生しました'));
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, [reviews, isAnalyzing, getSignal, keyword1]);

  // 分析結果の削除
  const deleteAnalysisResult = useCallback((index: number) => {
    setAnalysisResults(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 分析結果の表示判定
  const shouldShowAnalysis = analysisResults.length > 0 && !error;

  return {
    keyword1,
    setKeyword1,
    analysisResults,
    isAnalyzing,
    error,
    updateReviewPoints,
    deleteAnalysisResult,
    shouldShowAnalysis,
    isInitialAnalysis
  };
}