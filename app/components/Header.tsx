'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('🔄 Starting sign out process');
      setIsMenuOpen(false); // Close menu when signing out
      await signOut();
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false); // Close menu when navigating
    
    console.log('🔍 Profile click - Current state:', { 
      hasUser: !!user, 
      loading,
      userEmail: user?.email,
      userSession: await supabase.auth.getSession()
    });
    
    // Don't do anything if still loading
    if (loading) {
      console.log('⏳ Auth state is still loading');
      return;
    }

    // Verify session is valid before navigation
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      router.push('/sign-in');
      return;
    }

    if (!session) {
    // console.log("THIS IS THE USER: ", user);
    // if (!user) {
      console.log('⚠️ No active session found, redirecting to sign in');
      router.push('/sign-in');
      return;
    }

    // If we have a valid session and user, go to profile
    if (user) {
      console.log('✅ Valid session found, navigating to profile');
      try {
        await router.push('/profile');
        console.log('✅ Navigation to profile successful');
      } catch (error) {
        console.error('❌ Error navigating to profile:', error);
      }
    } else {
      console.log('⚠️ Missing user or session, redirecting to sign in');
      router.push('/sign-in');
    }
  };

  const renderNavLinks = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center w-full gap-4 animate-pulse">
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
      );
    }

    if (user) {
      return (
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 py-2 md:py-0"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <button
            onClick={handleProfileClick}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 text-left py-2 md:py-0"
          >
            Profile
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:pl-4 md:border-l border-gray-200">
            <span className="text-sm text-gray-600 py-2 md:py-0">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
            >
              Sign out
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col md:flex-row items-center md:items-center gap-4 w-full">
        <Link
          href="/sign-in"
          className="flex justify-center w-[150px] md:w-auto text-sm font-medium text-gray-700 hover:text-gray-900 py-2 md:py-0"
          onClick={() => setIsMenuOpen(false)}
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="flex justify-center w-[150px] md:w-auto px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-center"
          onClick={() => setIsMenuOpen(false)}
        >
          Sign up
        </Link>
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            MidTradesAI
          </Link>

          {/* Hamburger menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {renderNavLinks()}
          </nav>
        </div>

        {/* Mobile navigation */}
        <nav className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} py-4 border-t border-gray-200`}>
          {renderNavLinks()}
        </nav>
      </div>
    </header>
  );
} 