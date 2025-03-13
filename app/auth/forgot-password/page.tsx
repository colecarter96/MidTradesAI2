'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-4 text-sm text-green-700 bg-green-50 rounded-lg">
                Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
              </div>
              <div className="text-center">
                <Link href="/sign-in" className="text-sm font-medium text-gray-900 hover:underline">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending reset link...' : 'Send reset link'}
                </button>
              </div>

              <div className="text-center">
                <Link href="/sign-in" className="text-sm font-medium text-gray-900 hover:underline">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
} 