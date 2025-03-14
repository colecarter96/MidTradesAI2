'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log('👤 Profile click handler:', { 
      hasUser: !!user, 
      loading, 
      userEmail: user?.email 
    });
    
    // Don't do anything if still loading
    if (loading) {
      console.log('⏳ Still loading, returning early');
      return;
    }

    // If we have a user, go to profile
    if (user) {
      console.log('🚀 Attempting to navigate to profile');
      try {
        await router.push('/profile');
        console.log('✅ Navigation to profile successful');
      } catch (error) {
        console.error('❌ Error navigating to profile:', error);
      }
    } else {
      console.log('⚠️ No user found when trying to navigate to profile');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            MidTradesAI
          </Link>

          <nav className="flex items-center gap-4">
            {!loading && (user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleProfileClick}
                  className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${
                    loading ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  Profile
                </button>
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
} 