import React from 'react';
import { TableCellProps } from './types';

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <td className={`px-4 py-4 text-sm text-gray-500 ${alignmentClass} ${className}`}>
      {children}
    </td>
  );
}