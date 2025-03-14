'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Let Supabase handle the OAuth callback automatically
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔄 Auth callback - Session check:', {
          hasSession: !!session,
          error: error?.message,
          userEmail: session?.user?.email,
          provider: session?.user?.app_metadata?.provider
        });

        if (error) {
          console.error('❌ Auth callback error:', error);
          router.push(`/sign-in?error=auth_error&details=${encodeURIComponent(error.message)}`);
          return;
        }

        if (!session) {
          // If no session, try to parse the hash fragment
          if (window.location.hash) {
            console.log('📝 Found hash fragment, letting Supabase process it');
            // The presence of a hash means Supabase is still processing the OAuth response
            // Just wait for Supabase to handle it
            return;
          }
          
          console.error('❌ No session established');
          router.push('/sign-in?error=no_session');
          return;
        }

        console.log('✅ Authentication successful');
        router.push('/');
      } catch (error) {
        console.error('❌ Callback error:', error);
        router.push('/sign-in?error=unknown');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
} 