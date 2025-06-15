import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Product } from '../types';
import { ScrollToTopButton } from '../components/ScrollToTopButton';
import { generateProductCSV, downloadCSV } from '../utils/csvExport';
import { useReviewAnalysis } from '../hooks/useReviewAnalysis';
import { useReviews } from '../hooks/useReviews';
import { ReviewAnalysis } from '../components/ReviewAnalysis';
import { Header } from '../components/ProductDetail/Header';
import { ProductInfo } from '../components/ProductDetail/ProductInfo';
import { ReviewList } from '../components/ProductDetail/ReviewList';
import { useProductHistory } from '../hooks/useProductHistory';
import { logger } from '../lib/utils/logger';

// 型定義
interface ProductDetailProps {
  addToProductHistory: (product: Product) => void;
}

interface ProductState {
  productName: string;
  platform: string;
  imageUrl?: string;
  viscosityGrade?: string;
  manufacturer?: string;
  price?: number;
  averageRating?: number;
  reviewCount?: number | null;
}

/**
 * 商品詳細ページコンポーネント
 */
export function ProductDetail({ addToProductHistory }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const productHistoryAddedRef = useRef(false);

  // レビュー関連の状態管理
  const { 
    reviews, 
    isLoading: isLoadingReviews, 
    isRetrying, 
    error: reviewError, 
    isAllReviewsFetched,
    isCancellable,
    currentPage,
    loadReviews,
    cleanup,
    wasCancelled: reviewWasCancelled 
  } = useReviews('detail');

  // レビュー分析関連の状態管理
  const {
    keyword1,
    setKeyword1,
    analysisResults,
    isAnalyzing,
    error: analysisError,
    updateReviewPoints,
    deleteAnalysisResult,
    shouldShowAnalysis,
    isInitialAnalysis
  } = useReviewAnalysis({
    reviews,
    isAllReviewsFetched,
    wasCancelled: reviewWasCancelled
  });

  const productState = location.state as ProductState;

  // 商品履歴の追加
  useEffect(() => {
    if (!id || !productState || productHistoryAddedRef.current) {
      return;
    }

    productHistoryAddedRef.current = true;
    logger.info('Adding product to history', 'ProductDetail', { productId: id });

    addToProductHistory({
      id: id,
      name: productState.productName,
      image_url: productState.imageUrl,
      viscosity_grade: productState.viscosityGrade,
      manufacturer: productState.manufacturer,
      platform: productState.platform as any,
      price: productState.price,
      average_rating: productState.averageRating,
      review_count: productState.reviewCount,
      sales_volume: null,
      order: 0
    });
  }, [id, productState, addToProductHistory]);

  // レビューの取得
  useEffect(() => {
    if (!id || !productState || isInitialized) {
      return;
    }

    setIsInitialized(true);
    logger.info('Initializing product reviews', 'ProductDetail', { productId: id });
    loadReviews(id);

    return () => {
      cleanup();
    };
  }, [id, productState]);

  /**
   * CSVエクスポート処理
   */
  const handleExportCSV = () => {
    if (!reviews.length || !productState) {
      return;
    }

    // 最新の分析結果からポジティブポイントとネガティブポイントを取得
    const latestAnalysis = analysisResults[analysisResults.length - 1];
    const positivePoints = latestAnalysis?.positive || [];
    const negativePoints = latestAnalysis?.negative || [];

    const csvData = generateProductCSV(
      {
        productName: productState.productName,
        platform: productState.platform,
        imageUrl: productState.imageUrl,
        viscosityGrade: productState.viscosityGrade,
        manufacturer: productState.manufacturer,
        price: productState.price,
        averageRating: productState.averageRating,
        reviewCount: productState.reviewCount
      },
      reviews,
      positivePoints,
      negativePoints
    );
    downloadCSV(csvData, `reviews_${id}.csv`);
  };

  /**
   * 戻るボタン処理
   */
  const handleBack = () => {
    navigate(-1);
  };

  if (!id || !productState) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-500">商品情報が見つかりません。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header onExportCSV={handleExportCSV} onBack={handleBack} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <ProductInfo
          productName={productState.productName}
          imageUrl={productState.imageUrl}
          platform={productState.platform as any}
          manufacturer={productState.manufacturer}
          viscosityGrade={productState.viscosityGrade}
          price={productState.price}
          averageRating={productState.averageRating}
          reviewCount={productState.reviewCount}
        />

        <section className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">レビュー分析</h2>
          </div>
          
          {productState.platform !== 'Amazon' ? (
            <div className="h-32 flex items-center justify-center text-gray-500">
              Amazonの商品のみレビュー分析が可能です
            </div>
          ) : reviewError ? (
            <div className="h-32 flex items-center justify-center text-red-500">
              {reviewError.message}
            </div>
          ) : isLoadingReviews ? (
            <div className="h-32 flex items-center justify-center text-gray-500">
              {isRetrying ? 'RapidAPIサーバーが混雑しています。自動的に再試行します...' : 'レビュー情報の取得中です'}
            </div>
          ) : reviews && reviews.length === 0 && !reviewError ? (
            <div className="h-32 flex items-center justify-center text-gray-500">
              表示するレビューがありません
            </div>
          ) : (
            <ReviewAnalysis
              analysisResults={analysisResults}
              isAnalyzing={isAnalyzing}
              isInitialAnalysis={isInitialAnalysis}
              error={analysisError}
              onUpdate={updateReviewPoints}
              keyword1={keyword1}
              setKeyword1={setKeyword1}
              onDeleteResult={deleteAnalysisResult}
            />
          )}
        </section>

        {productState.platform === 'Amazon' && (
          <ReviewList
            reviews={reviews}
            currentPage={currentPage}
            isLoading={isLoadingReviews}
            isCancellable={isCancellable}
            hasMorePages={!isAllReviewsFetched}
            wasCancelled={reviewWasCancelled}
            onCleanup={cleanup}
            isAllReviewsFetched={isAllReviewsFetched}
            error={reviewError}
            onRetry={() => loadReviews(id)}
            isRetrying={isRetrying}
          />
        )}

        <ScrollToTopButton />
      </main>
    </div>
  );
}