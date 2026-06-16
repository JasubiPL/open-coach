/**
 * Tipos de la base de datos.
 *
 * ⚠️ Este archivo se GENERA con:
 *   pnpm db:types   (supabase gen types typescript --local)
 *
 * Cubre las migraciones 0001–0004 (organizations, profiles + esquema core). Se
 * mantiene a mano mientras no haya Supabase local; regenerar tras cada migración.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: 'active' | 'suspended' | 'trial';
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: 'active' | 'suspended' | 'trial';
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: 'active' | 'suspended' | 'trial';
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          role: 'trainer' | 'client' | 'super_admin';
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          birth_date: string | null;
          medical_notes: string | null;
          member_since: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          role: 'trainer' | 'client' | 'super_admin';
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          medical_notes?: string | null;
          member_since?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          role?: 'trainer' | 'client' | 'super_admin';
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          medical_notes?: string | null;
          member_since?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      membership_plans: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          price_cents: number;
          currency: string;
          interval: 'month' | 'year' | 'custom';
          features: Json;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          price_cents?: number;
          currency?: string;
          interval?: 'month' | 'year' | 'custom';
          features?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          price_cents?: number;
          currency?: string;
          interval?: 'month' | 'year' | 'custom';
          features?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'membership_plans_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      client_memberships: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          plan_id: string;
          status: 'active' | 'expired' | 'pending';
          start_date: string;
          end_date: string | null;
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          client_id: string;
          plan_id: string;
          status?: 'active' | 'expired' | 'pending';
          start_date?: string;
          end_date?: string | null;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          client_id?: string;
          plan_id?: string;
          status?: 'active' | 'expired' | 'pending';
          start_date?: string;
          end_date?: string | null;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'client_memberships_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'client_memberships_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'client_memberships_plan_id_fkey';
            columns: ['plan_id'];
            referencedRelation: 'membership_plans';
            referencedColumns: ['id'];
          },
        ];
      };
      routines: {
        Row: {
          id: string;
          organization_id: string;
          created_by: string | null;
          name: string;
          description: string | null;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          created_by?: string | null;
          name: string;
          description?: string | null;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          created_by?: string | null;
          name?: string;
          description?: string | null;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'routines_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      routine_exercises: {
        Row: {
          id: string;
          routine_id: string;
          organization_id: string;
          position: number;
          name: string;
          sets: number | null;
          reps: string | null;
          rest_seconds: number | null;
          suggested_weight: string | null;
          notes: string | null;
          media_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          routine_id: string;
          organization_id: string;
          position?: number;
          name: string;
          sets?: number | null;
          reps?: string | null;
          rest_seconds?: number | null;
          suggested_weight?: string | null;
          notes?: string | null;
          media_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          routine_id?: string;
          organization_id?: string;
          position?: number;
          name?: string;
          sets?: number | null;
          reps?: string | null;
          rest_seconds?: number | null;
          suggested_weight?: string | null;
          notes?: string | null;
          media_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'routine_exercises_routine_id_fkey';
            columns: ['routine_id'];
            referencedRelation: 'routines';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'routine_exercises_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      diet_plans: {
        Row: {
          id: string;
          organization_id: string;
          created_by: string | null;
          name: string;
          description: string | null;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          created_by?: string | null;
          name: string;
          description?: string | null;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          created_by?: string | null;
          name?: string;
          description?: string | null;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'diet_plans_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      meals: {
        Row: {
          id: string;
          diet_plan_id: string;
          organization_id: string;
          position: number;
          title: string;
          items: Json;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          diet_plan_id: string;
          organization_id: string;
          position?: number;
          title: string;
          items?: Json;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          diet_plan_id?: string;
          organization_id?: string;
          position?: number;
          title?: string;
          items?: Json;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meals_diet_plan_id_fkey';
            columns: ['diet_plan_id'];
            referencedRelation: 'diet_plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meals_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      assignments: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          assigned_by: string | null;
          type: 'routine' | 'diet';
          routine_id: string | null;
          diet_plan_id: string | null;
          title: string;
          content_snapshot: Json;
          frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
          start_date: string;
          end_date: string | null;
          days_of_week: number[] | null;
          custom_dates: string[] | null;
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          client_id: string;
          assigned_by?: string | null;
          type: 'routine' | 'diet';
          routine_id?: string | null;
          diet_plan_id?: string | null;
          title: string;
          content_snapshot: Json;
          frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
          start_date: string;
          end_date?: string | null;
          days_of_week?: number[] | null;
          custom_dates?: string[] | null;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          client_id?: string;
          assigned_by?: string | null;
          type?: 'routine' | 'diet';
          routine_id?: string | null;
          diet_plan_id?: string | null;
          title?: string;
          content_snapshot?: Json;
          frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
          start_date?: string;
          end_date?: string | null;
          days_of_week?: number[] | null;
          custom_dates?: string[] | null;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assignments_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assignments_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assignments_routine_id_fkey';
            columns: ['routine_id'];
            referencedRelation: 'routines';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assignments_diet_plan_id_fkey';
            columns: ['diet_plan_id'];
            referencedRelation: 'diet_plans';
            referencedColumns: ['id'];
          },
        ];
      };
      progress_logs: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          logged_at: string;
          weight_kg: number | null;
          body_fat_pct: number | null;
          measurements: Json;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          client_id: string;
          logged_at?: string;
          weight_kg?: number | null;
          body_fat_pct?: number | null;
          measurements?: Json;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          client_id?: string;
          logged_at?: string;
          weight_kg?: number | null;
          body_fat_pct?: number | null;
          measurements?: Json;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'progress_logs_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'progress_logs_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      progress_photos: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          storage_path: string;
          taken_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          client_id: string;
          storage_path: string;
          taken_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          client_id?: string;
          storage_path?: string;
          taken_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'progress_photos_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'progress_photos_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      adherence_logs: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          assignment_id: string;
          log_date: string;
          exercise_ref: string | null;
          completed: boolean;
          created_at: string;
          completed_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          client_id: string;
          assignment_id: string;
          log_date: string;
          exercise_ref?: string | null;
          completed?: boolean;
          created_at?: string;
          completed_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          client_id?: string;
          assignment_id?: string;
          log_date?: string;
          exercise_ref?: string | null;
          completed?: boolean;
          created_at?: string;
          completed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'adherence_logs_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'adherence_logs_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'adherence_logs_assignment_id_fkey';
            columns: ['assignment_id'];
            referencedRelation: 'assignments';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string;
          membership_id: string | null;
          amount_cents: number;
          currency: string;
          method: 'cash' | 'transfer' | 'card' | 'stripe' | 'other';
          status: 'paid' | 'pending' | 'failed' | 'refunded';
          paid_at: string | null;
          recorded_by: string | null;
          stripe_payment_intent_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          client_id: string;
          membership_id?: string | null;
          amount_cents: number;
          currency?: string;
          method?: 'cash' | 'transfer' | 'card' | 'stripe' | 'other';
          status?: 'paid' | 'pending' | 'failed' | 'refunded';
          paid_at?: string | null;
          recorded_by?: string | null;
          stripe_payment_intent_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          client_id?: string;
          membership_id?: string | null;
          amount_cents?: number;
          currency?: string;
          method?: 'cash' | 'transfer' | 'card' | 'stripe' | 'other';
          status?: 'paid' | 'pending' | 'failed' | 'refunded';
          paid_at?: string | null;
          recorded_by?: string | null;
          stripe_payment_intent_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_membership_id_fkey';
            columns: ['membership_id'];
            referencedRelation: 'client_memberships';
            referencedColumns: ['id'];
          },
        ];
      };
      notes: {
        Row: {
          id: string;
          organization_id: string;
          author_id: string;
          client_id: string | null;
          title: string | null;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          author_id: string;
          client_id?: string | null;
          title?: string | null;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          author_id?: string;
          client_id?: string | null;
          title?: string | null;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_org_id: { Args: Record<PropertyKey, never>; Returns: string };
      is_trainer: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_super_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
