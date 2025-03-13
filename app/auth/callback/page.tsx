'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          // User is signed in after email confirmation, redirect to home
          router.push('/');
        } else {
          // No session, redirect to sign in
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Error handling email confirmation:', error);
        router.push('/sign-in');
      }
    };

    handleEmailConfirmation();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Verifying your email...
        </h2>
        <p className="text-gray-600">
          Please wait while we confirm your email address.
        </p>
      </div>
    </div>
  );
} 