import React from 'react';
import { X, FileDown } from 'lucide-react';

interface HeaderProps {
  onExportCSV: () => void;
  onBack: () => void;
}

export function Header({ onExportCSV, onBack }: HeaderProps) {
  return (
    <header className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="w-24"></div>
          <h1 className="text-[32px] font-bold text-[#333333] text-center">商品レビュー分析</h1>
          <div className="flex space-x-2">
            <button
              onClick={onExportCSV}
              className="inline-flex items-center px-4 py-2 border border-blue-500 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              aria-label="CSVファイルをダウンロード"
            >
              <FileDown className="mr-2 h-4 w-4" />
              CSV出力
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <X className="mr-2 h-4 w-4" />
              戻る
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}