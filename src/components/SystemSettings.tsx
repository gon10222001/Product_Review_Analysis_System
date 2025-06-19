import React, { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';
import { getApiSettings, saveApiSettings } from '../lib/api';
import { TabType } from './SystemSettings/types';
import { TabList } from './SystemSettings/TabList';
import { TabContent } from './SystemSettings/TabContent';
import { BatchSettings } from './SystemSettings/BatchSettings';
import { RapidApiSettings } from './SystemSettings/RapidApiSettings';
import { OpenAiSettings } from './SystemSettings/OpenAiSettings';
import { SuccessPopup } from './SystemSettings/SuccessPopup';
import { ApiRequestSettings } from './SystemSettings/ApiRequestSettings';
import { ErrorDialog } from './ErrorDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BatchScheduleSettings } from './SystemSettings/BatchScheduleSettings';

interface SystemSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemSettings({ isOpen, onClose }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('batch');
  const [queries, setQueries] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [batchStatus, setBatchStatus] = useState<'running' | 'stopped'>('stopped');
  const [isBatchExecuting, setIsBatchExecuting] = useState(false);
  const [batchLogs, setBatchLogs] = useState<string[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const [isVisible, setIsVisible] = useState(isOpen);
  const isVisibleRef = useRef(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // スリープモード検出用のイベントリスナー
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isBatchExecuting) {
        // スリープ解除後にシステム設定画面を最前面に表示
        setIsSettingsOpen(true);
        setIsVisible(true);
        isVisibleRef.current = true;
        if (modalRef.current) {
          modalRef.current.style.zIndex = '100';
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isBatchExecuting]);

  // 初期状態の復元
  useEffect(() => {
    if (isOpen && !isInitialized) {
      // 常に初期状態を使用する
      setBatchStatus('stopped');
      setIsBatchExecuting(false);
      setBatchLogs([]);
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  // 状態の保存
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = {
        activeTab,
        batchStatus,
        isBatchExecuting,
        batchLogs,
        isVisible: isVisibleRef.current
      };
      localStorage.setItem('systemSettingsState', JSON.stringify(stateToSave));
    }
  }, [activeTab, batchStatus, isBatchExecuting, batchLogs, isInitialized]);

  // 保存された状態の復元
  useEffect(() => {
    const savedState = localStorage.getItem('systemSettingsState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.isBatchExecuting) {
          setIsVisible(true);
          isVisibleRef.current = true;
          setIsSettingsOpen(true);
        }
      } catch (error) {
        console.error('Failed to parse saved state:', error);
      }
    }
  }, []);

  // Web Workerの初期化
  useEffect(() => {
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(new URL('../workers/batchWorker.ts', import.meta.url), {
          type: 'module'
        });

        // キープアライブタイマーの設定
        const keepAliveInterval = setInterval(() => {
          if (workerRef.current && isBatchExecuting) {
            workerRef.current.postMessage({ type: 'keepAlive' });
          }
        }, 30000); // 30秒ごとにキープアライブメッセージを送信

        workerRef.current.onmessage = (e) => {
          const { type, data } = e.data;

          if (type === 'log') {
            setBatchLogs(prev => [...prev, data]);
          } else if (type === 'complete') {
            setIsBatchExecuting(false);
            setBatchStatus('stopped');
            clearInterval(keepAliveInterval);
          } else if (type === 'error') {
            setIsBatchExecuting(false);
            setBatchStatus('stopped');
            clearInterval(keepAliveInterval);
            console.error('バッチ処理エラー:', data);
          } else if (type === 'aborted') {
            setIsBatchExecuting(false);
            setBatchStatus('stopped');
            clearInterval(keepAliveInterval);
          } else if (type === 'keepAlive') {
            // キープアライブメッセージを受信したら何もしない
            // スリープモードでも処理が継続していることを確認
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Web Worker error:', error);
          setIsBatchExecuting(false);
          setBatchStatus('stopped');
          clearInterval(keepAliveInterval);
        };

        return () => {
          clearInterval(keepAliveInterval);
          if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
          }
        };
      } catch (error) {
        console.error('Failed to initialize Web Worker:', error);
        setIsBatchExecuting(false);
        setBatchStatus('stopped');
      }
    }
  }, []);

  // isOpenの変更を監視し、isVisibleを更新
  useEffect(() => {
    if (isBatchExecuting) {
      setIsVisible(true);
      isVisibleRef.current = true;
    } else {
      setIsVisible(isOpen);
      isVisibleRef.current = isOpen;
    }
  }, [isOpen, isBatchExecuting]);

  // バッチ処理実行中はisVisibleをtrueに保つ
  useEffect(() => {
    if (isBatchExecuting) {
      setIsVisible(true);
      isVisibleRef.current = true;
    }
  }, [isBatchExecuting]);

  // ウィンドウのフォーカス状態を監視
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isBatchExecuting) {
        setIsVisible(true);
        isVisibleRef.current = true;
        if (modalRef.current) {
          modalRef.current.style.zIndex = '100';
        }
      }
    };

    const handleFocus = () => {
      if (isBatchExecuting) {
        setIsVisible(true);
        isVisibleRef.current = true;
        if (modalRef.current) {
          modalRef.current.style.zIndex = '100';
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isBatchExecuting]);

  useEffect(() => {
    async function loadApiSettings() {
      if (isVisibleRef.current && activeTab === 'api') {
        setIsLoading(true);
        setError(null);
        try {
          const settings = await getApiSettings();
          if (settings) {
            setQueries(settings.queries.length > 0 ? settings.queries : ['']);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'API設定の取得中にエラーが発生しました。');
          console.error('Error loading API settings:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadApiSettings();
  }, [activeTab]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await saveApiSettings({
        queries: queries.filter(q => q.trim() !== '')
      });
      
      if (result.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API設定の保存中にエラーが発生しました。');
      console.error('Error saving API settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBatch = () => {
    setIsBatchExecuting(true);
    setBatchLogs([]);
    workerRef.current?.postMessage({ type: 'start' });
  };

  const handleStopBatch = () => {
    workerRef.current?.postMessage({ type: 'abort' });
  };

  const handleClose = () => {
    if (isBatchExecuting) {
      // バッチ処理実行中は閉じるボタンを無効化
      return;
    }
    setIsVisible(false);
    isVisibleRef.current = false;
    onClose();
  };

  if (!isVisible || !isInitialized) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
    >
      <div className="bg-white rounded-xl shadow-xl w-[800px] h-[600px] flex flex-col relative">
        <SuccessPopup show={showSuccessPopup} />

        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">システム設定</h2>
        </div>

        <div className="px-6 pt-4">
          <TabList activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          {activeTab === 'batch' && (
            <BatchSettings
              batchStatus={batchStatus}
              setBatchStatus={setBatchStatus}
              isBatchExecuting={isBatchExecuting}
              setIsBatchExecuting={setIsBatchExecuting}
              batchLogs={batchLogs}
              setBatchLogs={setBatchLogs}
              onStartBatch={handleStartBatch}
              onStopBatch={handleStopBatch}
            />
          )}
          
          {activeTab === 'api' && (
            <RapidApiSettings
              queries={queries}
              setQueries={setQueries}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'openai' && (
            <OpenAiSettings
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'schedule' && (
            <BatchScheduleSettings
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleClose}
            disabled={isBatchExecuting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4 mr-1.5" />
            閉じる
          </button>
          {activeTab === 'api' && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-1.5" />
              保存
            </button>
          )}
        </div>
      </div>
    </div>
  );
}