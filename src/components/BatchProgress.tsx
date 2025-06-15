import React from 'react';
import { Product } from '../lib/schemas';
import { LoadingSpinner } from './Common/LoadingSpinner';

interface BatchProgressProps {
  current: number;
  total: number;
  status: 'processing' | 'completed' | 'error';
  error?: string;
  currentProduct?: Product;
}

export const BatchProgress: React.FC<BatchProgressProps> = ({
  current,
  total,
  status,
  error,
  currentProduct
}) => {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">バッチ処理の進捗</h2>
        <div className="text-sm text-gray-600">
          {current} / {total} 商品
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {status === 'processing' && (
          <div className="flex items-center space-x-2">
            <LoadingSpinner />
            <span className="text-gray-600">
              {currentProduct ? (
                `処理中: ${currentProduct.title}`
              ) : (
                '処理を開始しています...'
              )}
            </span>
          </div>
        )}

        {status === 'completed' && (
          <div className="text-green-600 font-medium">
            バッチ処理が完了しました
          </div>
        )}

        {status === 'error' && error && (
          <div className="text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}; 