'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../utils/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        const params = Object.fromEntries(searchParams?.entries() || []);
        console.log('URL Parameters:', params);

        // First try to get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Active session found, redirecting to home...');
          router.replace('/');
          return;
        }

        // If no session, check for auth code
        const code = searchParams?.get('code');
        console.log('Auth code present:', !!code);
        
        if (!code) {
          console.error('No code in URL and no active session');
          router.push('/sign-in?error=no_code');
          return;
        }

        // Exchange code for session
        console.log('Exchanging code for session...');
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Error exchanging code for session:', error.message);
          router.push('/sign-in?error=auth_error');
          return;
        }

        // Get the final session
        const { data: { session: finalSession } } = await supabase.auth.getSession();

        if (!finalSession) {
          console.error('No session after exchange');
          router.push('/sign-in?error=no_session');
          return;
        }

        console.log('Authentication successful, redirecting to home...');
        router.replace('/');
      } catch (err) {
        console.error('Error in auth callback:', err);
        router.push('/sign-in?error=unknown');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
} 