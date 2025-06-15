import React from 'react';
import { ThumbsUp, ThumbsDown, RefreshCw, X } from 'lucide-react';

// 型定義
interface AnalysisResult {
  keyword?: string;
  positive: string[];
  negative: string[];
}

interface ReviewAnalysisProps {
  analysisResults: AnalysisResult[];
  isAnalyzing: boolean;
  isInitialAnalysis: boolean;
  error: Error | null;
  onUpdate: () => void;
  keyword1: string;
  setKeyword1: (value: string) => void;
  onDeleteResult?: (index: number) => void;
}

// ローディングオーバーレイコンポーネント
const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4 animate-fade-in">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
          <RefreshCw className="animate-spin h-5 w-5 text-blue-600 relative z-10" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">分析を実行中</h3>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
      </div>
    </div>
  </div>
);

// アニメーション用のスタイル
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

// 分析結果の表示コンポーネント
const AnalysisResultItem: React.FC<{
  result: AnalysisResult;
  index: number;
  onDelete?: (index: number) => void;
}> = ({ result, index, onDelete }) => (
  <div className="bg-blue-50/50 rounded-lg p-4 relative">
    {onDelete && (
      <button
        onClick={() => onDelete(index)}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
        aria-label="この分析結果を削除"
      >
        <X className="h-5 w-5" />
      </button>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border-l-4 border-green-500 pl-3 py-2">
        <div className="flex items-center mb-2">
          <ThumbsUp className="h-4 w-4 text-green-600 mr-2" />
          <h4 className="text-sm font-semibold text-green-700">
            {result.keyword 
              ? `「${result.keyword}」に基づくポジティブなレビューの要約`
              : 'ポジティブなレビューの要約'
            }
          </h4>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          {result.positive.map((point, pointIndex) => (
            <li key={pointIndex} className="text-sm text-gray-700">{point}</li>
          ))}
        </ul>
      </div>
      
      <div className="border-l-4 border-red-500 pl-3 py-2">
        <div className="flex items-center mb-2">
          <ThumbsDown className="h-4 w-4 text-red-600 mr-2" />
          <h4 className="text-sm font-semibold text-red-700">
            {result.keyword 
              ? `「${result.keyword}」に基づくネガティブなレビューの要約`
              : 'ネガティブなレビューの要約'
            }
          </h4>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          {result.negative.map((point, pointIndex) => (
            <li key={pointIndex} className="text-sm text-gray-700">{point}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

// メインコンポーネント
export const ReviewAnalysis: React.FC<ReviewAnalysisProps> = ({
  analysisResults,
  isAnalyzing,
  isInitialAnalysis,
  error,
  onUpdate,
  keyword1,
  setKeyword1,
  onDeleteResult
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <div className="flex items-center ml-6 space-x-4">
          <div className="flex items-center">
            <label htmlFor="keyword1" className="block text-sm font-medium text-gray-700 mr-2">
              追加分析キーワード：
            </label>
            <input
              type="text"
              id="keyword1"
              value={keyword1}
              onChange={(e) => setKeyword1(e.target.value)}
              className="block w-48 rounded-md border-2 border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-blue-50/30"
              placeholder="キーワードを入力（任意）"
            />
          </div>
          <button
            onClick={onUpdate}
            disabled={isAnalyzing}
            className="inline-flex items-center px-3 py-1.5 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="レビュー分析を更新"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isAnalyzing && !isInitialAnalysis ? 'animate-spin' : ''}`} />
            {isAnalyzing && !isInitialAnalysis ? '分析中...' : '追加分析'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          {error.message}
        </div>
      )}

      {analysisResults.length === 0 ? (
        <div className="bg-blue-50/50 rounded-lg p-4 flex items-center justify-center h-32">
          <div className="text-gray-500">
            表示する分析結果がありません
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {analysisResults.map((result, index) => (
            <AnalysisResultItem
              key={index}
              result={result}
              index={index}
              onDelete={onDeleteResult}
            />
          ))}
        </div>
      )}

      {isAnalyzing && (
        <LoadingOverlay
          message={isInitialAnalysis
            ? "分析を実行中です。しばらくお待ちください。"
            : "追加分析を実行中です。しばらくお待ちください。"
          }
        />
      )}
    </div>
  );
};