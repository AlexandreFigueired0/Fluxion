'use client';

import React, { useState } from 'react';
import { Wallet, CreditCard, Clock, Zap, Crown, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';

const BillingPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'subscription' | 'credits'>('subscription');

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-zinc-800 rounded-lg w-1/3" />
          <div className="h-40 bg-zinc-800 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Mock data - replace with real data later
  const currentCredits = 42.5;
  const currentPlan = 'free'; // 'free', 'indie', 'pro', 'team'

  const subscriptions = [
    {
      id: 'indie',
      name: 'Indie',
      price: 15,
      credits: 25,
      icon: Zap,
      features: ['25 credits/month', 'Better pricing (2.5× markup)', 'Rollover up to 50 credits', 'Email support']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 45,
      credits: 100,
      icon: Crown,
      popular: true,
      features: ['100 credits/month', 'Best pricing (2.2× markup)', 'Unlimited rollover', 'Priority queue', 'Priority support']
    },
    {
      id: 'team',
      name: 'Team',
      price: 149,
      credits: 500,
      icon: Users,
      features: ['500 credits/month', 'Volume pricing (2.0× markup)', 'Shared workspace', 'API access', '24/7 support']
    }
  ];

  const creditPacks = [
    { credits: 10, price: 6, costPer: 0.60 },
    { credits: 50, price: 25, costPer: 0.50, popular: true },
    { credits: 100, price: 45, costPer: 0.45 },
    { credits: 250, price: 100, costPer: 0.40 }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Credits</h1>
          <p className="text-zinc-400">Manage your subscription and credit balance</p>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                <Wallet size={16} />
                <span>Available Balance</span>
              </div>
              <div className="text-5xl font-bold text-orange-500 mb-1">
                {currentCredits.toFixed(1)}
              </div>
              <p className="text-sm text-zinc-400">credits ready to use</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full text-sm mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="capitalize">{currentPlan} Plan</span>
              </div>
              <p className="text-xs text-zinc-500">~170 generations left</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-zinc-800">
          <button
            onClick={() => setSelectedTab('subscription')}
            className={`px-4 py-2 font-medium transition ${
              selectedTab === 'subscription'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setSelectedTab('credits')}
            className={`px-4 py-2 font-medium transition ${
              selectedTab === 'credits'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Buy Credits
          </button>
        </div>

        {/* Subscription Plans */}
        {selectedTab === 'subscription' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Monthly Subscriptions</h2>
              <p className="text-sm text-zinc-400">Get credits every month + better pricing on all requests</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {subscriptions.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentPlan === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-zinc-900 border rounded-lg p-6 transition ${
                      plan.popular
                        ? 'border-orange-500/50 shadow-lg shadow-orange-500/10'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Icon size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-bold">{plan.name}</h3>
                        <p className="text-xs text-zinc-500">{plan.credits} credits/month</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-zinc-500 text-sm">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6 text-sm">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-zinc-400">
                          <span className="text-orange-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={isCurrentPlan}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        isCurrentPlan
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Credit Packs */}
        {selectedTab === 'credits' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">One-Time Credit Packs</h2>
              <p className="text-sm text-zinc-400">Top up your balance anytime - credits never expire</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {creditPacks.map((pack) => (
                <div
                  key={pack.credits}
                  className={`relative bg-zinc-900 border rounded-lg p-6 transition ${
                    pack.popular
                      ? 'border-orange-500/50 shadow-lg shadow-orange-500/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Best Value
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-orange-500 mb-1">
                        {pack.credits}
                      </div>
                      <p className="text-sm text-zinc-400">credits</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${pack.price}</div>
                      <p className="text-xs text-zinc-500">${pack.costPer}/credit</p>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition">
                    Buy {pack.credits} Credits
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-zinc-500 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Need more?</h3>
                  <p className="text-sm text-zinc-400">Contact us for custom credit packages or enterprise volume discounts</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
            {/* Mock transactions */}
            {[
              { type: 'spend', amount: -0.25, desc: 'Generated workflow for Next.js project', time: '2 hours ago' },
              { type: 'spend', amount: -0.18, desc: 'Debug pipeline analysis', time: '5 hours ago' },
              { type: 'credit', amount: +25, desc: 'Monthly subscription refill', time: '1 day ago' },
              { type: 'spend', amount: -0.32, desc: 'Generated complex monorepo workflow', time: '2 days ago' }
            ].map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {tx.type === 'credit' ? (
                      <Wallet size={16} className="text-green-500" />
                    ) : (
                      <Zap size={16} className="text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.desc}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {tx.time}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
