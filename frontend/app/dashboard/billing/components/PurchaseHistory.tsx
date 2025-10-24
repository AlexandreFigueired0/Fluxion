'use client';

import React from 'react';
import { Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  credits: number;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

interface PurchaseHistoryProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ 
  transactions = [], 
  isLoading = false 
}) => {
  // Mock data for visual demo
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2025-10-24',
      credits: 500,
      amount: 39,
      status: 'completed',
      description: 'Professional Package'
    },
    {
      id: '2',
      date: '2025-10-20',
      credits: 100,
      amount: 9,
      status: 'completed',
      description: 'Starter Package'
    },
    {
      id: '3',
      date: '2025-10-15',
      credits: 1000,
      amount: 79,
      status: 'completed',
      description: 'Custom Package'
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'failed':
        return <AlertCircle size={18} className="text-red-500" />;
      default:
        return <CreditCard size={18} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-zinc-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (displayTransactions.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-12 text-center">
        <CreditCard size={48} className="mx-auto text-zinc-600 mb-4" />
        <h3 className="text-xl font-bold mb-2">No purchases yet</h3>
        <p className="text-zinc-400">Start by purchasing credits to use Fluxion features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 rounded-lg p-4 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${getStatusColor(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
              </div>
              <div>
                <div className="font-semibold text-white">{transaction.description}</div>
                <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                  <Calendar size={14} />
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-orange-500">+{transaction.credits} credits</div>
              <div className="text-sm text-zinc-400">${transaction.amount}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PurchaseHistory;
