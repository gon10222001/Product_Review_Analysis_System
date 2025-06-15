/**
 * Utility functions for formatting data
 */

/**
 * Format price to Japanese Yen format or "無料" for free items
 * @param price - The price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) return '';
  return price === 0 ? '無料' : `¥${price.toLocaleString()}`;
}

/**
 * Format timestamp to Japanese date format
 * @param timestamp - The timestamp to format
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format search condition for display in history
 * @param label - The label for the condition
 * @param value - The value of the condition
 * @returns Formatted string or empty string if no value
 */
export function formatSearchConditionText(label: string, value: string | undefined): string {
  if (!value || value === '') {
    if (label === '商品名') {
      return `${label}: 未指定`;
    }
    return '';
  }
  
  return `${label}: ${value}`;
}