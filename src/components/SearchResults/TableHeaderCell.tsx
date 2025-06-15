import React from 'react';
import { TableHeaderCellProps } from './types';

export function TableHeaderCell({ children, className = '', align = 'left' }: TableHeaderCellProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <th scope="col" className={`px-4 py-2 text-xs font-medium text-gray-900 uppercase tracking-wider ${alignmentClass} ${className}`}>
      {children}
    </th>
  );
}