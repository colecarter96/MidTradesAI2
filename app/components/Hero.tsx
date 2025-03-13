'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function Hero() {
  const { user } = useAuth();
  
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-white to-pink-50/30"></div>
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl tracking-tight font-extrabold text-gray-900">
              AI-Powered Trading Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized stock market analysis and trading recommendations powered by advanced AI technology.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link 
              href={user ? "/dashboard" : "/sign-up"}
              className="px-6 py-3 text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-all"
            >
              {user ? "View Dashboard" : "Get started"}
            </Link>
            <button 
              onClick={scrollToFeatures}
              className="px-6 py-3 text-base font-medium rounded-lg text-gray-600 hover:text-gray-900 transition-all inline-flex items-center"
            >
              Learn more
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 