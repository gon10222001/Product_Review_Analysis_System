import React from 'react';
import { TabButtonProps } from './types';

export function TabButton({ type, isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg -mb-px ${
        isActive
          ? 'text-blue-600 border-x border-t border-b-white border-gray-200 bg-white'
          : 'text-gray-500 hover:text-gray-700 border-b border-gray-200'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}