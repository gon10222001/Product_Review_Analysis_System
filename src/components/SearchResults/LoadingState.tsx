import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg shadow-blue-100/50 overflow-hidden flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin relative z-10" />
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-medium">検索中</p>
          <p className="text-sm text-gray-500 mt-1">商品情報を取得しています...</p>
        </div>
      </div>
    </div>
  );
}