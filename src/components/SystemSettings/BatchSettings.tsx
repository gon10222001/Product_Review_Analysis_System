import React, { useEffect, useRef } from 'react';
import { Play, StopCircle } from 'lucide-react';

interface BatchSettingsProps {
  batchStatus: 'running' | 'stopped';
  setBatchStatus: (status: 'running' | 'stopped') => void;
  isBatchExecuting: boolean;
  setIsBatchExecuting: (isExecuting: boolean) => void;
  batchLogs: string[];
  setBatchLogs: (logs: string[]) => void;
  onStartBatch: () => void;
  onStopBatch: () => void;
}

export function BatchSettings({
  batchStatus,
  setBatchStatus,
  isBatchExecuting,
  setIsBatchExecuting,
  batchLogs,
  setBatchLogs,
  onStartBatch,
  onStopBatch
}: BatchSettingsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // ログの自動スクロール
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [batchLogs]);

  return (
    <div className="flex flex-col h-full">
      {/* ボタンエリア - 固定 */}
      <div className="flex-none p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={onStartBatch}
            disabled={isBatchExecuting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4 mr-1.5" />
            バッチ処理開始
          </button>
          <button
            onClick={onStopBatch}
            disabled={!isBatchExecuting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StopCircle className="h-4 w-4 mr-1.5" />
            中断
          </button>
        </div>
      </div>

      {/* ログ表示エリア - 固定高さ */}
      <div className="flex-none p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4">
            <div className="h-[250px] overflow-y-auto bg-gray-50 rounded-lg p-4 font-mono text-sm">
              {batchLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}