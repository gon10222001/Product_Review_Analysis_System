import { useState, useEffect, useCallback } from 'react';
import { Platform, Product, SearchState, SearchParams } from '../types';
import { searchProducts } from '../lib/api/products';
import { supabase, isConnected } from '../lib/supabase';
import { DEFAULT_FILTERS, ERROR_MESSAGES, PLATFORMS } from '../lib/constants';
import { logger } from '../lib/utils/logger';
import { AppError } from '../lib/utils/error';
import { withRetry } from '../lib/utils/retry';
import type { Database } from '../types/supabase';

type UniqueValueColumn = 'prd_vsc_grd' | 'prd_maker';
type ProductRecord = Database['public']['Tables']['products']['Row'];

/**
 * Custom hook for managing product search functionality
 */
export const useProductSearch = () => {
  // Search parameters
  const [platform, setPlatform] = useState<Platform>(PLATFORMS[0]);
  const [productName, setProductName] = useState('');
  const [viscosityGrade, setViscosityGrade] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Search results
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    viscosityGrades: string[];
    manufacturers: string[];
  }>({ viscosityGrades: [], manufacturers: [] });

  // Fetch unique values from a column with retry logic
  const fetchUniqueValues = useCallback(async (column: UniqueValueColumn): Promise<string[]> => {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('products')
        .select(column)
        .not(column, 'is', null)
        .not(column, 'eq', '')
        .order(column);

      if (error) {
        throw new AppError(ERROR_MESSAGES.DATABASE_CONNECTION);
      }

      if (!data) return [];

      const values = data.map(row => {
        const value = (row as unknown as Record<string, string | null>)[column];
        return value || '';
      }).filter(value => value.trim() !== '');

      return Array.from(new Set(values));
    });
  }, []);

  const filterProducts = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = {
        ...params,
        pageSize: params.pageSize || 100  // デフォルトで100件
      };
      const result = await searchProducts(searchParams);
      setProducts(result.products);
      setTotalCount(result.totalCount);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '検索中にエラーが発生しました';
      setError(errorMessage);
      logger.error('Error in filterProducts: ' + errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const connected = await isConnected();
      if (!connected) {
        throw new AppError(ERROR_MESSAGES.DATABASE_CONNECTION);
      }

      // Fetch unique values with retries
      const [viscosityGrades, manufacturers] = await Promise.all([
        fetchUniqueValues('prd_vsc_grd'),
        fetchUniqueValues('prd_maker')
      ]);

      setFilterOptions({ viscosityGrades, manufacturers });
    } catch (err) {
      const errorMessage = err instanceof AppError ? err.message : ERROR_MESSAGES.API_SETTINGS;
      logger.error('Error fetching filter options: ' + errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUniqueValues]);

  // Initialize filter options on mount and after navigation
  useEffect(() => {
    fetchFilterOptions();

    // Add event listeners for page visibility and focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFilterOptions();
      }
    };

    const handleFocus = () => {
      fetchFilterOptions();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchFilterOptions]);

  return {
    // Search parameters
    platform,
    setPlatform,
    productName,
    setProductName,
    viscosityGrade,
    setViscosityGrade,
    manufacturer,
    setManufacturer,
    showResults,
    setShowResults,
    scrollPosition,
    setScrollPosition,

    // Search results
    products,
    setProducts,
    totalCount,
    isLoading,
    error,
    setError,
    filterProducts,
    filterOptions,
    refreshFilters: fetchFilterOptions,
  };
};