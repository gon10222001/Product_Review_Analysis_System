import React from 'react';
import { TabButton } from './TabButton';
import { TabType } from './types';

interface TabListProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function TabList({ activeTab, setActiveTab }: TabListProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <TabButton
          type="batch"
          isActive={activeTab === 'batch'}
          onClick={() => setActiveTab('batch')}
        >
          バッチ処理
        </TabButton>
        <TabButton
          type="api"
          isActive={activeTab === 'api'}
          onClick={() => setActiveTab('api')}
        >
          API設定
        </TabButton>
        <TabButton
          type="openai"
          isActive={activeTab === 'openai'}
          onClick={() => setActiveTab('openai')}
        >
          OpenAI設定
        </TabButton>
        <TabButton
          type="schedule"
          isActive={activeTab === 'schedule'}
          onClick={() => setActiveTab('schedule')}
        >
          スケジュール
        </TabButton>
      </nav>
    </div>
  );
}