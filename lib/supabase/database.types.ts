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
      brands: {
        Row: {
          id: string;
          slug: string;
          label: string;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["brands"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          label: string;
          description: string | null;
          brand_slug: string;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          description?: string | null;
          brand_slug: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      expansions: {
        Row: {
          id: string;
          brand_id: string;
          slug: string;
          label: string;
          release_status: string;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          slug: string;
          label: string;
          release_status?: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expansions"]["Insert"]>;
      };
      expansion_format_availability: {
        Row: {
          id: string;
          expansion_id: string;
          format_id: string;
          language_code: string;
          variant_label: string | null;
          active: boolean;
          is_preorder_default: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expansion_id: string;
          format_id: string;
          language_code: string;
          variant_label?: string | null;
          active?: boolean;
          is_preorder_default?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expansion_format_availability"]["Insert"]>;
      };
      inventory: {
        Row: {
          product_id: string;
          available_quantity: number;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          available_quantity?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          status: string;
          customer_email: string;
          customer_name: string | null;
          amount_total: number;
          currency: string;
          items_count: number;
          notes: string | null;
          source: string | null;
          metadata: Json;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          shipping_name: string | null;
          shipping_phone: string | null;
          shipping_address_json: Json;
          billing_address_json: Json;
          shipping_rate_label: string | null;
          shipping_rate_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          status: string;
          customer_email: string;
          customer_name?: string | null;
          amount_total: number;
          currency?: string;
          items_count?: number;
          notes?: string | null;
          source?: string | null;
          metadata?: Json;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          shipping_name?: string | null;
          shipping_phone?: string | null;
          shipping_address_json?: Json;
          billing_address_json?: Json;
          shipping_rate_label?: string | null;
          shipping_rate_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          product_slug_snapshot: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          product_type_snapshot: string;
          brand_slug_snapshot: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name_snapshot: string;
          product_slug_snapshot: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          product_type_snapshot: string;
          brand_slug_snapshot: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      product_formats: {
        Row: {
          id: string;
          slug: string;
          label: string;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_formats"]["Insert"]>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
      };
      product_languages: {
        Row: {
          code: string;
          label: string;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          label: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_languages"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          sku: string;
          name: string;
          description: string;
          product_type: string;
          brand_slug: string;
          brand_id: string;
          category_id: string;
          expansion_id: string;
          format_id: string;
          language_code: string;
          variant_label: string | null;
          price: number;
          compare_at_price: number | null;
          featured: boolean;
          is_preorder: boolean;
          active: boolean;
          main_image_path: string | null;
          attributes: Json;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          sku: string;
          name: string;
          description: string;
          product_type: string;
          brand_slug: string;
          brand_id: string;
          category_id: string;
          expansion_id: string;
          format_id: string;
          language_code: string;
          variant_label?: string | null;
          price: number;
          compare_at_price?: number | null;
          featured?: boolean;
          is_preorder?: boolean;
          active?: boolean;
          main_image_path?: string | null;
          attributes?: Json;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["app_role"];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin_or_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "staff" | "customer";
    };
    CompositeTypes: Record<string, never>;
  };
}
