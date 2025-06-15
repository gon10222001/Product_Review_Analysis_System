import React from 'react';
import { useSystemSettings } from './SystemSettingsContext';
import { ApiRequestSettings } from './ApiRequestSettings';
import { OpenAISettings } from './OpenAISettings';

export function TabContent() {
  const { activeTab } = useSystemSettings();

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {activeTab === 'batch' && (
        <div className="h-full flex items-center justify-center text-gray-400">
          バッチ処理の設定内容をここに表示します
        </div>
      )}
      {activeTab === 'api' && <ApiRequestSettings />}
      {activeTab === 'openai' && <OpenAISettings />}
    </div>
  );
}