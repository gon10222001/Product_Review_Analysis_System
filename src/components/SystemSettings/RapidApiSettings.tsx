import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface RapidApiSettingsProps {
  queries: string[];
  setQueries: (queries: string[]) => void;
  isLoading: boolean;
}

export function RapidApiSettings({
  queries,
  setQueries,
  isLoading
}: RapidApiSettingsProps) {
  const handleAddQuery = () => {
    setQueries([...queries, '']);
  };

  const handleQueryChange = (index: number, value: string) => {
    const newQueries = [...queries];
    newQueries[index] = value;
    setQueries(newQueries);
  };

  const handleDeleteQuery = (index: number) => {
    setQueries(queries.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Search APIへのリクエスト設定</h3>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">【クエリ設定】</span>
              <button
                onClick={handleAddQuery}
                className="inline-flex items-center px-3 py-1.5 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                クエリを追加
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {queries.map((query, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-24 flex items-center shrink-0">
                      <span className="block text-sm font-medium text-gray-700">・query {index + 1}</span>
                      <span className="block text-sm font-medium text-gray-700 ml-auto">：</span>
                    </div>
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(index, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                        maxLength={50}
                        disabled={isLoading}
                        placeholder="クエリを入力"
                      />
                      {queries.length > 1 && (
                        <button
                          onClick={() => handleDeleteQuery(index)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors shrink-0"
                          disabled={isLoading}
                          aria-label="クエリを削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}