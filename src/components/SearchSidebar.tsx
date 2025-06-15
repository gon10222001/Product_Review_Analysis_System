import React, { useState } from 'react';
import { History, PanelLeftClose, ShoppingBag, X, Trash2, ChevronDown } from 'lucide-react';
import { SearchSidebarProps } from '../types';
import { formatDate } from '../utils/formatters';
import { formatSearchCondition } from '../utils/formatters.tsx';
import { ConfirmDialog } from './ConfirmDialog';
import { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type SearchHistory = Tables['search_history']['Row'];
type ProductHistory = Tables['product_history']['Row'];

/**
 * Sidebar component that displays search history and product history
 */
export function SearchSidebar({ 
  searchHistory, 
  productHistory,
  isSidebarOpen, 
  setIsSidebarOpen, 
  onHistoryItemClick,
  onProductHistoryItemClick,
  onDeleteSearchHistory,
  onDeleteProductHistory,
  onDeleteAllSearchHistory,
  onDeleteAllProductHistory
}: SearchSidebarProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProductConfirmDialog, setShowProductConfirmDialog] = useState(false);
  const [visibleProductCount, setVisibleProductCount] = useState(3);
  const [visibleSearchCount, setVisibleSearchCount] = useState(3);

  const handleDeleteAllSearch = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDeleteAllSearch = () => {
    onDeleteAllSearchHistory();
    setShowConfirmDialog(false);
  };

  const handleDeleteAllProduct = () => {
    setShowProductConfirmDialog(true);
  };

  const handleConfirmDeleteAllProduct = () => {
    onDeleteAllProductHistory();
    setShowProductConfirmDialog(false);
  };

  const handleShowMoreProducts = () => {
    setVisibleProductCount(prev => prev + 3);
  };

  const handleShowMoreSearch = () => {
    setVisibleSearchCount(prev => prev + 3);
  };

  return (
    <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-80 bg-white/80 backdrop-blur-sm shadow-lg transition-transform duration-300 ease-in-out z-50 flex flex-col`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between h-[48px]">
          <div className="flex items-center">
            <History className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">履歴</h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors h-[48px] flex items-center"
            aria-label="サイドバーを閉じる"
          >
            <PanelLeftClose className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* 閲覧した商品セクション */}
        {productHistory.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <ShoppingBag className="h-4 w-4 text-blue-500 mr-2" />
                <h3 className="text-sm font-semibold text-gray-700">閲覧した商品</h3>
              </div>
              <button
                onClick={handleDeleteAllProduct}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                aria-label="商品履歴を全て削除"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                一括削除
              </button>
            </div>
            <div className="space-y-3">
              {productHistory.slice(0, visibleProductCount).map((history) => (
                <div
                  key={history.id}
                  className="relative p-4 rounded-lg hover:bg-blue-50 transition-colors group border border-gray-100"
                >
                  <button
                    onClick={() => onProductHistoryItemClick(history.product_id)}
                    className="w-full text-left"
                    aria-label={`商品履歴: ${history.product_name || '不明な商品'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-gray-100">
                          <img 
                            src={history.image_url || 'https://images.unsplash.com/photo-1635274605638-d44babc08a4f?w=150&h=150&fit=crop&q=80'} 
                            alt={history.product_name || '商品画像'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1635274605638-d44babc08a4f?w=150&h=150&fit=crop&q=80';
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Amazon
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(history.updated_at)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {history.product_name || '不明な商品'}
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => onDeleteProductHistory(history.id)}
                    className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 hover:text-red-700 transition-all"
                    aria-label="この商品履歴を削除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {productHistory.length > visibleProductCount && (
                <button
                  onClick={handleShowMoreProducts}
                  className="w-full py-2 px-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-1 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <span>さらに表示</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 検索履歴セクション */}
        {searchHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <History className="h-4 w-4 text-blue-500 mr-2" />
                <h3 className="text-sm font-semibold text-gray-700">検索履歴</h3>
              </div>
              <button
                onClick={handleDeleteAllSearch}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                aria-label="検索履歴を全て削除"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                一括削除
              </button>
            </div>
            <div className="space-y-3">
              {searchHistory
                .slice()
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, visibleSearchCount)
                .map((history) => (
                <div
                  key={history.id}
                  className="relative p-4 rounded-lg hover:bg-blue-50 transition-colors group border border-gray-100"
                >
                  <button
                    onClick={() => onHistoryItemClick(history)}
                    className="w-full text-left"
                    aria-label={`検索履歴: ${history.platform} ${history.product_name}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <History className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(history.updated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {formatSearchCondition("プラットフォーム", history.platform)}
                      {formatSearchCondition("商品名", history.product_name)}
                      {history.platform === 'Amazon' && (
                        <>
                          {formatSearchCondition("粘度グレード", history.viscosity_grade)}
                          {formatSearchCondition("メーカー", history.manufacturer)}
                        </>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => onDeleteSearchHistory(history.id)}
                    className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 hover:text-red-700 transition-all"
                    aria-label="この検索履歴を削除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {searchHistory.length > visibleSearchCount && (
                <button
                  onClick={handleShowMoreSearch}
                  className="w-full py-2 px-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-1 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <span>さらに表示</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmDeleteAllSearch}
        title="検索履歴の削除"
        message="全ての検索履歴を削除してもよろしいですか？"
        confirmText="削除"
        cancelText="キャンセル"
      />

      <ConfirmDialog
        isOpen={showProductConfirmDialog}
        onClose={() => setShowProductConfirmDialog(false)}
        onConfirm={handleConfirmDeleteAllProduct}
        title="商品履歴の削除"
        message="全ての商品履歴を削除してもよろしいですか？"
        confirmText="削除"
        cancelText="キャンセル"
      />
    </div>
  );
}