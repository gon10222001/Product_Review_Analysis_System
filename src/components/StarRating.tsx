import React from 'react';
import { Star } from 'lucide-react';
import { StarRatingProps } from '../types';

/**
 * Renders a star rating display
 * @param rating - Rating value (0-5)
 */
export function StarRating({ rating }: StarRatingProps) {
  // Ensure rating is a valid number
  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
  
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center" aria-label={`評価: ${safeRating}点（5点満点）`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="w-4 h-4 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />
      ))}
    </div>
  );
}