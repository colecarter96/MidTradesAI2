'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome back, {user?.email}
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Trading Dashboard
          </h2>
          <p className="text-gray-600">
            This is where you&apos;ll see your personalized trading recommendations and portfolio insights.
          </p>
        </div>
      </div>
    </div>
  );
} 