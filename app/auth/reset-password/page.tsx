'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkToken = async () => {
      try {
        // First try to get the access_token from the hash
        const hash = window.location.hash;
        console.log('Hash:', hash);

        // If we have a hash, we need to exchange it for a session
        if (hash) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          console.log('Session check:', { hasSession: !!session, error: sessionError?.message });
          
          if (session) {
            setIsTokenValid(true);
            return;
          }
        }

        // Fallback to checking query parameters
        const code = searchParams?.get('code');
        const type = searchParams?.get('type');
        console.log('Query parameters:', { code: code?.substring(0, 10) + '...', type });

        if (!code) {
          setError('Missing reset token. Please request a new password reset link.');
          setIsTokenValid(false);
          return;
        }

        // Try to verify the token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'recovery'
        });

        console.log('Token verification result:', { error: error?.message, hasData: !!data });

        if (error) {
          setError('Invalid or expired reset token. Please request a new password reset link.');
          setIsTokenValid(false);
          return;
        }

        setIsTokenValid(true);
      } catch (err) {
        console.error('Error checking token:', err);
        setError('An error occurred. Please try again.');
        setIsTokenValid(false);
      }
    };

    checkToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isTokenValid) {
      setError('Invalid reset token. Please request a new password reset link.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({ 
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message);
        return;
      }

      // Sign out any existing session
      await supabase.auth.signOut();
      
      // Redirect to sign-in with success message
      router.push('/sign-in?reset=success');
    } catch (err) {
      console.error('Password update error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-sm w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-gray-900">Invalid Reset Link</h2>
              <p className="mt-2 text-sm text-gray-600">
                This password reset link is invalid or has expired.
              </p>
            </div>
            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-sm font-medium text-gray-900 hover:underline">
                Request a new reset link
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating password...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 