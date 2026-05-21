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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      availability_release_items: {
        Row: {
          created_at: string
          grade: number | null
          id: string
          is_cover: boolean
          notes: string | null
          photo_url: string | null
          plant_id: string
          qty_available: number
          release_id: string
          tray_count: number
          unit_price: number | null
          website_visible: boolean
        }
        Insert: {
          created_at?: string
          grade?: number | null
          id?: string
          is_cover?: boolean
          notes?: string | null
          photo_url?: string | null
          plant_id: string
          qty_available?: number
          release_id: string
          tray_count?: number
          unit_price?: number | null
          website_visible?: boolean
        }
        Update: {
          created_at?: string
          grade?: number | null
          id?: string
          is_cover?: boolean
          notes?: string | null
          photo_url?: string | null
          plant_id?: string
          qty_available?: number
          release_id?: string
          tray_count?: number
          unit_price?: number | null
          website_visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "availability_release_items_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_release_items_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "availability_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_releases: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          org_id: string
          published_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          org_id: string
          published_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          published_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_releases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      bays: {
        Row: {
          area_sqft: number
          created_at: string
          data: Json
          id: string
          name: string
          notes: string | null
          updated_at: string
          usable_sqft: number | null
        }
        Insert: {
          area_sqft: number
          created_at?: string
          data?: Json
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          usable_sqft?: number | null
        }
        Update: {
          area_sqft?: number
          created_at?: string
          data?: Json
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          usable_sqft?: number | null
        }
        Relationships: []
      }
      buyer_contacts: {
        Row: {
          buyer_id: string
          created_at: string
          email: string
          id: string
          is_primary: boolean
          supabase_auth_id: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          email: string
          id?: string
          is_primary?: boolean
          supabase_auth_id?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          email?: string
          id?: string
          is_primary?: boolean
          supabase_auth_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_contacts_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          address_city: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          notes: string | null
          ref_number: string
        }
        Insert: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          ref_number?: string
        }
        Update: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          ref_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "kwg_users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          id: string
          kind: string
          name: string
          notes: string | null
          org: string | null
          phone: string | null
          tags: string[]
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          kind: string
          name: string
          notes?: string | null
          org?: string | null
          phone?: string | null
          tags?: string[]
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          kind?: string
          name?: string
          notes?: string | null
          org?: string | null
          phone?: string | null
          tags?: string[]
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      crops: {
        Row: {
          created_at: string
          data: Json
          default_pot_size_id: string | null
          growing_weeks: number | null
          id: string
          name: string
          notes: string | null
          updated_at: string
          variety: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          default_pot_size_id?: string | null
          growing_weeks?: number | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          variety?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          default_pot_size_id?: string | null
          growing_weeks?: number | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_default_pot_size_id_fkey"
            columns: ["default_pot_size_id"]
            isOneToOne: false
            referencedRelation: "pot_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          alternatives_considered: string | null
          context: string | null
          created_at: string
          created_by: string
          decided_at: string
          decision: string
          id: string
          outcome: string | null
          rationale: string | null
          title: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          alternatives_considered?: string | null
          context?: string | null
          created_at?: string
          created_by: string
          decided_at?: string
          decision: string
          id?: string
          outcome?: string | null
          rationale?: string | null
          title: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          alternatives_considered?: string | null
          context?: string | null
          created_at?: string
          created_by?: string
          decided_at?: string
          decision?: string
          id?: string
          outcome?: string | null
          rationale?: string | null
          title?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          kind: string
          max_attempts: number
          payload: Json
          scheduled_at: string
          started_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          kind: string
          max_attempts?: number
          payload?: Json
          scheduled_at?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          max_attempts?: number
          payload?: Json
          scheduled_at?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      kw_memories: {
        Row: {
          content: string
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
          type: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          name: string
          type: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      kwg_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          custom_description: string | null
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          custom_description?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          custom_description?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_submissions: {
        Row: {
          buyer_contact_id: string | null
          converted_order_id: string | null
          created_at: string
          email_provided: string | null
          id: string
          raw_payload: Json
          source: string
          status: string
        }
        Insert: {
          buyer_contact_id?: string | null
          converted_order_id?: string | null
          created_at?: string
          email_provided?: string | null
          id?: string
          raw_payload?: Json
          source?: string
          status?: string
        }
        Update: {
          buyer_contact_id?: string | null
          converted_order_id?: string | null
          created_at?: string
          email_provided?: string | null
          id?: string
          raw_payload?: Json
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_submissions_buyer_contact_id_fkey"
            columns: ["buyer_contact_id"]
            isOneToOne: false
            referencedRelation: "buyer_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_submissions_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          created_by_user_id: string | null
          id: string
          notes: string | null
          source: string
          status: string
          submission_id: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          notes?: string | null
          source: string
          status?: string
          submission_id?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          notes?: string | null
          source?: string
          status?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "kwg_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "order_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      org_users: {
        Row: {
          org_id: string
          user_id: string
        }
        Insert: {
          org_id: string
          user_id: string
        }
        Update: {
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          role_id: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          role_id: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          role_id?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_photos: {
        Row: {
          created_at: string | null
          id: string
          is_cover: boolean | null
          plant_id: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_cover?: boolean | null
          plant_id?: string | null
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_cover?: boolean | null
          plant_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_photos_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plantings: {
        Row: {
          bay_id: string
          created_at: string
          created_by: string
          crop_id: string
          data: Json
          id: string
          notes: string | null
          pot_count: number
          pot_size_id: string
          ship_target: string | null
          start_date: string | null
          status: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          bay_id: string
          created_at?: string
          created_by: string
          crop_id: string
          data?: Json
          id?: string
          notes?: string | null
          pot_count: number
          pot_size_id: string
          ship_target?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          bay_id?: string
          created_at?: string
          created_by?: string
          crop_id?: string
          data?: Json
          id?: string
          notes?: string | null
          pot_count?: number
          pot_size_id?: string
          ship_target?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantings_bay_id_fkey"
            columns: ["bay_id"]
            isOneToOne: false
            referencedRelation: "bays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantings_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantings_pot_size_id_fkey"
            columns: ["pot_size_id"]
            isOneToOne: false
            referencedRelation: "pot_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          active: boolean
          created_at: string
          genus: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          photo_url: string | null
          size: string | null
          sku: string
          tag: string | null
          tray_count: number
          type: string | null
          unit_price: number | null
          updated_at: string
          variety: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          genus?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          photo_url?: string | null
          size?: string | null
          sku: string
          tag?: string | null
          tray_count?: number
          type?: string | null
          unit_price?: number | null
          updated_at?: string
          variety?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          genus?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          photo_url?: string | null
          size?: string | null
          sku?: string
          tag?: string | null
          tray_count?: number
          type?: string | null
          unit_price?: number | null
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plants_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      pot_sizes: {
        Row: {
          data: Json
          footprint_sqft: number
          id: string
          label: string
          notes: string | null
        }
        Insert: {
          data?: Json
          footprint_sqft: number
          id?: string
          label: string
          notes?: string | null
        }
        Update: {
          data?: Json
          footprint_sqft?: number
          id?: string
          label?: string
          notes?: string | null
        }
        Relationships: []
      }
      raw_emails: {
        Row: {
          body: string | null
          from_address: string | null
          html: string | null
          id: string
          ingested_at: string
          received_at: string
          source: string
          source_id: string
          subject: string | null
          to_addresses: string[] | null
        }
        Insert: {
          body?: string | null
          from_address?: string | null
          html?: string | null
          id?: string
          ingested_at?: string
          received_at: string
          source: string
          source_id: string
          subject?: string | null
          to_addresses?: string[] | null
        }
        Update: {
          body?: string | null
          from_address?: string | null
          html?: string | null
          id?: string
          ingested_at?: string
          received_at?: string
          source?: string
          source_id?: string
          subject?: string | null
          to_addresses?: string[] | null
        }
        Relationships: []
      }
      raw_files: {
        Row: {
          id: string
          ingested_at: string
          mime_type: string | null
          modified_at: string | null
          name: string
          path: string
          size_bytes: number | null
          source: string
          source_id: string
        }
        Insert: {
          id?: string
          ingested_at?: string
          mime_type?: string | null
          modified_at?: string | null
          name: string
          path: string
          size_bytes?: number | null
          source: string
          source_id: string
        }
        Update: {
          id?: string
          ingested_at?: string
          mime_type?: string | null
          modified_at?: string | null
          name?: string
          path?: string
          size_bytes?: number | null
          source?: string
          source_id?: string
        }
        Relationships: []
      }
      raw_transactions: {
        Row: {
          account_ref: string | null
          amount_cents: number
          category: string | null
          currency: string
          description: string | null
          id: string
          ingested_at: string
          merchant: string | null
          posted_at: string
          raw_payload: Json | null
          source: string
          source_id: string
        }
        Insert: {
          account_ref?: string | null
          amount_cents: number
          category?: string | null
          currency?: string
          description?: string | null
          id?: string
          ingested_at?: string
          merchant?: string | null
          posted_at: string
          raw_payload?: Json | null
          source: string
          source_id: string
        }
        Update: {
          account_ref?: string | null
          amount_cents?: number
          category?: string | null
          currency?: string
          description?: string | null
          id?: string
          ingested_at?: string
          merchant?: string | null
          posted_at?: string
          raw_payload?: Json | null
          source?: string
          source_id?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          can_admin: boolean
          can_write: boolean
          description: string
          id: string
        }
        Insert: {
          can_admin?: boolean
          can_write?: boolean
          description: string
          id: string
        }
        Update: {
          can_admin?: boolean
          can_write?: boolean
          description?: string
          id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_at: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_order_items: {
        Row: {
          id: string
          line_total: number | null
          order_id: string | null
          plant_id: string | null
          plant_name: string
          plant_size: string | null
          plant_sku: string
          qty_requested: number
          release_item_id: string | null
          tray_count: number | null
          tray_price: number | null
          unit_price: number | null
        }
        Insert: {
          id?: string
          line_total?: number | null
          order_id?: string | null
          plant_id?: string | null
          plant_name: string
          plant_size?: string | null
          plant_sku: string
          qty_requested: number
          release_item_id?: string | null
          tray_count?: number | null
          tray_price?: number | null
          unit_price?: number | null
        }
        Update: {
          id?: string
          line_total?: number | null
          order_id?: string | null
          plant_id?: string | null
          plant_name?: string
          plant_size?: string | null
          plant_sku?: string
          qty_requested?: number
          release_item_id?: string | null
          tray_count?: number | null
          tray_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "wholesale_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wholesale_order_items_release_item_id_fkey"
            columns: ["release_item_id"]
            isOneToOne: false
            referencedRelation: "availability_release_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_orders: {
        Row: {
          business_name: string
          confirm_token: string | null
          contact_name: string
          created_at: string | null
          email: string
          id: string
          notes: string | null
          phone: string | null
          release_id: string | null
          status: string | null
          total_price: number | null
          total_units: number | null
        }
        Insert: {
          business_name: string
          confirm_token?: string | null
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
          phone?: string | null
          release_id?: string | null
          status?: string | null
          total_price?: number | null
          total_units?: number | null
        }
        Update: {
          business_name?: string
          confirm_token?: string | null
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
          phone?: string | null
          release_id?: string | null
          status?: string | null
          total_price?: number | null
          total_units?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_orders_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "availability_releases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_submission_to_order: {
        Args: { p_notes?: string; p_submission_id: string }
        Returns: string
      }
      create_buyer_with_contact: {
        Args: {
          p_address_city?: string
          p_address_state?: string
          p_address_street?: string
          p_address_zip?: string
          p_company_name: string
          p_contact_name?: string
          p_created_by?: string
          p_email?: string
          p_notes?: string
        }
        Returns: {
          address_city: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          notes: string | null
          ref_number: string
        }
        SetofOptions: {
          from: "*"
          to: "buyers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_order_with_items: {
        Args: {
          p_buyer_id: string
          p_created_by_user_id: string
          p_items: Json
          p_notes: string
          p_source: string
          p_status: string
        }
        Returns: string
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
