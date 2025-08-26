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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          category: string | null
          clicks: number | null
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          description: string | null
          headline: string | null
          id: string
          main_image_url: string | null
          name: string
          status: string | null
          sub_image_url: string | null
          subheading: string | null
          target_url: string | null
          updated_at: string | null
          upload_date: string | null
          url: string
        }
        Insert: {
          category?: string | null
          clicks?: number | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          main_image_url?: string | null
          name: string
          status?: string | null
          sub_image_url?: string | null
          subheading?: string | null
          target_url?: string | null
          updated_at?: string | null
          upload_date?: string | null
          url: string
        }
        Update: {
          category?: string | null
          clicks?: number | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          main_image_url?: string | null
          name?: string
          status?: string | null
          sub_image_url?: string | null
          subheading?: string | null
          target_url?: string | null
          updated_at?: string | null
          upload_date?: string | null
          url?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          color: string | null
          created_at: string | null
          criteria: string
          description: string
          icon: string | null
          id: string
          image_url: string | null
          name: string
          rarity: string | null
          requirements: string | null
          reward: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          criteria: string
          description: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          rarity?: string | null
          requirements?: string | null
          reward?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          criteria?: string
          description?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rarity?: string | null
          requirements?: string | null
          reward?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_content: {
        Row: {
          category: string
          created_at: string | null
          duration: string | null
          id: string
          status: string | null
          title: string
          type: string
          updated_at: string | null
          upload_date: string | null
          views: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          duration?: string | null
          id?: string
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          upload_date?: string | null
          views?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          duration?: string | null
          id?: string
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          upload_date?: string | null
          views?: number | null
        }
        Relationships: []
      }
      lenders: {
        Row: {
          ae_email: string | null
          ae_extension: string | null
          ae_name: string | null
          ae_phone: string | null
          ae_photo: string | null
          ae_title: string | null
          company_address: string | null
          company_city: string | null
          company_description: string | null
          company_email: string | null
          company_logo: string | null
          company_name: string
          company_phone: string | null
          company_state: string | null
          company_website: string | null
          company_zip: string | null
          created_at: string | null
          has_bank_statement: boolean | null
          has_conventional: boolean | null
          has_dpa: boolean | null
          has_dscr: boolean | null
          has_fha: boolean | null
          has_heloc: boolean | null
          has_jumbo: boolean | null
          has_usda: boolean | null
          has_va: boolean | null
          id: string
          notes: string | null
          priority: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ae_email?: string | null
          ae_extension?: string | null
          ae_name?: string | null
          ae_phone?: string | null
          ae_photo?: string | null
          ae_title?: string | null
          company_address?: string | null
          company_city?: string | null
          company_description?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name: string
          company_phone?: string | null
          company_state?: string | null
          company_website?: string | null
          company_zip?: string | null
          created_at?: string | null
          has_bank_statement?: boolean | null
          has_conventional?: boolean | null
          has_dpa?: boolean | null
          has_dscr?: boolean | null
          has_fha?: boolean | null
          has_heloc?: boolean | null
          has_jumbo?: boolean | null
          has_usda?: boolean | null
          has_va?: boolean | null
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ae_email?: string | null
          ae_extension?: string | null
          ae_name?: string | null
          ae_phone?: string | null
          ae_photo?: string | null
          ae_title?: string | null
          company_address?: string | null
          company_city?: string | null
          company_description?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string
          company_phone?: string | null
          company_state?: string | null
          company_website?: string | null
          company_zip?: string | null
          created_at?: string | null
          has_bank_statement?: boolean | null
          has_conventional?: boolean | null
          has_dpa?: boolean | null
          has_dscr?: boolean | null
          has_fha?: boolean | null
          has_heloc?: boolean | null
          has_jumbo?: boolean | null
          has_usda?: boolean | null
          has_va?: boolean | null
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          created_at: string | null
          id: string
          treasury_10yr: number | null
          treasury_10yr_change: number | null
          treasury_10yr_positive: boolean | null
          umbs_30yr_5: number | null
          umbs_30yr_5_change: number | null
          umbs_30yr_5_positive: boolean | null
          umbs_30yr_55: number | null
          umbs_30yr_55_change: number | null
          umbs_30yr_55_positive: boolean | null
          umbs_30yr_6: number | null
          umbs_30yr_6_change: number | null
          umbs_30yr_6_positive: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          treasury_10yr?: number | null
          treasury_10yr_change?: number | null
          treasury_10yr_positive?: boolean | null
          umbs_30yr_5?: number | null
          umbs_30yr_5_change?: number | null
          umbs_30yr_5_positive?: boolean | null
          umbs_30yr_55?: number | null
          umbs_30yr_55_change?: number | null
          umbs_30yr_55_positive?: boolean | null
          umbs_30yr_6?: number | null
          umbs_30yr_6_change?: number | null
          umbs_30yr_6_positive?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          treasury_10yr?: number | null
          treasury_10yr_change?: number | null
          treasury_10yr_positive?: boolean | null
          umbs_30yr_5?: number | null
          umbs_30yr_5_change?: number | null
          umbs_30yr_5_positive?: boolean | null
          umbs_30yr_55?: number | null
          umbs_30yr_55_change?: number | null
          umbs_30yr_55_positive?: boolean | null
          umbs_30yr_6?: number | null
          umbs_30yr_6_change?: number | null
          umbs_30yr_6_positive?: boolean | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string
          category: string
          comments: number | null
          content: string
          created_at: string | null
          duration: string | null
          estimated_read_time: string | null
          id: string
          is_featured: boolean | null
          likes: number | null
          priority: string | null
          publish_date: string | null
          status: string | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          type: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author: string
          category: string
          comments?: number | null
          content: string
          created_at?: string | null
          duration?: string | null
          estimated_read_time?: string | null
          id?: string
          is_featured?: boolean | null
          likes?: number | null
          priority?: string | null
          publish_date?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          type: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author?: string
          category?: string
          comments?: number | null
          content?: string
          created_at?: string | null
          duration?: string | null
          estimated_read_time?: string | null
          id?: string
          is_featured?: boolean | null
          likes?: number | null
          priority?: string | null
          publish_date?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          day: string
          description: string | null
          id: string
          time: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date: string
          day: string
          description?: string | null
          id?: string
          time: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          day?: string
          description?: string | null
          id?: string
          time?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          attachments: Json | null
          comment: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          comment: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          comment?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string
          client_name: string | null
          created_at: string | null
          department: string | null
          description: string
          id: string
          internal_notes: string | null
          loan_number: string | null
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category: string
          client_name?: string | null
          created_at?: string | null
          department?: string | null
          description: string
          id?: string
          internal_notes?: string | null
          loan_number?: string | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string
          client_name?: string | null
          created_at?: string | null
          department?: string | null
          description?: string
          id?: string
          internal_notes?: string | null
          loan_number?: string | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string | null
          count: number | null
          date_obtained: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          count?: number | null
          date_obtained?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          count?: number | null
          date_obtained?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_performance: {
        Row: {
          active_recruits: number | null
          compensation: number | null
          created_at: string | null
          fire_fund_balance: number | null
          fire_fund_contribution: number | null
          fire_fund_receipt: number | null
          id: string
          month: number
          monthly_loans: number | null
          monthly_volume: number | null
          rank: number | null
          recruitment_tier: number | null
          updated_at: string | null
          user_id: string | null
          year: number
          ytd_loans: number | null
          ytd_volume: number | null
        }
        Insert: {
          active_recruits?: number | null
          compensation?: number | null
          created_at?: string | null
          fire_fund_balance?: number | null
          fire_fund_contribution?: number | null
          fire_fund_receipt?: number | null
          id?: string
          month: number
          monthly_loans?: number | null
          monthly_volume?: number | null
          rank?: number | null
          recruitment_tier?: number | null
          updated_at?: string | null
          user_id?: string | null
          year: number
          ytd_loans?: number | null
          ytd_volume?: number | null
        }
        Update: {
          active_recruits?: number | null
          compensation?: number | null
          created_at?: string | null
          fire_fund_balance?: number | null
          fire_fund_contribution?: number | null
          fire_fund_receipt?: number | null
          id?: string
          month?: number
          monthly_loans?: number | null
          monthly_volume?: number | null
          rank?: number | null
          recruitment_tier?: number | null
          updated_at?: string | null
          user_id?: string | null
          year?: number
          ytd_loans?: number | null
          ytd_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_relationships: {
        Row: {
          created_at: string | null
          id: string
          relationship_level: number
          updated_at: string | null
          upline_user_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          relationship_level?: number
          updated_at?: string | null
          upline_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          relationship_level?: number
          updated_at?: string | null
          upline_user_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_relationships_upline_user_id_fkey"
            columns: ["upline_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_relationships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          client_facing_title: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          internal_role: string | null
          is_producing: boolean | null
          last_login: string | null
          monthly_loan_volume: number | null
          name: string
          nmls_number: string | null
          phone: string | null
          recruiter_id: string | null
          recruiter_name: string | null
          recruiter_type: string | null
          role: string
          selected_badges: string[] | null
          session_timeout_minutes: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          client_facing_title?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          internal_role?: string | null
          is_producing?: boolean | null
          last_login?: string | null
          monthly_loan_volume?: number | null
          name: string
          nmls_number?: string | null
          phone?: string | null
          recruiter_id?: string | null
          recruiter_name?: string | null
          recruiter_type?: string | null
          role?: string
          selected_badges?: string[] | null
          session_timeout_minutes?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          client_facing_title?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          internal_role?: string | null
          is_producing?: boolean | null
          last_login?: string | null
          monthly_loan_volume?: number | null
          name?: string
          nmls_number?: string | null
          phone?: string | null
          recruiter_id?: string | null
          recruiter_name?: string | null
          recruiter_type?: string | null
          role?: string
          selected_badges?: string[] | null
          session_timeout_minutes?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      monthly_performance_summary: {
        Row: {
          active_recruits: number | null
          avatar: string | null
          avg_loan_size: number | null
          compensation: number | null
          created_at: string | null
          email: string | null
          fire_fund_balance: number | null
          fire_fund_contribution: number | null
          fire_fund_receipt: number | null
          month: number | null
          monthly_loans: number | null
          monthly_volume: number | null
          name: string | null
          prev_month_volume: number | null
          rank: number | null
          recruitment_tier: number | null
          role: string | null
          updated_at: string | null
          user_id: string | null
          volume_growth_percentage: number | null
          year: number | null
          ytd_loans: number | null
          ytd_volume: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_performance_for_graphs: {
        Args: {
          p_end_month?: number
          p_end_year?: number
          p_start_month?: number
          p_start_year?: number
          p_user_id: string
        }
        Returns: {
          avg_loan_size: number
          compensation: number
          fire_fund_balance: number
          fire_fund_contribution: number
          fire_fund_receipt: number
          month: number
          monthly_loans: number
          monthly_volume: number
          volume_growth_percentage: number
          year: number
        }[]
      }
      upsert_monthly_performance: {
        Args: {
          p_active_recruits?: number
          p_compensation?: number
          p_fire_fund_balance?: number
          p_fire_fund_contribution?: number
          p_fire_fund_receipt?: number
          p_month: number
          p_monthly_loans?: number
          p_monthly_volume?: number
          p_rank?: number
          p_recruitment_tier?: number
          p_user_id: string
          p_year: number
          p_ytd_loans?: number
          p_ytd_volume?: number
        }
        Returns: {
          active_recruits: number | null
          compensation: number | null
          created_at: string | null
          fire_fund_balance: number | null
          fire_fund_contribution: number | null
          fire_fund_receipt: number | null
          id: string
          month: number
          monthly_loans: number | null
          monthly_volume: number | null
          rank: number | null
          recruitment_tier: number | null
          updated_at: string | null
          user_id: string | null
          year: number
          ytd_loans: number | null
          ytd_volume: number | null
        }
      }
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
