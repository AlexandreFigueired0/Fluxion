'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, CreditCard, Clock, Zap, Crown, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../components/DashboardLayout';
import {useDashboardData} from '../hooks/useDashboardData';
import type { CreditTransaction } from './services/creditTransaction';
import creditTransactionService from './services/creditTransaction';
import checkoutService from './services/checkout';

function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

const BillingPage = () => {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState<'subscription' | 'credits'>('subscription');
  const { subscriptionCredits, permanentCredits, subscriptionPlanId } = useDashboardData();
  const [ creditTransactions, setCreditTransactions ] = useState<CreditTransaction[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    creditTransactionService.listCreditTransactionsByUserID(session?.accessToken || '', session?.user?.id || '')
      .then(data => setCreditTransactions(data))
      .catch(err => console.error('Failed to load credit transactions:', err));
  }, [session]);

  const handleSubscribeClick = async (resourceID: string) => {
    if (!session?.accessToken) {
      setCheckoutError('Please log in to subscribe');
      return;
    }

    try {
      setCheckoutError(null);
      setIsCheckingOut(resourceID);
      await checkoutService.handleCheckout(
        { type: 'subscription', resourceID },
        session.accessToken
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      setCheckoutError(errorMessage);
      console.error('Subscribe error:', error);
    } finally {
      setIsCheckingOut(null);
    }
  };

  const handleBuyCreditsClick = async (credits: number) => {
    if (!session?.accessToken) {
      setCheckoutError('Please log in to buy credits');
      return;
    }

    try {
      setCheckoutError(null);
      setIsCheckingOut(`credits-${credits}`);
      await checkoutService.handleCheckout(
        { type: 'credits', resourceID: `${credits}` },
        session.accessToken
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      setCheckoutError(errorMessage);
      console.error('Buy credits error:', error);
    } finally {
      setIsCheckingOut(null);
    }
  };

  // Mock data - replace with real data later

  const subscriptions = [
    {
      id: 'Indie',
      name: 'Indie',
      price: 15,
      credits: 25,
      icon: Zap,
      features: [
        '25 credits/month ',
        'Save up to 10 workflows',
        'Email support'
      ]
    },
    {
      id: 'Pro',
      name: 'Pro',
      price: 45,
      credits: 75,
      icon: Crown,
      popular: true,
      features: [
        '75 credits/month ',
        'Everything in Indie',
        'Save up to 50 workflows',
        'Priority email support'
      ]
    },
    {
      id: 'Ultra',
      name: 'Ultra',
      price: 149,
      credits: 250,
      icon: Users,
      features: [
        '250 credits/month',
        'Everything in Pro',
        'Save up to 100 workflows',
        'Highest priority support'
      ]
    }
  ];

  const creditPacks = [
    { credits: 10, price: 5, costPer: 0.50 },
    { credits: 25, price: 12, costPer: 0.48, popular: true },
    { credits: 60, price: 27, costPer: 0.45 },
    { credits: 150, price: 60, costPer: 0.40 }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-16">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Credits</h1>
          <p className="text-zinc-400">Manage your subscription and credit balance</p>
        </div>

        {/* Error Message */}
        {checkoutError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
            <div className="text-red-500 mt-0.5">⚠️</div>
            <div>
              <h3 className="font-medium text-red-500">Checkout Error</h3>
              <p className="text-sm text-red-400 mt-1">{checkoutError}</p>
            </div>
          </div>
        )}

        {/* Current Balance */}
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                <Wallet size={16} />
                <span>Available Balance</span>
              </div>
              <div className="text-5xl font-bold text-orange-500 mb-1">
                {(subscriptionCredits + permanentCredits).toFixed(1)}
              </div>
              <p className="text-sm text-zinc-400">total credits ready to use</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full text-sm mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="capitalize">{subscriptionPlanId} Plan</span>
              </div>
            </div>
          </div>
          
          {/* Credit Breakdown */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-orange-500/20">
            {/* Subscription Credits */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Clock size={14} />
                <span>Subscription Credits Available</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {subscriptionCredits} / {subscriptions.find(plan => plan.id.toLowerCase() === subscriptionPlanId?.toLowerCase())?.credits || 0}
              </div>
              <p className="text-xs text-zinc-500">Resets monthly</p>
            </div>
            
            {/* Permanent Credits */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <CreditCard size={14} />
                <span>Permanent Credits Available</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {permanentCredits}
              </div>
              <p className="text-xs text-zinc-500">Never expire</p>
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
              <p className="text-sm text-zinc-400">Get credits every month + extra features</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {subscriptions.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = subscriptionPlanId?.toLowerCase() === plan.id.toLowerCase();
                
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
                      onClick={() => handleSubscribeClick(plan.id.toLowerCase())}
                      disabled={isCurrentPlan || isCheckingOut !== null}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        isCurrentPlan
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-500/50 disabled:cursor-not-allowed'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white disabled:bg-zinc-800/50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isCheckingOut === plan.id.toLowerCase() ? 'Loading...' : isCurrentPlan ? 'Current Plan' : 'Subscribe'}
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
                      Most Popular
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

                  <button 
                    onClick={() => handleBuyCreditsClick(pack.credits)}
                    disabled={isCheckingOut !== null}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition disabled:bg-zinc-800/50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut === `credits-${pack.credits}` ? 'Loading...' : `Buy ${pack.credits} Credits`}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-zinc-500 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">About Credit Packs</h3>
                  <p className="text-sm text-zinc-400 mb-2">
                    💡 <strong>Purchased credits never expire</strong> - they&apos;re yours forever
                  </p>
                  <p className="text-sm text-zinc-400">
                    Subscription credits reset monthly. Need more? Contact us for custom packages or enterprise volume discounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Pricing Guide */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Feature Pricing</h2>
            <p className="text-sm text-zinc-400">How credits are used across different features</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Generate Features */}
            <div className="space-y-3">
              <div className="flex items-start justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div>
                  <p className="font-medium text-sm mb-1">Generate Workflow</p>
                  <p className="text-xs text-zinc-500">Basic CI/CD generation</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">2</p>
                  <p className="text-xs text-zinc-500">credits</p>
                </div>
              </div>
              
              <div className="flex items-start justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div>
                  <p className="font-medium text-sm mb-1">Generate with AI Context</p>
                  <p className="text-xs text-zinc-500">Project-aware generation</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">4</p>
                  <p className="text-xs text-zinc-500">credits</p>
                </div>
              </div>
            </div>

            {/* Debug Features */}
            <div className="space-y-3">
              <div className="flex items-start justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div>
                  <p className="font-medium text-sm mb-1">Debug Workflow</p>
                  <p className="text-xs text-zinc-500">Basic error analysis</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">1</p>
                  <p className="text-xs text-zinc-500">credit</p>
                </div>
              </div>
              
              <div className="flex items-start justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div>
                  <p className="font-medium text-sm mb-1">Debug with AI Context</p>
                  <p className="text-xs text-zinc-500">Context-aware debugging</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">3</p>
                  <p className="text-xs text-zinc-500">credits</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-400">
              💡 <span className="font-semibold">Pro Tip:</span> Purchased credits never expire • Use AI context for better, project-specific workflows
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
            {creditTransactions.map((data, idx) => (
              <div key={idx} className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-medium text-sm">{data.reason}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {formatDate(data.created_at)}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${data.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.amount > 0 ? '+' : ''}{data.amount}
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
