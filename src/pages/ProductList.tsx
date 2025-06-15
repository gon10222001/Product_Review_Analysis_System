import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Platform, Product, SearchHistory, ProductListProps } from '../types';
import { SearchSidebar } from '../components/SearchSidebar';
import { SearchForm } from '../components/SearchForm';
import { SearchResults } from '../components/SearchResults';
import { ScrollToTopButton } from '../components/ScrollToTopButton';
import { SystemSettings } from '../components/SystemSettings';
import { logger } from '../lib/utils/logger';

/**
 * Product list page with search functionality
 */
export function ProductList({
  platform,
  setPlatform,
  viscosityGrade,
  setViscosityGrade,
  manufacturer,
  setManufacturer,
  productName,
  setProductName,
  showResults,
  setShowResults,
  filteredProducts,
  setFilteredProducts,
  scrollPosition,
  setScrollPosition,
  searchHistory,
  addToSearchHistory,
  productHistory,
  addToProductHistory,
  isSidebarOpen,
  setIsSidebarOpen,
  onHistoryItemClick,
  onProductHistoryItemClick,
  onDeleteSearchHistory,
  onDeleteProductHistory,
  onDeleteAllSearchHistory,
  onDeleteAllProductHistory,
  isLoading,
  error,
  setError,
  filterProducts,
  viscosityGrades,
  manufacturers
}: ProductListProps) {
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pageSize = 100;
  const [isSearching, setIsSearching] = useState(false);

  // サイドバーの表示状態を初期化
  useEffect(() => {
    setIsSidebarOpen(false);  // 初期状態では閉じた状態に設定
  }, []);

  // Restore scroll position when returning to results
  useEffect(() => {
    if (showResults && tableRef.current && scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [showResults, scrollPosition]);

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('検索開始:', { platform, productName, viscosityGrade, manufacturer });
    setIsSearching(true);
    setError(null);

    try {
      const params: SearchParams = {
        platform,
        productName,
        viscosityGrade,
        manufacturer,
        page: currentPage,
        pageSize
      };

      console.log('検索パラメータ:', params);
      const result = await filterProducts(params);
      console.log('検索結果:', result);

      setFilteredProducts(result.products);
      setTotalCount(result.totalCount);
      setShowResults(true);
      setCurrentPage(1);

      console.log('状態更新後:', {
        showResults: true,
        filteredProductsCount: result.products.length,
        totalCount: result.totalCount
      });

      // 検索履歴に追加
      await addToSearchHistory({
        platform,
        product_name: productName,
        viscosity_grade: viscosityGrade || null,
        manufacturer: manufacturer || null,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('検索エラー:', err);
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle page change
  const handlePageChange = async (newPage: number) => {
    try {
      setCurrentPage(newPage);
      const result = await filterProducts({ 
        platform,
        productName,
        viscosityGrade,
        manufacturer,
        page: newPage, 
        pageSize 
      });
      setFilteredProducts(result.products);
      setTotalCount(result.totalCount);
    } catch (error) {
      logger.error('ページ変更でエラーが発生しました', 'ProductList', { error });
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ページ変更中にエラーが発生しました');
      }
    }
  };

  // Clear search form
  const handleClear = () => {
    setViscosityGrade('');
    setManufacturer('');
    setProductName('');
    setFilteredProducts([]);
    setScrollPosition(0);
    setCurrentPage(1);
    setTotalCount(0);
    setError(null);
    setIsSearching(false);
    setShowResults(false);  // 検索結果の表示状態をリセット
    // サイドバーの表示状態はリセットしない
  };

  // Navigate to product detail page
  const handleRowDoubleClick = (product: Product) => {
    setScrollPosition(window.pageYOffset);
    addToProductHistory(product);
    navigate(`/product/${product.id}`, { 
      state: { 
        productName: product.name,
        imageUrl: product.image_url,
        viscosityGrade: product.viscosity_grade,
        manufacturer: product.manufacturer,
        platform: product.platform,
        price: product.price,
        averageRating: product.average_rating,
        reviewCount: product.review_count
      } 
    });
  };

  // 商品履歴のクリック処理
  const handleProductHistoryItemClick = (productId: string) => {
    console.log('商品履歴がクリックされました:', productId);
    const history = productHistory.find(h => h.product_id === productId);
    if (history) {
      setScrollPosition(window.pageYOffset);
      navigate(`/product/${productId}`, { 
        state: { 
          productName: history.product_name,
          imageUrl: history.image_url,
          platform: 'Amazon',  // 固定値
          viscosityGrade: null,
          manufacturer: null,
          price: null,
          averageRating: null,
          reviewCount: null
        } 
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* サイドバー */}
      <SearchSidebar 
        searchHistory={searchHistory}
        productHistory={productHistory}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onHistoryItemClick={onHistoryItemClick}
        onProductHistoryItemClick={handleProductHistoryItemClick}
        onDeleteSearchHistory={onDeleteSearchHistory}
        onDeleteProductHistory={onDeleteProductHistory}
        onDeleteAllSearchHistory={onDeleteAllSearchHistory}
        onDeleteAllProductHistory={onDeleteAllProductHistory}
      />

      {/* メインコンテンツ */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* タイトル */}
            <div className="flex items-center justify-between">
              <div className="h-[48px] flex items-center">
                <button
                  onClick={() => {
                    const openButton = document.querySelector('[aria-label="サイドバーを開く"]');
                    const closeButton = document.querySelector('[aria-label="サイドバーを閉じる"]');
                    console.log('開くボタンの位置:', openButton?.getBoundingClientRect());
                    console.log('閉じるボタンの位置:', closeButton?.getBoundingClientRect());
                    setIsSidebarOpen(!isSidebarOpen);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors h-[48px] flex items-center"
                  aria-label={isSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
                  style={{ marginTop: '-28px' }}  // 閉じるボタンと同じ位置に調整
                >
                  {isSidebarOpen ? (
                    <PanelLeftClose className="h-5 w-5 text-gray-500" />
                  ) : (
                    <PanelLeftOpen className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">商品レビュー分析システム</h1>
              <div className="flex items-center">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  aria-label="システム設定を開く"
                >
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">システム設定</span>
                </button>
              </div>
            </div>

            {/* 検索フォーム */}
            <SearchForm
              platform={platform}
              setPlatform={setPlatform}
              viscosityGrade={viscosityGrade}
              setViscosityGrade={setViscosityGrade}
              manufacturer={manufacturer}
              setManufacturer={setManufacturer}
              productName={productName}
              setProductName={setProductName}
              onSubmit={handleSearch}
              onClear={handleClear}
              isLoading={isLoading}
              viscosityGrades={viscosityGrades}
              manufacturers={manufacturers}
              error={error}
            />

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* 検索結果 */}
            {showResults && (
              <SearchResults
                products={filteredProducts}
                onRowDoubleClick={handleRowDoubleClick}
                isLoading={isLoading}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      <SystemSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}