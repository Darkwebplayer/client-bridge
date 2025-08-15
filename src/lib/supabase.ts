import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with detailed error messages
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  console.error('Missing Supabase environment variables:', missingVars);
  console.error('Current values:', { 
    VITE_SUPABASE_URL: supabaseUrl || 'undefined',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '[REDACTED]' : 'undefined'
  });
  
  throw new Error(`Missing Supabase environment variables: ${missingVars.join(', ')}. Please check your .env file and restart the development server.`);
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error(`Invalid VITE_SUPABASE_URL format: ${supabaseUrl}. Please check your .env file.`);
}

console.log('Supabase client initialized with URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: 'freelancer' | 'client';
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role: 'freelancer' | 'client';
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: 'freelancer' | 'client';
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          timeline: string;
          progress: number;
          status: 'active' | 'completed' | 'on-hold';
          freelancer_id: string;
          invite_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          timeline: string;
          progress?: number;
          status?: 'active' | 'completed' | 'on-hold';
          freelancer_id: string;
          invite_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          timeline?: string;
          progress?: number;
          status?: 'active' | 'completed' | 'on-hold';
          freelancer_id?: string;
          invite_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_clients: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          client_id?: string;
          joined_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          completed: boolean;
          category: 'feature' | 'bug' | 'design' | 'content';
          priority: 'low' | 'medium' | 'high';
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          category: 'feature' | 'bug' | 'design' | 'content';
          priority?: 'low' | 'medium' | 'high';
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          category?: 'feature' | 'bug' | 'design' | 'content';
          priority?: 'low' | 'medium' | 'high';
          created_at?: string;
          completed_at?: string | null;
        };
      };
      threads: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          category: 'general' | 'bug' | 'feature' | 'feedback';
          creator_id: string;
          is_resolved: boolean;
          created_at: string;
          updated_at: string;
          url: string | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          category?: 'general' | 'bug' | 'feature' | 'feedback';
          creator_id: string;
          is_resolved?: boolean;
          created_at?: string;
          updated_at?: string;
          url?: string | null;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          category?: 'general' | 'bug' | 'feature' | 'feedback';
          creator_id?: string;
          is_resolved?: boolean;
          created_at?: string;
          updated_at?: string;
          url?: string | null;
          image_url?: string | null;
        };
      };
      thread_replies: {
        Row: {
          id: string;
          thread_id: string;
          author_id: string;
          content: string;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          thread_id: string;
          author_id: string;
          content: string;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          thread_id?: string;
          author_id?: string;
          content?: string;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          type: 'invoice' | 'contract' | 'proposal';
          link: string;
          amount: number | null;
          status: 'pending' | 'paid' | 'overdue' | 'draft';
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          type: 'invoice' | 'contract' | 'proposal';
          link: string;
          amount?: number | null;
          status?: 'pending' | 'paid' | 'overdue' | 'draft';
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          type?: 'invoice' | 'contract' | 'proposal';
          link?: string;
          amount?: number | null;
          status?: 'pending' | 'paid' | 'overdue' | 'draft';
          due_date?: string | null;
          created_at?: string;
        };
      };
    };
  };
}