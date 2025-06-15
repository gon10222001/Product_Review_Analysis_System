export type TabType = 'batch' | 'api' | 'openai';

export interface SystemSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TabButtonProps {
  type: TabType;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}