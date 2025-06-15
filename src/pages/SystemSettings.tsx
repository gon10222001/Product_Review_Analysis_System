import React, { useState, useRef } from 'react';
import { XCircle } from 'lucide-react';
import { BatchProcessor } from '../utils/BatchProcessor';
import { BatchProgress } from '../components/BatchProgress';

const SystemSettings: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [concurrency, setConcurrency] = useState(10); // デフォルトの並列処理数を10に変更
  const batchProcessorRef = useRef<BatchProcessor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState([]); // Assuming products is an empty array initially

  const handleStartBatch = async () => {
    if (!products || products.length === 0) {
      setError('商品が登録されていません');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(null);

    try {
      batchProcessorRef.current = new BatchProcessor(
        products,
        (progress) => {
          setProgress(progress);
          if (progress.status === 'completed' || progress.status === 'error') {
            setIsProcessing(false);
          }
        },
        concurrency
      );

      await batchProcessorRef.current.process();
    } catch (error) {
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
      setIsProcessing(false);
    }
  };

  const handleCancelBatch = () => {
    if (batchProcessorRef.current) {
      batchProcessorRef.current.cancel();
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">システム設定</h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">バッチ処理設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    並列処理数
                  </label>
                  <select
                    value={concurrency}
                    onChange={(e) => setConcurrency(Number(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    disabled={isProcessing}
                  >
                    {[5, 10, 15, 20, 25, 30].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    一度に処理する商品の数です。サーバーの負荷やAPI制限を考慮して設定してください。
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleStartBatch}
                    disabled={isProcessing || !products || products.length === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    バッチ即時起動
                  </button>

                  {isProcessing && (
                    <button
                      onClick={handleCancelBatch}
                      className="inline-flex items-center px-4 py-2 border border-red-500 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      処理を中止
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {progress && (
              <BatchProgress
                current={progress.current}
                total={progress.total}
                status={progress.status}
                error={progress.error}
                currentProduct={progress.currentProduct}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings; 