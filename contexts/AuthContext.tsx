'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    console.log('🔐 Auth Provider Initializing');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Keep loading true until we're done with all checks
        setLoading(true);

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔑 Initial Session Check:', {
          hasSession: !!session,
          error: sessionError?.message,
          userEmail: session?.user?.email,
          provider: session?.user?.app_metadata?.provider,
          expiresAt: session?.expires_at,
        });

        if (sessionError) {
          console.error('❌ Session Error:', sessionError);
        }

        // Get user details
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        // Only update state if component is still mounted
        if (mounted) {
          setUser(currentUser);
          setIsEmailVerified(currentUser?.email_confirmed_at != null);
          // Set loading to false only after we have all the data
          setLoading(false);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('🔄 Auth State Change:', {
              event,
              hasSession: !!session,
              userEmail: session?.user?.email,
              provider: session?.user?.app_metadata?.provider,
              timestamp: new Date().toISOString(),
            });

            // Set loading true during state changes
            setLoading(true);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              const { data: { user: updatedUser } } = await supabase.auth.getUser();
              if (mounted) {
                setUser(updatedUser);
                setIsEmailVerified(updatedUser?.email_confirmed_at != null);
              }
            } else if (event === 'SIGNED_OUT') {
              if (mounted) {
                setUser(null);
                setIsEmailVerified(false);
              }
            }

            // Set loading false after state change is complete
            if (mounted) {
              setLoading(false);
            }
          }
        );

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Auth Initialization Error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

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
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any stored auth data
      localStorage.removeItem('googleAuthInProgress');
      
      // Force a session check to ensure it's cleared
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('✅ Sign out successful - session cleared');
        // Always redirect to home page and force a refresh
        window.location.href = '/';
      } else {
        console.warn('⚠️ Session still present after sign out');
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
    } finally {
      setLoading(false);
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
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false // This ensures Supabase handles the PKCE flow
        }
      });

      if (error) {
        console.error('❌ Google sign in error:', error);
        setLoading(false);
        return { error };
      }

      // Store that we're in the middle of Google auth
      localStorage.setItem('googleAuthInProgress', 'true');

      console.log('✅ Google sign in initiated:', {
        provider: 'google',
        url: data?.url
      });

      return { error: null };
    } catch (error) {
      console.error('❌ Error signing in with Google:', error);
      setLoading(false);
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