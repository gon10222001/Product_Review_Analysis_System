import { supabase, isConnected } from '../supabase';
import { Platform, Product, ProductDetails, Review } from '../schemas';
import { SearchParams } from './types';
import { logger } from '../utils/logger';

/**
 * Maps database product fields to Product type
 */
function mapDatabaseProductToProduct(data: any): Product {
  const product = {
    id: data.prd_id,
    name: data.prd_name,
    image_url: data.prd_img_url,
    viscosity_grade: data.prd_vsc_grd,
    manufacturer: data.prd_maker,
    price: data.prd_price,
    average_rating: data.prd_avg_rtg,
    review_count: data.prd_rev_cnt,
    sales_volume: data.prd_sel_vol,
    platform: data.prd_platform as Platform,
    created_at: data.prd_crt_ts,
    updated_at: data.prd_upd_ts,
    order: data.prd_order ?? 0
  };

  return product;
}

/**
 * Builds search query based on search parameters
 */
function buildSearchQuery(params: SearchParams) {
  // Start with base query
  let query = supabase
    .from('products')
    .select(`
      prd_id,
      prd_name,
      prd_img_url,
      prd_vsc_grd,
      prd_maker,
      prd_price,
      prd_avg_rtg,
      prd_rev_cnt,
      prd_sel_vol,
      prd_platform,
      prd_crt_ts,
      prd_upd_ts,
      prd_order
    `, { count: 'exact' })
    .eq('prd_platform', params.platform)
    .order('prd_order', { ascending: true, nullsLast: true });

  // Add pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  // Add product name filter if provided
  if (params.productName) {
    query = query.ilike('prd_name', `%${params.productName}%`);
  }

  // Add Amazon-specific filters
  if (params.platform === 'Amazon') {
    if (params.viscosityGrade && params.viscosityGrade !== '全て') {
      const viscosityGrades = params.viscosityGrade
        .split(',')
        .filter(Boolean)
        .map(grade => grade.trim());
      if (viscosityGrades.length > 0) {
        query = query.in('prd_vsc_grd', viscosityGrades);
      }
    }
    if (params.manufacturer && params.manufacturer !== '全て') {
      const manufacturers = params.manufacturer
        .split(',')
        .filter(Boolean)
        .map(maker => maker.trim());
      if (manufacturers.length > 0) {
        query = query.in('prd_maker', manufacturers);
      }
    }
  }

  return query;
}

// レート制限対策のためのSleep関数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Search products based on given criteria
 */
export async function searchProducts(params: SearchParams): Promise<{ products: Product[]; totalCount: number }> {
  const startTime = performance.now();
  try {
    // レート制限対策（RapidAPI ULTRAプラン: 20 requests per second）
    await sleep(50);
    
    // Check connection first
    const connected = await isConnected();
    if (!connected) {
      throw new Error('データベースに接続できません。インターネット接続を確認してください。');
    }

    // Execute query with retry logic
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error, count } = await buildSearchQuery(params);

        if (error) {
          throw error;
        }

        if (!data) {
          return { products: [], totalCount: 0 };
        }

        const endTime = performance.now();
        logger.info(`searchProducts execution time: ${(endTime - startTime).toFixed(2)}ms`);
        
        return {
          products: data.map(mapDatabaseProductToProduct),
          totalCount: count || 0
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) {
          break;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError || new Error('商品の検索中にエラーが発生しました。');
  } catch (error) {
    logger.error('Error in searchProducts:', error);
    throw new Error('商品の検索中にエラーが発生しました。');
  }
}

export async function getProductDetails(productId: string): Promise<ProductDetails> {
  const startTime = performance.now();
  try {
    // レート制限対策（RapidAPI ULTRAプラン: 20 requests per second）
    await sleep(50);
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/product-details`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ productId })
      }
    );

    if (!response.ok) {
      throw new Error('商品詳細の取得中にエラーが発生しました。');
    }

    const data = await response.json();
    const endTime = performance.now();
    logger.info(`getProductDetails execution time: ${(endTime - startTime).toFixed(2)}ms`);
    
    return data;
  } catch (error) {
    logger.error('Error in getProductDetails:', error);
    throw new Error('商品詳細の取得中にエラーが発生しました。');
  }
}

export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10,
  options: {
    onProgress?: (reviews: Review[], hasMore: boolean, currentPage: number) => void;
    signal?: AbortSignal;
  } = {}
): Promise<{ reviews: Review[]; total: number }> {
  const startTime = performance.now();
  try {
    // レート制限対策（RapidAPI ULTRAプラン: 20 requests per second）
    await sleep(50);
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/product-reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          productId,
          page,
          limit
        }),
        signal: options.signal
      }
    );

    if (!response.ok) {
      throw new Error('レビューの取得中にエラーが発生しました。');
    }

    const data = await response.json();
    const endTime = performance.now();
    logger.info(`getProductReviews execution time: ${(endTime - startTime).toFixed(2)}ms`);
    
    return data;
  } catch (error) {
    logger.error('Error in getProductReviews:', error);
    throw new Error('レビューの取得中にエラーが発生しました。');
  }
}