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
      agent_contact_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          interest: string | null
          message: string | null
          name: string
          phone: string | null
          professional_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          interest?: string | null
          message?: string | null
          name: string
          phone?: string | null
          professional_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          interest?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_contact_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          lead_id: string | null
          professional_id: string
          rating: number
          reviewer_name: string
          reviewer_role: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          lead_id?: string | null
          professional_id: string
          rating: number
          reviewer_name: string
          reviewer_role?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          lead_id?: string | null
          professional_id?: string
          rating?: number
          reviewer_name?: string
          reviewer_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_team_members: {
        Row: {
          avg_rating: number | null
          created_at: string | null
          email: string | null
          id: string
          languages: string[] | null
          name: string
          phone: string | null
          photo_url: string | null
          professional_id: string
          role: string | null
          sort_order: number | null
          total_reviews: number | null
        }
        Insert: {
          avg_rating?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          languages?: string[] | null
          name: string
          phone?: string | null
          photo_url?: string | null
          professional_id: string
          role?: string | null
          sort_order?: number | null
          total_reviews?: number | null
        }
        Update: {
          avg_rating?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          languages?: string[] | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          professional_id?: string
          role?: string | null
          sort_order?: number | null
          total_reviews?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_team_members_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      buy_analyses: {
        Row: {
          address: string | null
          analysis: string | null
          area_median_price_per_m2: number | null
          asking_price: number
          asking_price_per_m2: number | null
          bathrooms: number | null
          city: string | null
          comparable_properties: Json | null
          comparables_count: number | null
          confidence_level: string | null
          created_at: string | null
          email: string | null
          estimated_high: number | null
          estimated_low: number | null
          estimated_price_per_m2: number | null
          estimated_value: number | null
          feature_adjustments: Json | null
          features: Json | null
          id: string
          image_urls: string[] | null
          latitude: number | null
          longitude: number | null
          market_trends: string | null
          price_deviation_percent: number | null
          price_score: string | null
          property_code: string | null
          property_type: string | null
          rooms: number | null
          size_m2: number | null
          source_platform: string | null
          source_url: string
          status: string | null
          thumbnail_url: string | null
        }
        Insert: {
          address?: string | null
          analysis?: string | null
          area_median_price_per_m2?: number | null
          asking_price: number
          asking_price_per_m2?: number | null
          bathrooms?: number | null
          city?: string | null
          comparable_properties?: Json | null
          comparables_count?: number | null
          confidence_level?: string | null
          created_at?: string | null
          email?: string | null
          estimated_high?: number | null
          estimated_low?: number | null
          estimated_price_per_m2?: number | null
          estimated_value?: number | null
          feature_adjustments?: Json | null
          features?: Json | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          market_trends?: string | null
          price_deviation_percent?: number | null
          price_score?: string | null
          property_code?: string | null
          property_type?: string | null
          rooms?: number | null
          size_m2?: number | null
          source_platform?: string | null
          source_url: string
          status?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          address?: string | null
          analysis?: string | null
          area_median_price_per_m2?: number | null
          asking_price?: number
          asking_price_per_m2?: number | null
          bathrooms?: number | null
          city?: string | null
          comparable_properties?: Json | null
          comparables_count?: number | null
          confidence_level?: string | null
          created_at?: string | null
          email?: string | null
          estimated_high?: number | null
          estimated_low?: number | null
          estimated_price_per_m2?: number | null
          estimated_value?: number | null
          feature_adjustments?: Json | null
          features?: Json | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          market_trends?: string | null
          price_deviation_percent?: number | null
          price_score?: string | null
          property_code?: string | null
          property_type?: string | null
          rooms?: number | null
          size_m2?: number | null
          source_platform?: string | null
          source_url?: string
          status?: string | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
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
          latitude: number | null
          longitude: number | null
          monthly_long_term_estimate: number | null
          occupancy_estimate: number | null
          phone: string | null
          property_features: string | null
          property_type: string | null
          rental_preference: string | null
          seasonal_breakdown: Json | null
          status: string | null
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
          latitude?: number | null
          longitude?: number | null
          monthly_long_term_estimate?: number | null
          occupancy_estimate?: number | null
          phone?: string | null
          property_features?: string | null
          property_type?: string | null
          rental_preference?: string | null
          seasonal_breakdown?: Json | null
          status?: string | null
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
          latitude?: number | null
          longitude?: number | null
          monthly_long_term_estimate?: number | null
          occupancy_estimate?: number | null
          phone?: string | null
          property_features?: string | null
          property_type?: string | null
          rental_preference?: string | null
          seasonal_breakdown?: Json | null
          status?: string | null
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
          latitude: number | null
          longitude: number | null
          market_trends: string | null
          monthly_rental_estimate: number | null
          orientation: string | null
          phone: string | null
          plot_size_sqm: number | null
          price_per_sqm: number | null
          price_range_high: number | null
          price_range_low: number | null
          property_type: string | null
          status: string | null
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
          latitude?: number | null
          longitude?: number | null
          market_trends?: string | null
          monthly_rental_estimate?: number | null
          orientation?: string | null
          phone?: string | null
          plot_size_sqm?: number | null
          price_per_sqm?: number | null
          price_range_high?: number | null
          price_range_low?: number | null
          property_type?: string | null
          status?: string | null
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
          latitude?: number | null
          longitude?: number | null
          market_trends?: string | null
          monthly_rental_estimate?: number | null
          orientation?: string | null
          phone?: string | null
          plot_size_sqm?: number | null
          price_per_sqm?: number | null
          price_range_high?: number | null
          price_range_low?: number | null
          property_type?: string | null
          status?: string | null
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
          avg_rating: number | null
          bio: string | null
          company_name: string
          contact_name: string
          cover_photo_url: string | null
          created_at: string | null
          description: string | null
          email: string
          facebook_url: string | null
          founded_year: number | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          linkedin_url: string | null
          logo_url: string | null
          office_address: string | null
          phone: string | null
          photo_url: string | null
          service_zones: string[] | null
          slug: string
          tagline: string | null
          team_size: number | null
          total_reviews: number | null
          type: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          avg_rating?: number | null
          bio?: string | null
          company_name: string
          contact_name: string
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          facebook_url?: string | null
          founded_year?: number | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          logo_url?: string | null
          office_address?: string | null
          phone?: string | null
          photo_url?: string | null
          service_zones?: string[] | null
          slug: string
          tagline?: string | null
          team_size?: number | null
          total_reviews?: number | null
          type: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          avg_rating?: number | null
          bio?: string | null
          company_name?: string
          contact_name?: string
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          facebook_url?: string | null
          founded_year?: number | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          logo_url?: string | null
          office_address?: string | null
          phone?: string | null
          photo_url?: string | null
          service_zones?: string[] | null
          slug?: string
          tagline?: string | null
          team_size?: number | null
          total_reviews?: number | null
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
          location_point: unknown
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
          location_point?: unknown
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
          location_point?: unknown
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
          location_point: unknown
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
          location_point?: unknown
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
          location_point?: unknown
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
      scrape_jobs: {
        Row: {
          apify_run_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          items_found: number | null
          items_upserted: number | null
          started_at: string | null
          status: string
          zone_id: string
        }
        Insert: {
          apify_run_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_found?: number | null
          items_upserted?: number | null
          started_at?: string | null
          status?: string
          zone_id: string
        }
        Update: {
          apify_run_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_found?: number | null
          items_upserted?: number | null
          started_at?: string | null
          status?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_zones: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_scraped_at: string | null
          location_id: string
          property_count: number | null
          scrape_interval_days: number | null
          tier: string
          zone_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          location_id: string
          property_count?: number | null
          scrape_interval_days?: number | null
          tier: string
          zone_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          location_id?: string
          property_count?: number | null
          scrape_interval_days?: number | null
          tier?: string
          zone_name?: string
        }
        Relationships: []
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
          center_lat: number | null
          center_lng: number | null
          country: string
          created_at: string | null
          id: string
          idealista_location: string | null
          idealista_operation: string | null
          is_active: boolean | null
          last_scrape_count: number | null
          last_scrape_status: string | null
          last_scraped_at: string | null
          max_items: number | null
          municipality: string | null
          name: string
          province: string | null
          region: string
          slug: string
          tier: string | null
          total_properties: number | null
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          country?: string
          created_at?: string | null
          id?: string
          idealista_location?: string | null
          idealista_operation?: string | null
          is_active?: boolean | null
          last_scrape_count?: number | null
          last_scrape_status?: string | null
          last_scraped_at?: string | null
          max_items?: number | null
          municipality?: string | null
          name: string
          province?: string | null
          region: string
          slug: string
          tier?: string | null
          total_properties?: number | null
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          country?: string
          created_at?: string | null
          id?: string
          idealista_location?: string | null
          idealista_operation?: string | null
          is_active?: boolean | null
          last_scrape_count?: number | null
          last_scrape_status?: string | null
          last_scraped_at?: string | null
          max_items?: number | null
          municipality?: string | null
          name?: string
          province?: string | null
          region?: string
          slug?: string
          tier?: string | null
          total_properties?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      deactivate_stale_properties: { Args: never; Returns: undefined }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_rent_comparables: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_property_type: string
          p_radius_km?: number
          p_rooms: number
          p_size_m2: number
        }
        Returns: {
          address: string
          bathrooms: number
          bedrooms: number
          built_size_sqm: number
          city: string
          distance_km: number
          features: string[]
          id: string
          image_urls: string[]
          latitude: number
          listing_url: string
          longitude: number
          monthly_rent: number
          property_type: string
          rent_per_sqm: number
          scraped_at: string
        }[]
      }
      find_sale_comparables: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_property_type: string
          p_radius_km?: number
          p_rooms: number
          p_size_m2: number
        }
        Returns: {
          address: string
          bathrooms: number
          bedrooms: number
          built_size_sqm: number
          city: string
          distance_km: number
          features: string[]
          id: string
          image_urls: string[]
          latitude: number
          listing_url: string
          longitude: number
          price: number
          price_per_sqm: number
          property_type: string
          scraped_at: string
        }[]
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      match_agents_by_location: {
        Args: { p_lat: number; p_limit?: number; p_lng: number }
        Returns: {
          avg_rating: number
          bio: string
          company_name: string
          distance_km: number
          id: string
          is_verified: boolean
          languages: string[]
          logo_url: string
          slug: string
          tagline: string
          total_reviews: number
          website: string
        }[]
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      queue_due_scrapes: { Args: never; Returns: undefined }
      refresh_search_views: { Args: never; Returns: undefined }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      system_health_check: { Args: never; Returns: Json }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "agent" | "user"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
    Enums: {
      app_role: ["admin", "agent", "user"],
    },
  },
} as const
