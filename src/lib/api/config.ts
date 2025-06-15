/**
 * API configuration constants and types
 */

export const API_CONFIG = {
  baseUrl: 'https://real-time-amazon-data.p.rapidapi.com',
  host: 'real-time-amazon-data.p.rapidapi.com',
  defaultCountry: 'US',
  defaultPage: 1,
  defaultSort: 'RELEVANCE',
  defaultPageSize: 10, // Default number of items per page
  defaultParams: {
    page: 1,
    country: 'US',
    sort_by: 'RELEVANCE',
    product_condition: 'ALL',
    is_prime: 'false',
    deals_and_discounts: 'NONE'
  },
  endpoints: {
    search: '/search',
    productDetails: '/product-details'
  }
} as const;

export interface ApiHeaders {
  'X-RapidAPI-Key': string;
  'X-RapidAPI-Host': string;
  'Accept': string;
}

export function createApiHeaders(apiKey: string): ApiHeaders {
  return {
    'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || apiKey,
    'X-RapidAPI-Host': API_CONFIG.host,
    'Accept': 'application/json'
  };
}