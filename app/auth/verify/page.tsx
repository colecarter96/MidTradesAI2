'use client';

import React from 'react';
import Link from 'next/link';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent you a verification link. Please check your email and click the link to verify your account.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">What&apos;s next?</h3>
          <ol className="text-sm text-gray-600 text-left space-y-4">
            <li>1. Check your email inbox</li>
            <li>2. Click the verification link in the email</li>
            <li>3. You&apos;ll be automatically signed in after verification</li>
          </ol>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <Link href="/sign-up" className="font-medium text-gray-900 hover:underline">
              try signing up again
            </Link>
          </p>
          
          <p className="text-sm text-gray-600">
            Already verified?{' '}
            <Link href="/sign-in" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 