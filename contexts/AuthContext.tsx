'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  isEmailVerified: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        console.log('🔍 Checking session in AuthContext...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('📝 Session check result:', { 
          hasSession: !!session, 
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at
        });

        if (mounted) {
          setUser(session?.user ?? null);
          setIsEmailVerified(session?.user?.email_confirmed_at != null);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log('🔄 Auth state changed:', { 
              event: _event, 
              hasSession: !!session,
              userEmail: session?.user?.email
            });
            
            if (mounted) {
              setUser(session?.user ?? null);
              setIsEmailVerified(session?.user?.email_confirmed_at != null);
            }
          }
        );

        // Only set loading to false after everything is set up
        if (mounted) {
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Error checking session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
      } else {
        console.log('✅ Sign in successful:', { 
          userEmail: data.user?.email,
          expiresAt: data.session?.expires_at
        });
        
        // Force a session refresh after sign in
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();
        console.log('🔄 Refreshed session after sign in:', {
          hasSession: !!refreshedSession,
          userEmail: refreshedSession?.user?.email
        });
      }

      return { error };
    } catch (error) {
      console.error('❌ Error during sign in:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('📝 Attempting sign up...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ Sign up error:', error);
      } else {
        console.log('✅ Sign up successful:', { 
          userEmail: data.user?.email,
          expiresAt: data.session?.expires_at
        });
      }

      return { error, data };
    } catch (error) {
      console.error('❌ Error during sign up:', error);
      return { error: error as AuthError, data: null };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Attempting sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔑 Attempting password reset...');
      const redirectTo = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/auth/reset-password'
        : `${window.location.origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      return { error };
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      console.log('🔑 Attempting password update...');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error };
    } catch (error) {
      console.error('❌ Error updating password:', error);
      return { error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔑 Attempting Google sign in...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      return { error };
    } catch (error) {
      console.error('❌ Error signing in with Google:', error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    isEmailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 