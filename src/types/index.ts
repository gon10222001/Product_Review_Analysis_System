// Type definitions for the application

import { PLATFORMS } from '../lib/constants';
import { Database } from './supabase';
import { SearchParams as ApiSearchParams } from '../lib/api/types';

type Tables = Database['public']['Tables'];
export type SearchHistory = Tables['search_history']['Row'];
export type BaseProductHistory = Tables['product_history']['Row'];

// ProductHistory type with joined products table
export interface ProductHistory {
  id: string;
  product_id: string;
  created_at: string;
  products?: {
    prd_id: string;
    prd_name: string;
    prd_img_url: string;
    prd_platform: string;
  };
}

// Platform type
export type Platform = typeof PLATFORMS[number];

// Product type
export interface Product {
  id: string;
  name: string;
  image_url: string;
  viscosity_grade: string | null;
  manufacturer: string | null;
  price: number;
  average_rating: number | null;
  review_count: number | null;
  platform: Platform;
  sales_volume: number | null;
  order: number;
  created_at?: string | null;
  updated_at?: string | null;
}

// Search form props
export interface SearchFormProps {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  viscosityGrade: string;
  setViscosityGrade: (grade: string) => void;
  manufacturer: string;
  setManufacturer: (manufacturer: string) => void;
  productName: string;
  setProductName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClear: () => void;
  isLoading: boolean;
  error: string | null;
  viscosityGrades: string[];
  manufacturers: string[];
}

// Search sidebar props
export interface SearchSidebarProps {
  searchHistory: SearchHistory[];
  productHistory: ProductHistory[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onHistoryItemClick: (history: SearchHistory) => void;
  onProductHistoryItemClick: (productId: string) => void;
  onDeleteSearchHistory: (id: string) => void;
  onDeleteProductHistory: (id: string) => void;
  onDeleteAllSearchHistory: () => void;
  onDeleteAllProductHistory: () => void;
}

// Product list props
export interface ProductListProps {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  viscosityGrade: string;
  setViscosityGrade: (grade: string) => void;
  manufacturer: string;
  setManufacturer: (manufacturer: string) => void;
  productName: string;
  setProductName: (name: string) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  filteredProducts: Product[];
  setFilteredProducts: (products: Product[]) => void;
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
  searchHistory: SearchHistory[];
  addToSearchHistory: (search: Omit<SearchHistory, 'id' | 'created_at'>) => void;
  productHistory: ProductHistory[];
  addToProductHistory: (product: Product) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onHistoryItemClick: (history: SearchHistory) => void;
  onProductHistoryItemClick: (productId: string) => void;
  onDeleteSearchHistory: (id: string) => void;
  onDeleteProductHistory: (id: string) => void;
  onDeleteAllSearchHistory: () => void;
  onDeleteAllProductHistory: () => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  filterProducts: (params: SearchParams) => Promise<{ products: Product[]; totalCount: number }>;
  viscosityGrades: string[];
  manufacturers: string[];
}

// Star rating props
export interface StarRatingProps {
  rating: number;
}

// Scroll to top button props
export interface ScrollToTopButtonProps {
  className?: string;
}

export interface SearchResultsProps {
  products: Product[];
  onRowDoubleClick: (product: Product) => void;
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface SearchState {
  products: Product[];
  totalCount: number;
}

export interface SearchParams extends Omit<ApiSearchParams, 'platform'> {
  platform: Platform;
  page: number;
  pageSize?: number;
}