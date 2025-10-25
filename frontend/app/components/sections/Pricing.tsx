'use client';

import React from 'react';
import { Check, Zap, Crown, Users } from 'lucide-react';
import Link from 'next/link';

const Pricing = () => {
  const subscriptions = [
    {
      id: 'indie',
      name: 'Indie',
      price: 15,
      credits: 25,
      description: 'For solo developers',
      popular: false,
      features: [
        '25 credits/month ',
        'Save up to 10 workflows',
        '~12 workflow generations',
        'Email support'
      ],
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 45,
      credits: 75,
      description: 'For professionals',
      popular: true,
      features: [
        '75 credits/month ',
        'Everything in Indie',
        'Save up to 50 workflows',
        '~37 workflow generations',
        'Priority email support'
      ],
      icon: Crown,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: 149,
      credits: 250,
      description: 'For power users',
      popular: false,
      features: [
        '250 credits/month ',
        'Everything in Pro',
        'Save up to 100 workflows',
        '~125 workflow generations',
        'Highest priority support'
      ],
      icon: Users,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 border-t border-zinc-800">
      {/* Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-6">
          Pricing
        </h2>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
        {subscriptions.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border transition group ${
                plan.popular
                  ? 'border-orange-500/50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-500/5 shadow-2xl shadow-orange-500/10 md:scale-105'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700/50 hover:bg-zinc-900'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} p-0.5 mb-6 flex items-center justify-center group-hover:scale-110 transition`}>
                  <div className="w-full h-full rounded-lg bg-zinc-900 flex items-center justify-center">
                    <Icon size={24} className="text-orange-500" />
                  </div>
                </div>

                {/* Plan name & description */}
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <p className="text-zinc-400 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">${plan.price}</span>
                    <span className="text-zinc-400 text-sm">/month</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-orange-500 font-semibold">{plan.credits} credits</span>
                    <span className="text-zinc-600 text-sm">per month</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href="/signup">
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-bold transition mb-6 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                  >
                    Get Started
                  </button>
                </Link>

                {/* Features list */}
                <div className="space-y-3 border-t border-zinc-800 pt-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional info */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">How Credits Work</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-zinc-400">
            <div>
              <p className="mb-2">💡 <strong className="text-white">1 credit = $0.50</strong></p>
              <p>Use credits for AI-powered workflow generation and debugging</p>
            </div>
            <div>
              <p className="mb-2">♻️ <strong className="text-white">Subscription credits reset monthly</strong></p>
              <p>Use them or lose them - encourages consistent usage</p>
            </div>
            <div>
              <p className="mb-2">💳 <strong className="text-white">Buy extra credits anytime</strong></p>
              <p>One-time credit packs available starting at $5</p>
            </div>
            <div>
              <p className="mb-2">⏰ <strong className="text-white">Purchased credits never expire</strong></p>
              <p>Top-up credits are yours forever</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
