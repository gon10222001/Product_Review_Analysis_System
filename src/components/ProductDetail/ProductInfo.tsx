import React from 'react';
import { StarRating } from '../StarRating';
import { formatPrice } from '../../utils/formatters';
import { Platform } from '../../types';

interface ProductInfoProps {
  productName: string;
  imageUrl?: string;
  platform: Platform;
  manufacturer?: string;
  viscosityGrade?: string;
  price?: number;
  averageRating?: number;
  reviewCount?: number;
}

export function ProductInfo({
  productName,
  imageUrl,
  platform,
  manufacturer,
  viscosityGrade,
  price,
  averageRating,
  reviewCount
}: ProductInfoProps) {
  return (
    <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 pb-3 flex items-center">
        <h2 className="text-xl font-bold text-gray-900">商品情報</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
          {platform}
        </span>
      </div>
      <div className="p-6 pt-0 flex">
        {imageUrl && (
          <div className="flex-shrink-0 mr-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden shadow-lg">
              <img
                src={imageUrl}
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-col space-y-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{productName}</h2>
            </div>
            
            {platform === 'Amazon' && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex flex-col items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span>メーカー</span>
                  <span className="text-sm font-bold">{manufacturer}</span>
                </span>
                <span className="inline-flex flex-col items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <span>粘度グレード</span>
                  <span className="text-sm font-bold">{viscosityGrade}</span>
                </span>
              </div>
            )}

            <div className="flex items-center">
              <div className="text-xl font-bold text-blue-700">
                {formatPrice(price)}
              </div>
              <div className="flex items-center ml-6">
                <StarRating rating={averageRating || 0} />
                <span className="font-medium ml-2">{averageRating}</span>
                <span className="text-gray-500 mx-2">|</span>
                <span className="text-gray-600">評価件数 {reviewCount?.toLocaleString() || 0}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}