import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing AbortController
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef<boolean>(true);

  const cleanup = useCallback(() => {
    console.log('AbortControllerのクリーンアップを実行します...');
    if (abortControllerRef.current) {
      try {
        console.log('AbortControllerを中断します...');
        abortControllerRef.current.abort();
        console.log('AbortControllerの中断が完了しました');
      } catch (error) {
        console.error('AbortControllerの中断中にエラーが発生しました:', error);
      }
      abortControllerRef.current = null;
    } else {
      console.log('中断するAbortControllerが存在しません');
    }
  }, []);

  const getSignal = useCallback((): AbortSignal => {
    if (!mountedRef.current) {
      console.log('コンポーネントがアンマウントされているため、新しいAbortControllerを作成できません');
      throw new Error('Cannot get signal after component unmount');
    }

    // 既存のAbortControllerをクリーンアップ
    cleanup();

    // 新しいAbortControllerを作成
    console.log('新しいAbortControllerを作成します...');
    abortControllerRef.current = new AbortController();
    console.log('新しいAbortControllerの作成が完了しました');
    return abortControllerRef.current.signal;
  }, [cleanup]);

  const isAborted = useCallback((): boolean => {
    const isAborted = !mountedRef.current ||
      !abortControllerRef.current ||
      abortControllerRef.current.signal.aborted;
    
    if (isAborted) {
      console.log('AbortControllerが中断されています');
    }
    
    return isAborted;
  }, []);

  useEffect(() => {
    console.log('AbortControllerの初期化を開始します...');
    mountedRef.current = true;
    return () => {
      console.log('AbortControllerのクリーンアップを開始します...');
      cleanup();
      mountedRef.current = false;
      console.log('AbortControllerのクリーンアップが完了しました');
    };
  }, [cleanup]);

  return {
    getSignal,
    cleanup,
    isAborted
  };
}