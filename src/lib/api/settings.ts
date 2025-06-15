import { supabase } from '../supabase';
import { ApiSettings } from '../schemas';
import { ApiResponse } from './types';

/**
 * Get API settings from api_requests table
 */
export async function getApiSettings(): Promise<ApiSettings | null> {
  try {
    const { data, error } = await supabase
      .from('api_requests')
      .select('api_keyword, api_key')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error('API設定の取得中にエラーが発生しました。');
    }

    return data ? {
      keyword: data.api_keyword || '',
      apiKey: data.api_key || ''
    } : null;
  } catch (error) {
    console.error('Error in getApiSettings:', error);
    throw new Error('API設定の取得中にエラーが発生しました。');
  }
}

/**
 * Save API settings to api_requests table and return updated values
 */
export async function saveApiSettings(settings: ApiSettings): Promise<ApiResponse<ApiSettings>> {
  try {
    const { data: updatedData, error } = await supabase
      .rpc('update_api_settings', {
        p_keyword: settings.keyword,
        p_api_key: settings.apiKey
      });

    if (error) {
      console.error('Supabase update error:', error);
      return {
        error: 'API設定の保存中にエラーが発生しました。'
      };
    }

    if (!updatedData) {
      return {
        error: 'API設定の更新に失敗しました。'
      };
    }

    return {
      data: {
        keyword: updatedData[0]?.api_keyword || '',
        apiKey: updatedData[0]?.api_key || ''
      }
    };
  } catch (error) {
    console.error('Error in saveApiSettings:', error);
    return {
      error: 'API設定の保存中にエラーが発生しました。'
    };
  }
}