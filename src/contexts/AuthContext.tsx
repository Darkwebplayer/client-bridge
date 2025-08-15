import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  signUp: (email: string, password: string, name: string, role: 'freelancer' | 'client') => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  joinProject: (inviteToken: string) => Promise<{ success: boolean; error?: string; projectId?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Auth initialization error:', error);
          setAuthInitialized(true);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setAuthUser(session.user);
          await loadUserProfile(session.user.id, session.user.email || '');
        } else {
          setAuthUser(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        if (mounted) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !authInitialized) return;

      console.log('Auth state changed:', event);

      if (session?.user) {
        setAuthUser(session.user);
        await loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setAuthUser(null);
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile loading error:', error);
        setUser(null);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: email,
          role: profile.role,
          avatar: profile.avatar_url
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setUser(null);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'freelancer' | 'client') => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Check if the user needs to confirm their email
      if (data.user && !data.session) {
        // User needs to confirm email, but we'll still create their profile
        // so they can log in after confirming
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            role,
          });

        if (profileError) throw profileError;
        
        // Return a special message indicating email confirmation is needed
        return { 
          success: true, 
          message: 'Account created! Please check your email to confirm your account before signing in.' 
        };
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            role,
          });

        if (profileError) throw profileError;

        // Load user profile
        await loadUserProfile(data.user.id, email);
      }

      return { success: true };
    } catch (error: any) {
      console.error('SignUp error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('SignIn error:', error);
        return { success: false, error: error.message };
      }
      
      // Auth state will be updated by the onAuthStateChange listener
      console.log('SignIn successful, waiting for auth state update');
      return { success: true };
    } catch (error: any) {
      console.error('SignIn error:', error);
      return { success: false, error: error.message };
    }
  };
  
  const logout = async () => {
    try {
      console.log('AuthContext: Starting logout process');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Logout error:', error);
        throw error;
      }
      console.log('AuthContext: Logout successful');
      
      // Clear local state immediately
      setUser(null);
      setAuthUser(null);
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
      // Even if logout fails, clear local state to prevent UI issues
      setUser(null);
      setAuthUser(null);
    }
  };

  const joinProject = async (inviteToken: string) => {
    // Get the current user session directly from Supabase to avoid race conditions with React state
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return { success: false, error: 'Not authenticated' };

    console.log('Joining project with token:', inviteToken);

    try {
      // Find project by invite token using the secure RPC call
      const { data: project, error: projectError } = await supabase
        .rpc('get_project_by_invite_token', { p_invite_token: inviteToken })
        .single();

      console.log('Project lookup result:', { project, error: projectError });

      if (projectError) throw new Error('Invalid invite link');

      // Check if already joined
      const { data: existing } = await supabase
        .from('project_clients')
        .select('id')
        .eq('project_id', project.id)
        .eq('client_id', authUser.id)
        .single();

      console.log('Existing client check result:', { existing });

      if (existing) {
        return { success: true, projectId: project.id };
      }

      // Join project
      const { error: joinError } = await supabase
        .from('project_clients')
        .insert({
          project_id: project.id,
          client_id: authUser.id,
        });

      console.log('Join project result:', { error: joinError });

      if (joinError) throw joinError;

      return { success: true, projectId: project.id };
    } catch (error: any) {
      console.error('Join project error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      authUser, 
      signUp, 
      signIn, 
      logout, 
      isLoading, 
      joinProject 
    }}>
      {children}
    </AuthContext.Provider>
  );
};