/**
 * API type definitions
 */

import { Database } from '../../types/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

// Common types
export interface ApiResponse<T> {
  status: number;
  request_id: string;
  data: T;
  error?: string;
}

// Product search types
export interface ProductSearchParams {
  keyword: string;
  country?: string;
  page?: number;
  sort?: string;
}

export interface Product {
  asin: string;
  product_title: string;
  product_price: string;
  product_original_price: string | null;
  currency: string;
  product_star_rating: string | null;
  product_num_ratings: string | null;
  product_url: string;
  product_photo: string;
  product_num_offers: number;
  product_minimum_offer_price: string;
  is_best_seller: boolean;
  is_amazon_choice: boolean;
  is_prime: boolean;
  climate_pledge_friendly: boolean;
  sales_volume: string | null;
  delivery: string;
  has_variations: boolean;
  product_availability?: string;
  product_byline?: string;
}

export interface ProductSearchResult {
  products: Product[];
}

export type ProductSearchResponse = ApiResponse<ProductSearchResult>;
export type ProductDetailsResponse = ApiResponse<ProductDetailsResult>;

// Review types
export interface Review {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  review_date: string;
  title: string;
  content: string;
  helpful_count: number | null;
  verified_purchase: boolean | null;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ReviewResponse {
  reviews: Review[];
  hasMore: boolean;
  currentPage: number;
}

export interface ReviewApiResponse {
  status: string;
  request_id: string;
  parameters: {
    asin: string;
    country: string;
    sort_by: string;
    verified_purchases_only: boolean;
    images_or_videos_only: boolean;
    current_format_only: boolean;
    star_rating: string;
    page: number;
  };
  data: {
    asin: string;
    country: string;
    domain: string;
    total_pages: number;
    reviews: Array<{
      review_id: string;
      review_title: string;
      review_comment: string;
      review_star_rating: string;
      review_link: string;
      review_author_id: string;
      review_author: string;
      review_author_url: string;
      review_author_avatar: string;
      review_images: string[];
      review_video: string | null;
      review_date: string;
      is_verified_purchase: boolean;
      helpful_vote_statement?: string;
      reviewed_product_asin: string;
      is_vine: boolean;
    }>;
  };
}

// Product details types
export interface ProductDetailsResult {
  product_information: Record<string, string>;
  sales_volume?: string;
}

// API Query types
export interface ApiQuery {
  keyword: string;
  page?: number;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Network types
export interface RequestOptions extends RequestInit {
  signal?: AbortSignal;
  timeout?: number;
}

// Review analysis types
export interface ReviewAnalysis {
  positive: string[];
  negative: string[];
}

// Review state types
export interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  isRetrying: boolean;
  error: string | null;
  isAllReviewsFetched: boolean;
  isCancellable: boolean;
  currentPage: number;
  hasMorePages: boolean;
}

// Supabase types
export type Tables = Database['public']['Tables'];
export type Products = Tables['products'];
export type ProductsInsert = Products['Insert'];
export type ProductsUpdate = Products['Update'];

// Supabase product type
export type SupabaseProduct = Database['public']['Tables']['products']['Row'];
export type SupabaseProductInsert = Database['public']['Tables']['products']['Insert'];
export type SupabaseProductUpdate = Database['public']['Tables']['products']['Update'];

// HTTP status codes
export type RetryableStatusCode = 408 | 429 | 500 | 502 | 503 | 504;

export interface SearchParams {
  platform: string;
  productName?: string;
  viscosityGrade?: string;
  manufacturer?: string;
  page?: number;
  pageSize?: number;
}