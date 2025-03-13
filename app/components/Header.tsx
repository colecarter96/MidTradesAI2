import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl font-medium text-gray-900">MidTradesAI</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-up" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign Up
            </Link>
            <Link href="/sign-in" className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 