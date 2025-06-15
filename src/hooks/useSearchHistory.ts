import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { logger } from '../lib/utils/logger';

type Tables = Database['public']['Tables'];
type SearchHistory = Tables['search_history']['Row'];
type SearchHistoryInsert = Tables['search_history']['Insert'];
type SearchHistoryUpdate = Tables['search_history']['Update'];

const SEARCH_HISTORY_TABLE = 'search_history';

// 日付フォーマット関数
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    logger.error('日付のフォーマットに失敗しました', 'SearchHistory', { error });
    return '日付不明';
  }
};

/**
 * Custom hook to manage search history
 * @returns Search history state and functions
 */
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToSearchHistory = async (params: {
    platform: string;
    product_name: string;
    viscosity_grade?: string | null;
    manufacturer?: string | null;
    updated_at?: string;
  }) => {
    try {
      const { platform, product_name, viscosity_grade, manufacturer } = params;
      
      logger.info('検索履歴の保存を開始', 'SearchHistory', { 
        params,
        table: SEARCH_HISTORY_TABLE,
        normalizedParams: {
          platform,
          product_name,
          viscosity_grade: viscosity_grade || null,
          manufacturer: manufacturer || null
        }
      });

      // 完全一致する履歴を確認（大文字小文字を区別しない）
      const { data: existingHistories, error: selectError } = await supabase
        .from(SEARCH_HISTORY_TABLE)
        .select('*')
        .eq('platform', platform)
        .ilike('product_name', product_name)
        .select();

      logger.info('検索履歴の検索結果', 'SearchHistory', { 
        existingHistories,
        count: existingHistories?.length || 0,
        selectError,
        query: {
          platform,
          product_name,
          viscosity_grade: viscosity_grade || null,
          manufacturer: manufacturer || null
        }
      });

      if (selectError) {
        logger.error('検索履歴の取得に失敗しました', 'SearchHistory', { 
          error: selectError,
          errorCode: selectError.code,
          errorMessage: selectError.message,
          details: selectError.details
        });
        throw selectError;
      }

      // 完全一致する履歴を探す
      const existingHistory = existingHistories?.find((history: SearchHistory) => {
        const isMatch = 
          history.platform === platform &&
          history.product_name.toLowerCase() === product_name.toLowerCase() &&
          history.viscosity_grade === (viscosity_grade || null) &&
          history.manufacturer === (manufacturer || null);

        logger.info('履歴の比較', 'SearchHistory', {
          historyId: history.id,
          current: {
            platform,
            product_name: product_name.toLowerCase(),
            viscosity_grade: viscosity_grade || null,
            manufacturer: manufacturer || null
          },
          stored: {
            platform: history.platform,
            product_name: history.product_name.toLowerCase(),
            viscosity_grade: history.viscosity_grade,
            manufacturer: history.manufacturer
          },
          isMatch
        });

        return isMatch;
      });

      const now = new Date().toISOString();

      if (existingHistory) {
        // 完全一致する履歴が存在する場合は更新日時のみ更新
        const updateData = {
          updated_at: now
        };

        logger.info('既存の検索履歴を更新', 'SearchHistory', { 
          id: existingHistory.id,
          updateData,
          existingData: existingHistory
        });

        const { data: updatedData, error: updateError } = await supabase
          .from(SEARCH_HISTORY_TABLE)
          .update(updateData)
          .eq('id', existingHistory.id)
          .select()
          .single();

        if (updateError) {
          logger.error('検索履歴の更新に失敗しました', 'SearchHistory', { 
            error: updateError,
            errorCode: updateError.code,
            errorMessage: updateError.message,
            details: updateError.details,
            updateData
          });
          throw updateError;
        }

        logger.info('検索履歴の更新が完了', 'SearchHistory', { 
          id: existingHistory.id,
          updatedData
        });
      } else {
        // 完全一致する履歴が存在しない場合は新規作成
        const insertData = {
          platform,
          product_name,
          viscosity_grade: viscosity_grade || null,
          manufacturer: manufacturer || null,
          created_at: now,
          updated_at: now
        };

        logger.info('新規検索履歴を作成', 'SearchHistory', { 
          insertData,
          table: SEARCH_HISTORY_TABLE
        });

        const { data: insertedData, error: insertError } = await supabase
          .from(SEARCH_HISTORY_TABLE)
          .insert([insertData])
          .select()
          .single();

        if (insertError) {
          logger.error('検索履歴の作成に失敗しました', 'SearchHistory', { 
            error: insertError,
            errorCode: insertError.code,
            errorMessage: insertError.message,
            details: insertError.details,
            insertData
          });
          throw insertError;
        }

        logger.info('新規検索履歴の作成が完了', 'SearchHistory', { 
          insertedData
        });
      }

      // 履歴を再読み込み
      await loadSearchHistory();
      logger.info('検索履歴の再読み込みが完了', 'SearchHistory');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      logger.error('検索履歴の保存に失敗しました', 'SearchHistory', { 
        error: errorMessage,
        originalError: error,
        params
      });
      setError(errorMessage);
      throw error;
    }
  };

  const loadSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from(SEARCH_HISTORY_TABLE)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('検索履歴の読み込みに失敗しました', 'SearchHistory', { error });
        throw error;
      }

      setSearchHistory(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      logger.error('検索履歴の読み込みに失敗しました', 'SearchHistory', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllSearchHistory = async () => {
    try {
      logger.info('検索履歴の一括削除を開始');
      
      const { error: deleteError } = await supabase
        .from(SEARCH_HISTORY_TABLE)
        .delete()
        .not('id', 'is', null);

      if (deleteError) {
        logger.error('検索履歴の一括削除に失敗しました', 'SearchHistory', { error: deleteError });
        throw deleteError;
      }

      logger.info('検索履歴の一括削除が完了');
      setSearchHistory([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      logger.error('検索履歴の一括削除に失敗しました', 'SearchHistory', { error: errorMessage });
      setError(errorMessage);
    }
  };

  const deleteSearchHistory = async (id: string) => {
    try {
      logger.info('検索履歴の削除を開始:', id);
      
      const { error: deleteError } = await supabase
        .from(SEARCH_HISTORY_TABLE)
        .delete()
        .eq('id', id);

      if (deleteError) {
        logger.error('検索履歴の削除に失敗:', JSON.stringify({ error: deleteError }));
        throw deleteError;
      }

      logger.info('検索履歴の削除が完了:', id);
      setSearchHistory(prev => prev.filter(history => history.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      logger.error('検索履歴の削除に失敗:', JSON.stringify({ error: errorMessage }));
      setError(errorMessage);
    }
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  return {
    searchHistory,
    loading,
    error,
    addToSearchHistory,
    deleteSearchHistory,
    deleteAllSearchHistory,
    loadSearchHistory,
    formatDate
  };
};