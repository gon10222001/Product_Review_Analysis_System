import { executeBatchProcess } from '../lib/api/batch';
import { supabase } from '../lib/api/supabase';

// AbortControllerのインスタンスをスコープ外で定義
let controller: AbortController | null = null;
let isAborted = false;

// メインスレッドとの通信を処理
self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === 'start') {
    try {
      // Supabase接続テスト
      const { error: testError } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true });

      if (testError) {
        throw new Error('Failed to connect to Supabase');
      }

      // バッチ処理開始
      postMessage({ type: 'log', data: '処理を開始します...' });
      // バッチ処理の開始
      controller = new AbortController();
      const signal = controller.signal;
      isAborted = false;

      // ログをメインスレッドに送信する関数
      const sendLog = (message: string) => {
        self.postMessage({ type: 'log', data: message });
      };

      try {
        // スリープモードでも処理が継続するように、定期的にメッセージを送信
        const keepAliveInterval = setInterval(() => {
          if (!isAborted) {
            self.postMessage({ type: 'keepAlive' });
          }
        }, 30000); // 30秒ごとにキープアライブメッセージを送信

        await executeBatchProcess(sendLog, signal, supabase);
        
        clearInterval(keepAliveInterval);
        
        if (!isAborted) {
          self.postMessage({ type: 'complete' });
        }
      } catch (error) {
        if (!isAborted) {
          self.postMessage({ type: 'error', data: error instanceof Error ? error.message : String(error) });
        }
      } finally {
        controller = null;
      }
    } catch (error) {
      if (!isAborted) {
        self.postMessage({ type: 'error', data: error instanceof Error ? error.message : String(error) });
      }
    }
  } else if (type === 'abort') {
    // バッチ処理の中断
    if (controller) {
      isAborted = true;
      controller.abort();
      self.postMessage({ type: 'aborted' });
    }
  }
}; 