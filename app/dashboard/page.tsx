'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddPositionModal from '../components/AddPositionModal';

// Placeholder data - we'll replace this with real data later
const dummyPortfolioData = [
  { date: '2024-01', value: 10000 },
  { date: '2024-02', value: 11200 },
  { date: '2024-03', value: 10800 },
  { date: '2024-04', value: 12400 },
];

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  change_percentage: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dailyAdvice, setDailyAdvice] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch daily advice
      const { data: adviceData, error: adviceError } = await supabase
        .from('daily_advice')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (adviceError) {
        console.error('Error fetching advice:', adviceError);
      } else {
        setDailyAdvice(adviceData?.advice || 'No advice available for today.');
      }

      // Fetch positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id);

      if (positionsError) {
        console.error('Error fetching positions:', positionsError);
      } else {
        setPositions(positionsData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Daily AI Advice Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Today's AI Insights</h2>
            <div className="prose max-w-none">
              {dailyAdvice ? (
                <p className="text-gray-600">{dailyAdvice}</p>
              ) : (
                <p className="text-gray-500">Loading today's insights...</p>
              )}
            </div>
          </div>

          {/* Portfolio Performance Graph */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Portfolio Performance</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyPortfolioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Positions List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Current Positions</h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Add Position
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.length > 0 ? (
                    positions.map((position) => (
                      <tr key={position.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {position.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {position.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${position.entry_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${position.current_price.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          position.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {position.change_percentage >= 0 ? '+' : ''}{position.change_percentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No positions found. Add your first position to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Position Modal */}
      <AddPositionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPositionAdded={fetchDashboardData}
        userId={user?.id || ''}
      />
    </div>
  );
} 