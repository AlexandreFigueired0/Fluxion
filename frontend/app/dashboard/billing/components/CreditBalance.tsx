'use client';

import React from 'react';
import { Zap, TrendingUp, Calendar } from 'lucide-react';

interface CreditBalanceProps {
  currentCredits?: number;
  totalSpent?: number;
  totalPurchased?: number;
  lastPurchaseDate?: string;
  isLoading?: boolean;
}

const CreditBalance: React.FC<CreditBalanceProps> = ({
  currentCredits = 1200,
  totalSpent = 300,
  totalPurchased = 1500,
  lastPurchaseDate = '2025-10-24',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-zinc-700 rounded w-3/4 mb-3" />
            <div className="h-6 bg-zinc-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const usagePercentage = Math.round((totalSpent / totalPurchased) * 100) || 0;

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Main balance card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-500/5 border border-orange-500/30 rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-zinc-400 text-sm mb-1">Available Credits</div>
            <div className="text-5xl font-black text-orange-500">{currentCredits.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <Zap size={28} className="text-orange-500" />
          </div>
        </div>
        <div className="text-zinc-400 text-sm">
          Ready to use for generating workflows and using AI features
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total spent */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-red-500" />
            <span className="text-zinc-400 text-xs uppercase tracking-wide">Spent</span>
          </div>
          <div className="text-3xl font-bold">{totalSpent}</div>
          <div className="text-xs text-zinc-500 mt-2">of {totalPurchased} total</div>
        </div>

        {/* Total purchased */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="text-zinc-400 text-xs uppercase tracking-wide mb-2">Purchased</div>
          <div className="text-3xl font-bold text-orange-500">{totalPurchased}</div>
          <div className="text-xs text-zinc-500 mt-2">${(totalPurchased / 100).toFixed(0)} value</div>
        </div>

        {/* Usage percentage */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="text-zinc-400 text-xs uppercase tracking-wide mb-2">Usage</div>
          <div className="text-3xl font-bold">{usagePercentage}%</div>
          <div className="h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* Last purchase */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-blue-500" />
            <span className="text-zinc-400 text-xs uppercase tracking-wide">Last Purchase</span>
          </div>
          <div className="text-sm font-semibold">
            {new Date(lastPurchaseDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-zinc-500 mt-2">
            {Math.floor((new Date().getTime() - new Date(lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditBalance;
