import React from 'react';
import { SearchResultsProps } from '../../types';
import { Header } from './Header';
import { Table } from './Table';
import { LoadingState } from './LoadingState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Component to display search results in a table
 */
export function SearchResults({
  products,
  onRowDoubleClick,
  isLoading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange
}: SearchResultsProps) {
  const tableRef = React.useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <LoadingState />;
  }

  // productsが配列でない場合は空の配列を使用
  const safeProducts = Array.isArray(products) ? products : [];

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg shadow-blue-100/50 overflow-hidden flex-1 flex flex-col">
      <Header resultCount={totalCount} />
      <div className="flex-1">
        <Table 
          products={safeProducts}
          onRowDoubleClick={onRowDoubleClick}
          tableRef={tableRef}
        />
      </div>
      {/* ページネーション */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-blue-100 bg-white/50">
          <div className="text-sm text-gray-600">
            {startItem} - {endItem} / {totalCount}件
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}