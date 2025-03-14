'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'next/navigation';

type ProfileData = {
  portfolio_value: number;
  available_cash: number;
  investment_horizon: 'short' | 'medium' | 'long' | 'not_sure';
  risk_tolerance: 'low' | 'medium' | 'high';
  target_sectors: string[];
  investment_goal: 'growth' | 'income' | 'preservation';
  experience_level: 'less_than_1_year' | '1_to_3_years' | 'more_than_3_years';
  trading_frequency: 'daily' | 'weekly' | 'monthly';
  current_positions: Position[];
};

type Position = {
  symbol: string;
  amount_bought: number;
  current_amount: number;
  purchase_date: string;
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    portfolio_value: 0,
    available_cash: 0,
    investment_horizon: 'not_sure',
    risk_tolerance: 'medium',
    target_sectors: [],
    investment_goal: 'growth',
    experience_level: 'less_than_1_year',
    trading_frequency: 'weekly',
    current_positions: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

    const loadProfile = async () => {
      if (!user) {
        console.error('No user found in loadProfile');
        return;
      }

      try {
        console.log('Loading profile for user:', user.id);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Session error or no session:', sessionError);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        if (data) {
          console.log('Profile loaded successfully:', data);
          setProfileData(prev => ({
            ...prev,
            ...data,
          }));
          if (data.current_positions) {
            setPositions(data.current_positions);
          }
        }
      } catch (error) {
        console.error('Error in loadProfile:', error);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
              <p className="mt-2 text-sm text-gray-600">Please wait while we load your profile.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
              <p className="mt-2 text-sm text-gray-600">Please sign in to view your profile.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found in handleSubmit');
      setSubmitError('No user found. Please sign in again.');
      return;
    }

    console.log('Starting profile update for user:', user.id);
    console.log('Saving profile data:', profileData);
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error or no session:', sessionError);
        setSubmitError('Your session has expired. Please sign in again.');
        return;
      }

      console.log('Session verified, proceeding with profile update');

      const profileUpdate = {
        id: user.id,
        portfolio_value: profileData.portfolio_value ?? 0,
        available_cash: profileData.available_cash ?? 0,
        investment_horizon: profileData.investment_horizon,
        risk_tolerance: profileData.risk_tolerance,
        target_sectors: profileData.target_sectors ?? [],
        investment_goal: profileData.investment_goal,
        experience_level: profileData.experience_level,
        trading_frequency: profileData.trading_frequency,
        current_positions: positions,
        updated_at: new Date().toISOString(),
      };

      console.log('Sending profile update:', profileUpdate);

      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileUpdate)
        .select()
        .single();

      if (profileError) {
        console.error('Error saving profile:', profileError);
        setSubmitError(`Failed to save profile: ${profileError.message}`);
        return;
      }

      console.log('Profile updated successfully:', updatedProfile);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPosition = () => {
    setPositions(prev => [...prev, {
      symbol: '',
      amount_bought: null as any,
      current_amount: null as any,
      purchase_date: new Date().toISOString().split('T')[0],
    }]);
  };

  const updatePosition = (index: number, field: keyof Position, value: any) => {
    setPositions(prev => prev.map((pos, i) => 
      i === index ? { ...pos, [field]: value } : pos
    ));
  };

  const removePosition = (index: number) => {
    setPositions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="">
          <div className="px-6 py-8 sm:p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Profile Setup</h2>
              <p className="mt-2 text-sm text-gray-600">Update your trading preferences and portfolio information.</p>
            </div>

            <div className="space-y-8">
              {/* Portfolio Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Portfolio Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-md font-large text-gray-700 mb-2">
                      Total Portfolio Value
                    </label>
                    <input
                      type="number"
                      value={profileData.portfolio_value}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        portfolio_value: parseFloat(e.target.value)
                      }))}
                      className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-2">
                      Available Cash for Trading
                    </label>
                    <input
                      type="number"
                      value={profileData.available_cash}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        available_cash: parseFloat(e.target.value)
                      }))}
                      className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-md font-medium text-gray-700 mb-2">
                    Current Positions
                  </label>
                  <div className="space-y-4">
                    {positions.map((pos, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                          <input
                            type="text"
                            placeholder="Enter symbol"
                            value={pos.symbol}
                            onChange={(e) => updatePosition(index, 'symbol', e.target.value)}
                            className="block w-full px-4 py-3 text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Bought</label>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={pos.amount_bought || ''}
                            onChange={(e) => updatePosition(index, 'amount_bought', e.target.value ? parseFloat(e.target.value) : null)}
                            className="block w-full px-4 py-3 text-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                          <input
                            type="number"
                            placeholder="Enter value"
                            value={pos.current_amount || ''}
                            onChange={(e) => updatePosition(index, 'current_amount', e.target.value ? parseFloat(e.target.value) : null)}
                            className="block w-full px-4 py-3 text-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="date"
                              value={pos.purchase_date}
                              onChange={(e) => updatePosition(index, 'purchase_date', e.target.value)}
                              className="block w-full px-4 py-3 text-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removePosition(index)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPosition}
                      className="inline-flex items-center px-4 py-2 text-md font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Position
                    </button>
                  </div>
                </div>
              </div>

              {/* Investment Strategy */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Investment Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-2">
                      Investment Horizon
                    </label>
                    <select
                      value={profileData.investment_horizon}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        investment_horizon: e.target.value as 'short' | 'medium' | 'long' | 'not_sure'
                      }))}
                      className="block w-full px-4 py-3 text-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="not_sure">Not Sure</option>
                      <option value="short">Short Term (0-1 year)</option>
                      <option value="medium">Medium Term (1-3 years)</option>
                      <option value="long">Long Term (3+ years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-2">
                      Risk Tolerance
                    </label>
                    <select
                      value={profileData.risk_tolerance}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        risk_tolerance: e.target.value as 'low' | 'medium' | 'high'
                      }))}
                      className="block w-full px-4 py-3 text-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Goal
                    </label>
                    <select
                      value={profileData.investment_goal}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        investment_goal: e.target.value as 'growth' | 'income' | 'preservation'
                      }))}
                      className="block w-full px-4 py-3 text-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="growth">Growth</option>
                      <option value="income">Income</option>
                      <option value="preservation">Capital Preservation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Trading Preferences */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Trading Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={profileData.experience_level}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        experience_level: e.target.value as 'less_than_1_year' | '1_to_3_years' | 'more_than_3_years'
                      }))}
                      className="block w-full px-4 py-3 text-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="less_than_1_year">Less than 1 year</option>
                      <option value="1_to_3_years">1-3 years</option>
                      <option value="more_than_3_years">3+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trading Frequency
                    </label>
                    <select
                      value={profileData.trading_frequency}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        trading_frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                      }))}
                      className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-end space-y-4">
              {submitError && (
                <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{submitError}</p>
                </div>
              )}
              {submitSuccess && (
                <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">Profile updated successfully!</p>
                </div>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-3 text-md font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 