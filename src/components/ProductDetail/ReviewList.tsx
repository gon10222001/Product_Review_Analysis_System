import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { Review } from '../../lib/schemas';
import { ReviewItem } from './ReviewItem';
import { ApiError } from '../../lib/api/types';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface ReviewListProps {
  reviews: Review[];
  currentPage: number;
  isLoading: boolean;
  isCancellable: boolean;
  hasMorePages: boolean;
  wasCancelled: boolean;
  onCleanup: () => void;
  isAllReviewsFetched: boolean;
  error: ApiError | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  currentPage,
  isLoading,
  isCancellable,
  hasMorePages,
  wasCancelled,
  onCleanup,
  isAllReviewsFetched,
  error,
  onRetry,
  isRetrying
}) => {
  const showCancelButton = isLoading && !wasCancelled && !isAllReviewsFetched;
  const errorMessage = error instanceof Error ? error.message : null;

  useEffect(() => {
    if (isLoading && !wasCancelled && !isAllReviewsFetched) {
      console.log('レビュー情報を取得中です...');
    }
  }, [isLoading, wasCancelled, isAllReviewsFetched]);

  useEffect(() => {
    if (errorMessage) {
      console.log('エラーメッセージ:', errorMessage);
      if (errorMessage.includes('RapidAPIサーバーが混雑しています')) {
        console.log('RapidAPIサーバーが混雑しています。自動的に再試行します...');
      }
    }
  }, [errorMessage]);

  useEffect(() => {
    if (wasCancelled) {
      console.log('レビューの取得がキャンセルされました。');
    }
  }, [wasCancelled]);

  useEffect(() => {
    if (isAllReviewsFetched) {
      if (reviews.length === 0) {
        console.log('全てのレビューを取得しました。（条件1: APIから空のレスポンスが返ってきた）');
      } else if (!hasMorePages) {
        console.log('全てのレビューを取得しました。（条件2: APIが次のページがないと返した）');
      } else {
        console.log('全てのレビューを取得しました。（条件3: 全ページの取得とソートが完了）');
      }
    }
  }, [isAllReviewsFetched, reviews.length, hasMorePages]);

  useEffect(() => {
    if (reviews.length === 0 && !isLoading && !errorMessage) {
      console.log('レビューがありません。');
    }
  }, [reviews.length, isLoading, errorMessage]);

  const renderContent = () => {
    if (isLoading) {
      console.log('レビュー情報を取得中です...');
      return (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">レビュー情報を取得中です...</div>
        </div>
      );
    }

    if (wasCancelled && reviews.length > 0) {
      console.log('レビューの取得がキャンセルされました。');
      return (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">レビューの取得がキャンセルされました。</div>
        </div>
      );
    }

    if (error) {
      console.log('レビューの取得中にエラーが発生しました:', error.message);
      return (
        <div className="flex justify-center items-center h-32">
          <div className="text-red-500">レビューの取得中にエラーが発生しました: {error.message}</div>
        </div>
      );
    }

    if (!reviews || reviews.length === 0) {
      console.log('レビューがありません。');
      return (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">レビューがありません。</div>
        </div>
      );
    }

    if (isAllReviewsFetched) {
      console.log('全てのレビューを取得しました。');
    }
  }

  if (error) {
    console.log('Error in ReviewList:', error);
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        <p className="font-medium">エラーが発生しました</p>
        <div className="text-sm mt-1 space-y-1">
          <p className="whitespace-pre-wrap">{error.message}</p>
          {error.status && (
            <p className="text-gray-600">ステータスコード: {error.status}</p>
          )}
          {error.code && (
            <p className="text-gray-600">エラーコード: {error.code}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">レビュー一覧</h2>
          {reviews.length > 0 && (
            <span className="text-sm text-gray-600">
              {wasCancelled ? (
                <>
                  {reviews.length}件
                  <span className="text-red-500 ml-2">※レビュー情報の取得をキャンセルしました</span>
                </>
              ) : isAllReviewsFetched ? (
                `${reviews.length}件`
              ) : (
                `表示中: ${reviews.length}件 (現在 ${currentPage}ページ目)`
              )}
            </span>
          )}
        </div>
        {showCancelButton && (
          <button
            onClick={onCleanup}
            className="inline-flex items-center px-4 py-2 border border-red-500 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <XCircle className="mr-2 h-4 w-4" />
            レビュー取得を中止
          </button>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}

        {isLoading && !wasCancelled && !isAllReviewsFetched && (
          <div className="flex justify-center py-2">
            <LoadingSpinner />
          </div>
        )}

        {!hasMorePages && reviews.length > 0 && (
          <div className="flex justify-center py-4 text-gray-500">
            すべてのレビューを表示しました（合計 {reviews.length} 件）
          </div>
        )}
      </div>
    </section>
  );
};