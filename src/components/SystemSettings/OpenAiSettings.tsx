import React from 'react';

interface OpenAiSettingsProps {
  isLoading: boolean;
}

export function OpenAiSettings({
  isLoading
}: OpenAiSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">OpenAI APIの設定</h3>
      </div>
    </div>
  );
}