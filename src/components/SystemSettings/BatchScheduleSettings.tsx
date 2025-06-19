import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Trash2, Plus, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BatchSchedule {
  id: string;
  name: string;
  cron_expression: string;
  is_active: boolean;
  timezone: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface BatchScheduleSettingsProps {
  isLoading: boolean;
}

export function BatchScheduleSettings({ isLoading }: BatchScheduleSettingsProps) {
  const [schedules, setSchedules] = useState<BatchSchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<BatchSchedule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    cron_expression: '0 0 * * *',
    is_active: true,
    timezone: 'Asia/Tokyo',
    description: ''
  });

  // スケジュール一覧を取得
  const loadSchedules = async () => {
    try {
      console.log('Loading schedules...');
      const { data, error } = await supabase
        .from('batch_schedule')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Schedules response:', { data, error });

      if (error) {
        console.error('Error loading schedules:', error);
        setError('スケジュールの取得に失敗しました');
        return;
      }

      setSchedules((data as any[]) || []);
    } catch (error) {
      console.error('Exception loading schedules:', error);
      setError('スケジュールの取得に失敗しました');
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  // フォームのリセット
  const resetForm = () => {
    setFormData({
      name: '',
      cron_expression: '0 0 * * *',
      is_active: true,
      timezone: 'Asia/Tokyo',
      description: ''
    });
    setEditingSchedule(null);
    setIsCreating(false);
    setError(null);
    setSuccess(null);
  };

  // スケジュール保存
  const handleSave = async () => {
    console.log('handleSave called with formData:', formData);
    
    if (!formData.name.trim()) {
      setError('スケジュール名を入力してください');
      return;
    }

    if (!formData.cron_expression.trim()) {
      setError('cron式を入力してください');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const scheduleData = {
        name: formData.name.trim(),
        cron_expression: formData.cron_expression.trim(),
        is_active: formData.is_active,
        timezone: formData.timezone,
        description: formData.description.trim() || null
      };

      console.log('Saving schedule data:', scheduleData);

      if (editingSchedule) {
        // 更新
        console.log('Updating schedule:', editingSchedule.id);
        const { data, error } = await supabase
          .from('batch_schedule')
          .update({
            ...scheduleData,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', editingSchedule.id as any)
          .select();

        console.log('Update response:', { data, error });

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        setSuccess('スケジュールを更新しました');
      } else {
        // 新規作成
        console.log('Creating new schedule');
        const { data, error } = await supabase
          .from('batch_schedule')
          .insert([scheduleData] as any)
          .select();

        console.log('Insert response:', { data, error });

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        setSuccess('スケジュールを作成しました');
      }

      resetForm();
      await loadSchedules();
    } catch (error) {
      console.error('Save error:', error);
      setError(
        'スケジュールの保存に失敗しました: ' +
        (error && typeof error === 'object'
          ? JSON.stringify(error)
          : String(error))
      );
    } finally {
      setIsSaving(false);
    }
  };

  // スケジュール削除
  const handleDelete = async (id: string) => {
    if (!confirm('このスケジュールを削除しますか？')) {
      return;
    }

    try {
      console.log('Deleting schedule:', id);
      const { error } = await supabase
        .from('batch_schedule')
        .delete()
        .eq('id', id as any);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      setSuccess('スケジュールを削除しました');
      await loadSchedules();
    } catch (error) {
      console.error('Delete exception:', error);
      setError('スケジュールの削除に失敗しました');
    }
  };

  // スケジュール編集
  const handleEdit = (schedule: BatchSchedule) => {
    console.log('Editing schedule:', schedule);
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      cron_expression: schedule.cron_expression,
      is_active: schedule.is_active,
      timezone: schedule.timezone,
      description: schedule.description || ''
    });
    setIsCreating(false);
  };

  // cron式の説明を取得
  const getCronDescription = (cronExpression: string): string => {
    const patterns = {
      '0 0 * * *': '毎日午前0時',
      '0 0 * * 0': '毎週日曜日午前0時',
      '0 0 1 * *': '毎月1日午前0時',
      '0 */6 * * *': '6時間ごと',
      '0 0,12 * * *': '毎日午前0時と午後12時',
      '0 0 * * 1-5': '平日（月〜金）午前0時',
      '0 0 1,15 * *': '毎月1日と15日午前0時'
    };
    return patterns[cronExpression as keyof typeof patterns] || 'カスタムスケジュール';
  };

  // 次の実行時刻を計算（簡易版）
  const getNextExecution = (cronExpression: string): string => {
    // 実際の実装ではcron-parserライブラリを使用
    return '次回実行時刻を計算中...';
  };

  return (
    <div className="space-y-6">
      {/* エラー・成功メッセージ */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* スケジュール一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">スケジュール一覧</h3>
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              新規作成
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {schedules.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              スケジュールが登録されていません
            </div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${schedule.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{schedule.name}</h4>
                        <p className="text-sm text-gray-500">{schedule.description}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getCronDescription(schedule.cron_expression)}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {getNextExecution(schedule.cron_expression)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* フォーム */}
      {(isCreating || editingSchedule) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingSchedule ? 'スケジュール編集' : '新規スケジュール作成'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                スケジュール名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="例: 毎日午前0時"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cron式 *
              </label>
              <input
                type="text"
                value={formData.cron_expression}
                onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                placeholder="0 0 * * *"
              />
              <p className="mt-1 text-xs text-gray-500">
                例: 0 0 * * * (毎日午前0時), 0 */6 * * * (6時間ごと)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="スケジュールの説明"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  有効にする
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? '保存中...' : (editingSchedule ? '更新' : '作成')}
              </button>
              <button
                onClick={resetForm}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘルプ */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Cron式の説明</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <code className="bg-blue-100 px-1 rounded">0 0 * * *</code> - 毎日午前0時</p>
          <p>• <code className="bg-blue-100 px-1 rounded">0 0 * * 0</code> - 毎週日曜日午前0時</p>
          <p>• <code className="bg-blue-100 px-1 rounded">0 */6 * * *</code> - 6時間ごと</p>
          <p>• <code className="bg-blue-100 px-1 rounded">0 0,12 * * *</code> - 毎日午前0時と午後12時</p>
          <p>• <code className="bg-blue-100 px-1 rounded">0 0 1 * *</code> - 毎月1日午前0時</p>
        </div>
      </div>
    </div>
  );
} 