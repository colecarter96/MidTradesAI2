'use client';

import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPositionAdded: () => void;
  userId: string;
}

export default function AddPositionModal({ isOpen, onClose, onPositionAdded, userId }: AddPositionModalProps) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Fetch current price from an API
      const currentPrice = parseFloat(entryPrice); // For now, use entry price as current price

      const { error: insertError } = await supabase
        .from('positions')
        .insert([
          {
            user_id: userId,
            symbol: symbol.toUpperCase(),
            quantity: parseFloat(quantity),
            entry_price: parseFloat(entryPrice),
            current_price: currentPrice,
          },
        ]);

      if (insertError) throw insertError;

      onPositionAdded();
      onClose();
      setSymbol('');
      setQuantity('');
      setEntryPrice('');
    } catch (err) {
      console.error('Error adding position:', err);
      setError('Failed to add position. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Position</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
              Symbol
            </label>
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
              placeholder="e.g., AAPL"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
              step="any"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-700">
              Entry Price ($)
            </label>
            <input
              type="number"
              id="entryPrice"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
              step="any"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 