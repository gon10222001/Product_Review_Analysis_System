import React from 'react';

interface HeaderProps {
  resultCount: number;
}

export function Header({ resultCount }: HeaderProps) {
  return (
    <div className="px-4 py-2 border-b border-blue-100 flex items-center justify-between">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-900">検索結果</h3>
        <p className="ml-4 text-sm text-gray-600">商品をダブルクリックすると商品レビュー分析画面へ遷移します</p>
      </div>
      <div className="flex items-center">
        <p className="text-sm text-gray-600">{resultCount.toLocaleString()}件検索されました</p>
      </div>
    </div>
  );
}