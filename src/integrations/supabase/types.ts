export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      leads_rent: {
        Row: {
          address: string
          analysis: string | null
          annual_income_estimate: number | null
          availability_date: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_size_sqm: number | null
          city: string | null
          comparable_rentals: Json | null
          created_at: string | null
          current_rental_income: number | null
          email: string
          full_name: string
          id: string
          is_furnished: string | null
          monthly_long_term_estimate: number | null
          occupancy_estimate: number | null
          phone: string | null
          property_features: string | null
          property_type: string | null
          rental_preference: string | null
          seasonal_breakdown: Json | null
          views: string | null
          weekly_high_season_estimate: number | null
          weekly_low_season_estimate: number | null
          zone_id: string | null
        }
        Insert: {
          address: string
          analysis?: string | null
          annual_income_estimate?: number | null
          availability_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_size_sqm?: number | null
          city?: string | null
          comparable_rentals?: Json | null
          created_at?: string | null
          current_rental_income?: number | null
          email: string
          full_name: string
          id?: string
          is_furnished?: string | null
          monthly_long_term_estimate?: number | null
          occupancy_estimate?: number | null
          phone?: string | null
          property_features?: string | null
          property_type?: string | null
          rental_preference?: string | null
          seasonal_breakdown?: Json | null
          views?: string | null
          weekly_high_season_estimate?: number | null
          weekly_low_season_estimate?: number | null
          zone_id?: string | null
        }
        Update: {
          address?: string
          analysis?: string | null
          annual_income_estimate?: number | null
          availability_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_size_sqm?: number | null
          city?: string | null
          comparable_rentals?: Json | null
          created_at?: string | null
          current_rental_income?: number | null
          email?: string
          full_name?: string
          id?: string
          is_furnished?: string | null
          monthly_long_term_estimate?: number | null
          occupancy_estimate?: number | null
          phone?: string | null
          property_features?: string | null
          property_type?: string | null
          rental_preference?: string | null
          seasonal_breakdown?: Json | null
          views?: string | null
          weekly_high_season_estimate?: number | null
          weekly_low_season_estimate?: number | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_rent_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_sell: {
        Row: {
          address: string
          analysis: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_size_sqm: number | null
          city: string | null
          comparable_properties: Json | null
          condition: string | null
          created_at: string | null
          email: string
          energy_certificate: string | null
          estimated_value: number | null
          features: string | null
          full_name: string
          id: string
          market_trends: string | null
          monthly_rental_estimate: number | null
          orientation: string | null
          phone: string | null
          plot_size_sqm: number | null
          price_per_sqm: number | null
          price_range_high: number | null
          price_range_low: number | null
          property_type: string | null
          terrace_size_sqm: number | null
          views: string | null
          year_built: number | null
          zone_id: string | null
        }
        Insert: {
          address: string
          analysis?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_size_sqm?: number | null
          city?: string | null
          comparable_properties?: Json | null
          condition?: string | null
          created_at?: string | null
          email: string
          energy_certificate?: string | null
          estimated_value?: number | null
          features?: string | null
          full_name: string
          id?: string
          market_trends?: string | null
          monthly_rental_estimate?: number | null
          orientation?: string | null
          phone?: string | null
          plot_size_sqm?: number | null
          price_per_sqm?: number | null
          price_range_high?: number | null
          price_range_low?: number | null
          property_type?: string | null
          terrace_size_sqm?: number | null
          views?: string | null
          year_built?: number | null
          zone_id?: string | null
        }
        Update: {
          address?: string
          analysis?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_size_sqm?: number | null
          city?: string | null
          comparable_properties?: Json | null
          condition?: string | null
          created_at?: string | null
          email?: string
          energy_certificate?: string | null
          estimated_value?: number | null
          features?: string | null
          full_name?: string
          id?: string
          market_trends?: string | null
          monthly_rental_estimate?: number | null
          orientation?: string | null
          phone?: string | null
          plot_size_sqm?: number | null
          price_per_sqm?: number | null
          price_range_high?: number | null
          price_range_low?: number | null
          property_type?: string | null
          terrace_size_sqm?: number | null
          views?: string | null
          year_built?: number | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_sell_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_impressions: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string
          lead_type: string
          position: number | null
          professional_id: string
          was_clicked: boolean | null
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id: string
          lead_type: string
          position?: number | null
          professional_id: string
          was_clicked?: boolean | null
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string
          lead_type?: string
          position?: number | null
          professional_id?: string
          was_clicked?: boolean | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_impressions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_impressions_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_zones: {
        Row: {
          expires_at: string | null
          id: string
          is_active: boolean | null
          professional_id: string
          starts_at: string | null
          tier: string
          zone_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          professional_id: string
          starts_at?: string | null
          tier: string
          zone_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          professional_id?: string
          starts_at?: string | null
          tier?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_zones_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_zones_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          bio: string | null
          company_name: string
          contact_name: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          logo_url: string | null
          phone: string | null
          photo_url: string | null
          type: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name: string
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          phone?: string | null
          photo_url?: string | null
          type: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          phone?: string | null
          photo_url?: string | null
          type?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      properties_for_rent: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_size_sqm: number | null
          city: string
          created_at: string | null
          description: string | null
          external_id: string | null
          features: string[] | null
          id: string
          image_urls: string[] | null
          is_active: boolean | null
          is_furnished: string | null
          latitude: number | null
          listed_date: string | null
          listing_url: string | null
          longitude: number | null
          monthly_rent: number
          plot_size_sqm: number | null
          property_type: string | null
          rent_per_sqm: number | null
          rental_type: string | null
          scraped_at: string | null
          source: string
          terrace_size_sqm: number | null
          title: string | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_size_sqm?: number | null
          city: string
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean | null
          is_furnished?: string | null
          latitude?: number | null
          listed_date?: string | null
          listing_url?: string | null
          longitude?: number | null
          monthly_rent: number
          plot_size_sqm?: number | null
          property_type?: string | null
          rent_per_sqm?: number | null
          rental_type?: string | null
          scraped_at?: string | null
          source: string
          terrace_size_sqm?: number | null
          title?: string | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_size_sqm?: number | null
          city?: string
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean | null
          is_furnished?: string | null
          latitude?: number | null
          listed_date?: string | null
          listing_url?: string | null
          longitude?: number | null
          monthly_rent?: number
          plot_size_sqm?: number | null
          property_type?: string | null
          rent_per_sqm?: number | null
          rental_type?: string | null
          scraped_at?: string | null
          source?: string
          terrace_size_sqm?: number | null
          title?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_for_rent_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      properties_for_sale: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_size_sqm: number | null
          city: string
          created_at: string | null
          description: string | null
          external_id: string | null
          features: string[] | null
          id: string
          image_urls: string[] | null
          is_active: boolean | null
          latitude: number | null
          listed_date: string | null
          listing_url: string | null
          longitude: number | null
          plot_size_sqm: number | null
          price: number
          price_per_sqm: number | null
          property_type: string | null
          scraped_at: string | null
          source: string
          terrace_size_sqm: number | null
          title: string | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_size_sqm?: number | null
          city: string
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          listed_date?: string | null
          listing_url?: string | null
          longitude?: number | null
          plot_size_sqm?: number | null
          price: number
          price_per_sqm?: number | null
          property_type?: string | null
          scraped_at?: string | null
          source: string
          terrace_size_sqm?: number | null
          title?: string | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_size_sqm?: number | null
          city?: string
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          listed_date?: string | null
          listing_url?: string | null
          longitude?: number | null
          plot_size_sqm?: number | null
          price?: number
          price_per_sqm?: number | null
          property_type?: string | null
          scraped_at?: string | null
          source?: string
          terrace_size_sqm?: number | null
          title?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_for_sale_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      short_term_rentals: {
        Row: {
          annual_revenue: number | null
          avg_daily_rate: number | null
          avg_monthly_rate: number | null
          avg_weekly_rate: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          external_id: string | null
          high_season_daily_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          low_season_daily_rate: number | null
          occupancy_rate: number | null
          property_type: string | null
          rating: number | null
          review_count: number | null
          scraped_at: string | null
          source: string | null
          title: string | null
          zone_id: string | null
        }
        Insert: {
          annual_revenue?: number | null
          avg_daily_rate?: number | null
          avg_monthly_rate?: number | null
          avg_weekly_rate?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          external_id?: string | null
          high_season_daily_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          low_season_daily_rate?: number | null
          occupancy_rate?: number | null
          property_type?: string | null
          rating?: number | null
          review_count?: number | null
          scraped_at?: string | null
          source?: string | null
          title?: string | null
          zone_id?: string | null
        }
        Update: {
          annual_revenue?: number | null
          avg_daily_rate?: number | null
          avg_monthly_rate?: number | null
          avg_weekly_rate?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          external_id?: string | null
          high_season_daily_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          low_season_daily_rate?: number | null
          occupancy_rate?: number | null
          property_type?: string | null
          rating?: number | null
          review_count?: number | null
          scraped_at?: string | null
          source?: string | null
          title?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "short_term_rentals_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      valuation_feedback: {
        Row: {
          actual_value: number | null
          comment: string | null
          created_at: string | null
          id: string
          lead_id: string
          lead_type: string
          rating: number | null
        }
        Insert: {
          actual_value?: number | null
          comment?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          lead_type: string
          rating?: number | null
        }
        Update: {
          actual_value?: number | null
          comment?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          lead_type?: string
          rating?: number | null
        }
        Relationships: []
      }
      zones: {
        Row: {
          country: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          region: string
          slug: string
        }
        Insert: {
          country?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          region: string
          slug: string
        }
        Update: {
          country?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          region?: string
          slug?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
