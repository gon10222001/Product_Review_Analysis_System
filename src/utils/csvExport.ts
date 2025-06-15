/**
 * Utility functions for CSV export
 */

import { Review } from '../types';
import Encoding from 'encoding-japanese';

/**
 * Convert a string to CSV-safe format
 * @param str - String to format for CSV
 * @returns CSV-safe string
 */
function formatForCSV(str: string | number | undefined): string {
  if (str === undefined || str === null) return '';
  
  // Convert to string if it's a number
  const value = typeof str === 'number' ? String(str) : str;
  
  // If the string contains commas, quotes, or newlines, wrap it in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Double any quotes within the string
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

/**
 * Generate CSV content for product details and reviews
 * @param productData - Product data
 * @param reviews - Product reviews
 * @returns CSV content as string
 */
export function generateProductCSV(
  productData: {
    productName: string;
    platform: string;
    imageUrl?: string;
    viscosityGrade?: string;
    manufacturer?: string;
    price?: number;
    averageRating?: number;
    reviewCount?: number;
  },
  reviews: Review[],
  positivePoints: string[],
  negativePoints: string[],
  keywords?: string[]
): string {
  const lines: string[] = [];
  
  // 1行目：商品名
  lines.push(formatForCSV(productData.productName));
  
  // 2行目：空行
  lines.push('');
  
  // 3行目：項目タイトル
  lines.push('レビュー,評価,投稿日,名前');
  
  // 4行目以降：レビューの内容
  reviews.forEach(review => {
    // 日付のフォーマット（YYYY/MM/DD形式に変換）
    const formattedDate = review.review_date ? 
      review.review_date.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日.*/, '$1/$2/$3') : 
      '';
    
    lines.push([
      formatForCSV(review.content),
      formatForCSV(review.rating),
      formatForCSV(formattedDate),
      formatForCSV(review.reviewer_name)
    ].join(','));
  });
  
  return lines.join('\n');
}

/**
 * Download data as a CSV file with appropriate encoding based on platform
 * @param csvContent - CSV content as string
 * @param fileName - Name for the downloaded file
 */
export function downloadCSV(csvContent: string, fileName: string): void {
  try {
    // Detect if the user is on Windows
    const isWindows = navigator.userAgent.indexOf('Windows') !== -1;
    
    let blob;
    if (isWindows) {
      // For Windows: Use Shift-JIS encoding
      const sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), {
        from: 'UNICODE',
        to: 'SJIS'
      });
      blob = new Blob([new Uint8Array(sjisArray)], {
        type: 'text/csv'
      });
    } else {
      // For Mac/Linux: Use UTF-8 with BOM
      const BOM = '\uFEFF';
      const contentWithBOM = BOM + csvContent;
      blob = new Blob([contentWithBOM], {
        type: 'text/csv'
      });
    }
    
    // Create a download link
    const link = document.createElement('a');
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Set link properties
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    // Add to document
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000); // 1秒後にクリーンアップ
  } catch (error) {
    console.error('Error downloading CSV:', error);
  }
}