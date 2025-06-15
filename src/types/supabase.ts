export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          prd_id: string
          prd_name: string
          prd_img_url: string
          prd_vsc_grd: string | null
          prd_maker: string | null
          prd_price: number
          prd_avg_rtg: number | null
          prd_rev_cnt: number | null
          prd_platform: string
          prd_crt_ts: string | null
          prd_upd_ts: string | null
          prd_order: number | null
          prd_sel_vol: number | null
        }
        Insert: {
          prd_id?: string
          prd_name: string
          prd_img_url: string
          prd_vsc_grd?: string | null
          prd_maker?: string | null
          prd_price: number
          prd_avg_rtg?: number | null
          prd_rev_cnt?: number | null
          prd_platform: string
          prd_crt_ts?: string | null
          prd_upd_ts?: string | null
          prd_order?: number | null
          prd_sel_vol?: number | null
        }
        Update: {
          prd_id?: string
          prd_name?: string
          prd_img_url?: string
          prd_vsc_grd?: string | null
          prd_maker?: string | null
          prd_price?: number
          prd_avg_rtg?: number | null
          prd_rev_cnt?: number | null
          prd_platform?: string
          prd_crt_ts?: string | null
          prd_upd_ts?: string | null
          prd_order?: number | null
          prd_sel_vol?: number | null
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          reviewer_name: string
          rating: number
          review_date: string
          title: string
          content: string
          helpful_count: number | null
          verified_purchase: boolean | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          product_id: string
          reviewer_name: string
          rating: number
          review_date: string
          title: string
          content: string
          helpful_count?: number | null
          verified_purchase?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          reviewer_name?: string
          rating?: number
          review_date?: string
          title?: string
          content?: string
          helpful_count?: number | null
          verified_purchase?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
      }
      api_queries: {
        Row: {
          id: number
          api_query: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: number
          api_query: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          api_query?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      search_history: {
        Row: {
          id: string
          platform: string
          product_name: string
          viscosity_grade: string | null
          manufacturer: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          product_name: string
          viscosity_grade?: string | null
          manufacturer?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          product_name?: string
          viscosity_grade?: string | null
          manufacturer?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_history: {
        Row: {
          id: string
          product_id: string
          product_name: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          product_name: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          product_name?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_history_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["prd_id"]
          }
        ]
      }
      batch_execution_history: {
        Row: {
          id: string
          started_at: string
          ended_at: string | null
          status: 'running' | 'completed' | 'aborted' | 'error'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          started_at: string
          ended_at?: string | null
          status: 'running' | 'completed' | 'aborted' | 'error'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          started_at?: string
          ended_at?: string | null
          status?: 'running' | 'completed' | 'aborted' | 'error'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}