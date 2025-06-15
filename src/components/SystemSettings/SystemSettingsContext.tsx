import React, { createContext, useContext, useState, useCallback } from 'react';
import { ApiSettings } from '../../lib/schemas';
import { getApiSettings, saveApiSettings } from '../../lib/api';
import { SystemSettingsContextType, TabType } from './types';

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

const DEFAULT_API_SETTINGS: ApiSettings = {
  keyword: '',
  apiKey: '',
  openaiApiKey: ''
};

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('batch');
  const [apiSettings, setApiSettings] = useState<ApiSettings>(DEFAULT_API_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const loadApiSettings = useCallback(async () => {
    setIsLoading(true);
    clearMessages();
    try {
      const settings = await getApiSettings();
      if (settings) {
        setApiSettings(settings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API設定の取得中にエラーが発生しました。');
      console.error('Error loading API settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clearMessages]);

  const saveSettings = useCallback(async () => {
    setIsLoading(true);
    clearMessages();
    try {
      const result = await saveApiSettings(apiSettings);
      
      if (result.success && result.updatedSettings) {
        setSuccessMessage('設定を保存しました');
        return true;
      } else {
        setError('API設定の保存に失敗しました。');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API設定の保存中にエラーが発生しました。');
      console.error('Error saving API settings:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [apiSettings, clearMessages]);

  return (
    <SystemSettingsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        apiSettings,
        setApiSettings,
        isLoading,
        error,
        successMessage,
        loadApiSettings,
        saveSettings,
        clearMessages
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
}