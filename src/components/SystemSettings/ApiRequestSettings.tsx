import React from 'react';
import { useSystemSettings } from './SystemSettingsContext';

export function ApiRequestSettings() {
  const { apiSettings, setApiSettings, isLoading } = useSystemSettings();

  const handleInputChange = (field: keyof typeof apiSettings) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setApiSettings({ ...apiSettings, [field]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Product Search APIへのリクエスト設定
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-24 flex items-center">
              <span className="block text-sm font-medium text-gray-700">・query</span>
              <span className="block text-sm font-medium text-gray-700 ml-auto">：</span>
            </div>
            <input
              type="text"
              id="keyword"
              value={apiSettings.keyword}
              onChange={handleInputChange('keyword')}
              className="block w-[400px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ml-2"
              maxLåength={50}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center">
            <div className="w-24 flex items-center">
              <span className="block text-sm font-medium text-gray-700">・api-key</span>
              <span className="block text-sm font-medium text-gray-700 ml-auto">：</span>
            </div>
            <input
              type="text"
              id="api-key"
              value={apiSettings.apiKey}
              onChange={handleInputChange('apiKey')}
              className="block w-[400px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ml-2"
              maxLength={50}
              disabled={isLoading}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">【補足】</p>
            <p className="ml-4">
              queryに複数のワードを指定する場合は、"+"または"%20"で結合してください。<br />
              例1. キーワード１+キーワード２+キーワード３<br />
              例2. キーワード１%20キーワード２%20キーワード３
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}