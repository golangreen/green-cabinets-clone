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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alert_history: {
        Row: {
          alert_type: string
          details: Json | null
          id: string
          sent_at: string
        }
        Insert: {
          alert_type: string
          details?: Json | null
          id?: string
          sent_at?: string
        }
        Update: {
          alert_type?: string
          details?: Json | null
          id?: string
          sent_at?: string
        }
        Relationships: []
      }
      block_history: {
        Row: {
          action: string
          auto_blocked: boolean
          blocked_until: string | null
          created_at: string
          id: string
          ip_address: string
          performed_by: string | null
          reason: string | null
        }
        Insert: {
          action: string
          auto_blocked?: boolean
          blocked_until?: string | null
          created_at?: string
          id?: string
          ip_address: string
          performed_by?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          auto_blocked?: boolean
          blocked_until?: string | null
          created_at?: string
          id?: string
          ip_address?: string
          performed_by?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          auto_blocked: boolean
          blocked_at: string
          blocked_until: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string
          reason: string
          violation_count: number
        }
        Insert: {
          auto_blocked?: boolean
          blocked_at?: string
          blocked_until: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address: string
          reason: string
          violation_count?: number
        }
        Update: {
          auto_blocked?: boolean
          blocked_at?: string
          blocked_until?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string
          reason?: string
          violation_count?: number
        }
        Relationships: []
      }
      email_delivery_log: {
        Row: {
          created_at: string | null
          email_id: string
          email_type: string
          event_data: Json | null
          id: string
          recipient_email: string
          role: Database["public"]["Enums"]["app_role"] | null
          status: string
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_id: string
          email_type: string
          event_data?: Json | null
          id?: string
          recipient_email: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status: string
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_id?: string
          email_type?: string
          event_data?: Json | null
          id?: string
          recipient_email?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_change_audit: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          performed_by_email: string
          performed_by_id: string
          role: Database["public"]["Enums"]["app_role"]
          target_user_email: string
          target_user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by_email: string
          performed_by_id: string
          role: Database["public"]["Enums"]["app_role"]
          target_user_email: string
          target_user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by_email?: string
          performed_by_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          target_user_email?: string
          target_user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          client_ip: string
          created_at: string
          details: Json | null
          event_type: string
          function_name: string
          id: string
          severity: string
        }
        Insert: {
          client_ip: string
          created_at?: string
          details?: Json | null
          event_type: string
          function_name: string
          id?: string
          severity: string
        }
        Update: {
          client_ip?: string
          created_at?: string
          details?: Json | null
          event_type?: string
          function_name?: string
          id?: string
          severity?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_temporary: boolean | null
          reminder_3day_sent: boolean | null
          reminder_sent: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_temporary?: boolean | null
          reminder_3day_sent?: boolean | null
          reminder_sent?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_temporary?: boolean | null
          reminder_3day_sent?: boolean | null
          reminder_sent?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          client_ip: string | null
          created_at: string
          event_type: string
          id: string
          processed_at: string
          svix_id: string
        }
        Insert: {
          client_ip?: string | null
          created_at?: string
          event_type: string
          id?: string
          processed_at?: string
          svix_id: string
        }
        Update: {
          client_ip?: string | null
          created_at?: string
          event_type?: string
          id?: string
          processed_at?: string
          svix_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_role:
        | {
            Args: {
              target_role: Database["public"]["Enums"]["app_role"]
              target_user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              expiration_date?: string
              target_role: Database["public"]["Enums"]["app_role"]
              target_user_id: string
            }
            Returns: Json
          }
      auto_block_ip: {
        Args: {
          block_duration_hours?: number
          target_ip: string
          violation_threshold?: number
        }
        Returns: Json
      }
      bulk_add_user_role: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_ids: string[]
        }
        Returns: Json
      }
      bulk_extend_role_expiration: {
        Args: { role_extensions: Json }
        Returns: Json
      }
      bulk_remove_user_role: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_ids: string[]
        }
        Returns: Json
      }
      cleanup_expired_blocks: { Args: never; Returns: number }
      cleanup_old_webhook_events: { Args: never; Returns: number }
      extend_role_expiration: {
        Args: {
          new_expiration_date: string
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: Json
      }
      get_all_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          role_details: Json[]
          roles: Database["public"]["Enums"]["app_role"][]
          user_id: string
        }[]
      }
      get_blocked_ip_info: {
        Args: { check_ip: string }
        Returns: {
          blocked: boolean
          blocked_until: string
          reason: string
          violation_count: number
        }[]
      }
      get_email_delivery_stats: {
        Args: { days_back?: number }
        Returns: {
          delivery_rate: number
          total_bounced: number
          total_complained: number
          total_delivered: number
          total_failed: number
          total_sent: number
        }[]
      }
      get_expired_roles: {
        Args: never
        Returns: {
          expires_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_email: string
          user_id: string
        }[]
      }
      get_expiring_roles: {
        Args: { hours_before?: number }
        Returns: {
          expires_at: string
          hours_until_expiry: number
          role: Database["public"]["Enums"]["app_role"]
          user_email: string
          user_id: string
        }[]
      }
      get_expiring_roles_by_stage: {
        Args: { hours_before?: number; reminder_stage?: string }
        Returns: {
          expires_at: string
          hours_until_expiry: number
          role: Database["public"]["Enums"]["app_role"]
          user_email: string
          user_id: string
        }[]
      }
      get_roles_expiring_within_days: {
        Args: { days_ahead?: number }
        Returns: {
          days_until_expiry: number
          expires_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_email: string
          user_id: string
        }[]
      }
      get_security_summary: {
        Args: { time_window_minutes?: number }
        Returns: {
          event_count: number
          event_type: string
          severity: string
          unique_ips: number
        }[]
      }
      get_suspicious_ips: {
        Args: { threshold?: number; time_window_minutes?: number }
        Returns: {
          client_ip: string
          first_violation: string
          functions_affected: string[]
          last_violation: string
          violation_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ip_blocked: { Args: { check_ip: string }; Returns: boolean }
      log_role_change: {
        Args: {
          p_action: string
          p_details?: Json
          p_role: Database["public"]["Enums"]["app_role"]
          p_target_user_email: string
          p_target_user_id: string
        }
        Returns: undefined
      }
      manual_block_ip: {
        Args: {
          block_duration_hours?: number
          block_reason: string
          performed_by_user?: string
          target_ip: string
        }
        Returns: Json
      }
      mark_3day_reminder_sent: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      mark_reminder_sent: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      remove_expired_roles: { Args: never; Returns: Json }
      remove_user_role: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: Json
      }
      unblock_ip: {
        Args: {
          performed_by_user?: string
          target_ip: string
          unblock_reason?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
