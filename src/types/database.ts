export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: "customer" | "handyman" | "admin";
          avatar_url: string | null;
          district: string | null;
          categories: string[];
          bio: string | null;
          rating_avg: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string | null;
          role?: "customer" | "handyman" | "admin";
          avatar_url?: string | null;
          district?: string | null;
          categories?: string[];
          bio?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          role?: "customer" | "handyman" | "admin";
          avatar_url?: string | null;
          district?: string | null;
          categories?: string[];
          bio?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_ka: string;
          name_en: string;
          icon: string;
          base_price: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          slug: string;
          name_ka: string;
          name_en: string;
          icon?: string;
          base_price?: number;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          slug?: string;
          name_ka?: string;
          name_en?: string;
          icon?: string;
          base_price?: number;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      tasks: {
        Row: {
          id: string;
          customer_id: string;
          handyman_id: string | null;
          category_id: string;
          title: string;
          description: string;
          address: string;
          district: string;
          photo_url: string | null;
          status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
          complexity: "simple" | "moderate" | "complex";
          estimated_hours: number;
          estimated_price: number;
          commission_amount: number;
          tasker_payout: number;
          final_price: number | null;
          created_at: string;
          updated_at: string;
          accepted_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          customer_id: string;
          handyman_id?: string | null;
          category_id: string;
          title: string;
          description: string;
          address: string;
          district: string;
          photo_url?: string | null;
          status?: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
          complexity?: "simple" | "moderate" | "complex";
          estimated_hours?: number;
          estimated_price: number;
          commission_amount?: number;
          tasker_payout?: number;
          final_price?: number | null;
        };
        Update: {
          handyman_id?: string | null;
          title?: string;
          description?: string;
          address?: string;
          district?: string;
          photo_url?: string | null;
          status?: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
          complexity?: "simple" | "moderate" | "complex";
          estimated_hours?: number;
          estimated_price?: number;
          commission_amount?: number;
          tasker_payout?: number;
          final_price?: number | null;
          accepted_at?: string | null;
          completed_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          task_id: string;
          customer_id: string;
          handyman_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          task_id: string;
          customer_id: string;
          handyman_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
      platform_settings: {
        Row: {
          id: string;
          commission_percent: number;
          min_task_price: number;
          max_task_price: number;
          currency: string;
          platform_name: string;
          support_email: string;
          support_phone: string;
          updated_at: string;
        };
        Update: {
          commission_percent?: number;
          min_task_price?: number;
          max_task_price?: number;
          platform_name?: string;
          support_email?: string;
          support_phone?: string;
        };
      };
    };
  };
}
