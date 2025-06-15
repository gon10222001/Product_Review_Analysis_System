import { z } from 'zod';
import { PLATFORMS } from './constants';

// Schema for platform type
export const platformSchema = z.enum(PLATFORMS);
export type Platform = z.infer<typeof platformSchema>;

// Base schemas for common fields
const timestampFields = {
  created_at: z.string().nullable(),
  updated_at: z.string().nullable()
};

// Schema for API settings
export const apiSettingsSchema = z.object({
  queries: z.array(z.string()),
  apiKey: z.string().optional(),
  openaiApiKey: z.string().optional()
});
export type ApiSettings = z.infer<typeof apiSettingsSchema>;

// Schema for product
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string().url(),
  viscosity_grade: z.string().nullable(),
  manufacturer: z.string().nullable(),
  price: z.number().int().positive(),
  average_rating: z.number().min(0).max(5).nullable(),
  review_count: z.number().int().min(0).nullable(),
  platform: platformSchema,
  order: z.number().int().min(0).default(0),
  sales_volume: z.number().int().min(0).nullable(),
  ...timestampFields
});
export type Product = z.infer<typeof productSchema>;

// Schema for review
export const reviewSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  reviewer_name: z.string(),
  rating: z.number().int().min(1).max(5),
  review_date: z.string(),
  title: z.string(),
  content: z.string(),
  helpful_count: z.number().int().min(0).nullable(),
  verified_purchase: z.boolean().nullable(),
  user_id: z.string().nullable(),
  ...timestampFields
});
export type Review = z.infer<typeof reviewSchema>;

// Schema for product details
export const productDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string().url(),
  viscosity_grade: z.string().nullable(),
  manufacturer: z.string().nullable(),
  price: z.number().int().positive(),
  average_rating: z.number().min(0).max(5).nullable(),
  review_count: z.number().int().min(0).nullable(),
  platform: platformSchema,
  order: z.number().int().min(0).default(0),
  sales_volume: z.number().int().min(0).nullable(),
  description: z.string().nullable(),
  specifications: z.record(z.string(), z.string()).nullable(),
  ...timestampFields
});
export type ProductDetails = z.infer<typeof productDetailsSchema>;