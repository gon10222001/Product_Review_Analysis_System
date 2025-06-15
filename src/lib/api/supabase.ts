import { createClient } from '@supabase/supabase-js';

// カスタムストレージの実装
const customStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Supabaseクライアントの初期化
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storage: customStorage
    }
  }
);

// 接続テスト関数
export async function testConnection() {
  try {
    const { error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error };
  }
} 