import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessPopupProps {
  show: boolean;
}

export function SuccessPopup({ show }: SuccessPopupProps) {
  if (!show) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 flex items-center space-x-3 border border-green-100 min-w-[300px]">
      <CheckCircle className="h-6 w-6 text-green-500" />
      <span className="text-green-700 text-lg font-medium">設定を保存しました</span>
    </div>
  );
}