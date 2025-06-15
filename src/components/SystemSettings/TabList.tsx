import React from 'react';
import { TabType } from './types';

interface TabListProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TABS: { type: TabType; label: string }[] = [
  { type: 'batch', label: 'バッチ処理' },
  { type: 'api', label: 'RapidAPI' },
  { type: 'openai', label: 'OpenAI API' }
];

export function TabList({ activeTab, setActiveTab }: TabListProps) {
  return (
    <div className="flex space-x-4 border-b border-gray-200">
      {TABS.map(({ type, label }) => (
        <button
          key={type}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg -mb-px ${
            activeTab === type
              ? 'text-blue-600 border-x border-t border-b-white border-gray-200 bg-white'
              : 'text-gray-500 hover:text-gray-700 border-b border-gray-200'
          }`}
          onClick={() => setActiveTab(type)}
        >
          {label}
        </button>
      ))}
      <div className="flex-1 border-b border-gray-200" />
    </div>
  );
}