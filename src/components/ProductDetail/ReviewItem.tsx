import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { StarRating } from '../StarRating';
import { Review } from '../../types';

interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  const formatReviewDate = (dateStr: string) => {
    try {
      // Extract date from Japanese string (e.g. "2025年4月13日に日本でレビュー済み")
      const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (match) {
        const [, year, month, day] = match;
        // Format as yyyy/mm/dd
        return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
      }
      return '日付不明';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '日付不明';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <StarRating rating={review.rating} />
          <span className="font-medium">{review.rating}</span>
        </div>
        <div className="text-sm text-gray-500">
          {formatReviewDate(review.review_date)}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h3>
      
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm text-gray-600">
          {review.reviewer_name}
        </span>
        {review.verified_purchase && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            認証済み購入
          </span>
        )}
      </div>
      
      <p className="text-gray-700 mb-3 whitespace-pre-line">
        {review.content}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((image, index) => (
            <div key={index} className="w-20 h-20 rounded overflow-hidden">
              <img
                src={image}
                alt={`レビュー画像 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      {review.helpful_count > 0 && (
        <div className="flex items-center text-sm text-gray-500">
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{review.helpful_count}人がこのレビューが役に立ったと考えています</span>
        </div>
      )}
    </div>
  );
}