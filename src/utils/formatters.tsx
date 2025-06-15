import React from 'react';

/**
 * Format search condition for display in history
 * @param label - The label for the condition
 * @param value - The value of the condition
 * @returns JSX element or null if no value or value is "全て"
 */
export function formatSearchCondition(label: string, value: string | undefined | null): React.ReactNode {
  if (!value || value === '' || value === '全て') {
    if (label === '商品名') {
      return (
        <div className="flex items-start text-xs text-gray-600">
          <span className="font-medium mr-2 whitespace-nowrap">{label}:</span>
          <span>未指定</span>
        </div>
      );
    }
    return null;
  }
  
  return (
    <div className="flex items-start text-xs text-gray-600">
      <span className="font-medium mr-2 whitespace-nowrap">{label}:</span>
      <span>{value}</span>
    </div>
  );
}