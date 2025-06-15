import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/utils/logger';
import { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type ProductHistory = Tables['product_history']['Row'];
type ProductHistoryInsert = Tables['product_history']['Insert'];
type ProductHistoryUpdate = Tables['product_history']['Update'];

interface Product {
  id: string;
  name: string;
  image_url: string;
  [key: string]: any;
}

const PRODUCT_HISTORY_TABLE = 'product_history';
const HISTORY_LIMIT = 10;

export function useProductHistory() {
  const [productHistory, setProductHistory] = useState<ProductHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const addToProductHistory = async (product: Product) => {
    if (isAdding) {
      logger.info('商品履歴の追加処理が既に実行中です');
      return;
    }

    try {
      setIsAdding(true);
      logger.info('商品履歴追加開始:', JSON.stringify(product));
      
      // 商品IDの取得
      const productId = product.id;
      if (!productId) {
        logger.error('商品IDが不正です:', JSON.stringify(product));
        setError('商品IDが不正です');
        return;
      }

      const now = new Date().toISOString();

      // 既存の履歴を確認
      const { data: existingHistory, error: fetchError } = await supabase
        .from(PRODUCT_HISTORY_TABLE)
        .select('*')
        .eq('product_id', productId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingHistory) {
        // 既存の履歴を更新
        const { error: updateError } = await supabase
          .from(PRODUCT_HISTORY_TABLE)
          .update({
            updated_at: now,
            image_url: product.image_url,
            product_name: product.name
          } as ProductHistoryUpdate)
          .eq('id', existingHistory.id);

        if (updateError) {
          throw updateError;
        }

        logger.info('既存の商品履歴を更新しました:', JSON.stringify({ productId, now }));
      } else {
        // 新規履歴を作成
        const { error: insertError } = await supabase
          .from(PRODUCT_HISTORY_TABLE)
          .insert([{
            product_id: productId,
            image_url: product.image_url,
            product_name: product.name,
            created_at: now,
            updated_at: now
          }] as ProductHistoryInsert[]);

        if (insertError) {
          throw insertError;
        }

        logger.info('新規の商品履歴を作成しました:', JSON.stringify({ productId, now }));
      }

      // 履歴を再読み込み
      await loadProductHistory();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      logger.error('商品履歴の追加に失敗:', JSON.stringify({ error: errorMessage }));
      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const loadProductHistory = useCallback(async () => {
    try {
      const { data: historyData, error: historyError } = await supabase
        .from(PRODUCT_HISTORY_TABLE)
        .select(`
          id,
          product_id,
          product_name,
          image_url,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(HISTORY_LIMIT);

      if (historyError) {
        throw historyError;
      }

      if (!historyData || historyData.length === 0) {
        logger.info('商品履歴がありません');
        return;
      }

      setProductHistory(historyData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      logger.error('商品履歴の読み込みに失敗:', JSON.stringify({ error: errorMessage }));
      setError(errorMessage);
    }
  }, []);

  const deleteAllProductHistory = async () => {
    try {
      logger.info('商品履歴の一括削除を開始');
      
      const { error: deleteError } = await supabase
        .from(PRODUCT_HISTORY_TABLE)
        .delete()
        .not('id', 'is', null);

      if (deleteError) {
        logger.error('商品履歴の一括削除に失敗:', JSON.stringify({ error: deleteError }));
        throw deleteError;
      }

      logger.info('商品履歴の一括削除が完了');
      setProductHistory([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      logger.error('商品履歴の一括削除に失敗:', JSON.stringify({ error: errorMessage }));
      setError(errorMessage);
    }
  };

  const deleteProductHistory = async (id: string) => {
    try {
      logger.info('商品履歴の削除を開始:', id);
      
      const { error: deleteError } = await supabase
        .from(PRODUCT_HISTORY_TABLE)
        .delete()
        .eq('id', id);

      if (deleteError) {
        logger.error('商品履歴の削除に失敗:', JSON.stringify({ error: deleteError }));
        throw deleteError;
      }

      logger.info('商品履歴の削除が完了:', id);
      setProductHistory(prev => prev.filter(history => history.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      logger.error('商品履歴の削除に失敗:', JSON.stringify({ error: errorMessage }));
      setError(errorMessage);
    }
  };

  useEffect(() => {
    loadProductHistory();
  }, [loadProductHistory]);

  return {
    productHistory,
    addToProductHistory,
    deleteProductHistory,
    deleteAllProductHistory,
    error
  };
}