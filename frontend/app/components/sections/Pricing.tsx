'use client';

import React from 'react';
import { Check, Zap, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const Pricing = () => {
  const creditPackages = [
    {
      id: 'starter',
      name: 'Starter',
      credits: 100,
      price: 9,
      description: 'Perfect for getting started',
      popular: false,
      features: [
        '100 AI credits',
        '10 workflow generations',
        '1 concurrent workflow',
        'Basic support',
        'Valid for 30 days'
      ],
      icon: Sparkles,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'pro',
      name: 'Professional',
      credits: 500,
      price: 39,
      description: 'For serious developers',
      popular: true,
      features: [
        '500 AI credits',
        'Unlimited generations',
        '5 concurrent workflows',
        'Priority support',
        'Valid for 90 days',
        'Advanced debugging'
      ],
      icon: Zap,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 2000,
      price: 129,
      description: 'For teams and organizations',
      popular: false,
      features: [
        '2000 AI credits',
        'Unlimited everything',
        'Unlimited concurrent workflows',
        '24/7 priority support',
        'Valid for 365 days',
        'API access',
        'Custom integrations'
      ],
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-24 border-t border-zinc-800">
      {/* Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-6">
          Simple, Transparent
          <span className="block text-orange-500">Pricing</span>
        </h2>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Pay only for what you use. Buy credits and generate workflows at your own pace. 
          No subscriptions, no hidden fees.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
        {creditPackages.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border transition group ${
                pkg.popular
                  ? 'border-orange-500/50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-500/5 shadow-2xl shadow-orange-500/10 md:scale-105'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700/50 hover:bg-zinc-900'
              }`}
            >
              {/* Popular badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pkg.gradient} p-0.5 mb-6 flex items-center justify-center group-hover:scale-110 transition`}>
                  <div className="w-full h-full rounded-lg bg-zinc-900 flex items-center justify-center">
                    <Icon size={24} className="text-orange-500" />
                  </div>
                </div>

                {/* Plan name & description */}
                <h3 className="text-2xl font-black mb-2">{pkg.name}</h3>
                <p className="text-zinc-400 text-sm mb-6">{pkg.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">${pkg.price}</span>
                    <span className="text-zinc-400 text-sm">/one-time</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-orange-500 font-semibold">{pkg.credits} credits</span>
                    <span className="text-zinc-600 text-sm">included</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href="/login">
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-bold transition mb-6 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                  >
                    Get {pkg.credits} Credits
                  </button>
                </Link>

                {/* Features list */}
                <div className="space-y-3 border-t border-zinc-800 pt-6">
                  {pkg.features.map((feature) => (
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

      {/* FAQ or additional info */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 md:p-12 text-center">
        <h3 className="text-2xl font-bold mb-4">Need more credits?</h3>
        <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
          Contact our team for custom credit packages or enterprise pricing. 
          We offer volume discounts for organizations and teams.
        </p>
        <Link href="/login">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold transition">
            <span>Contact Sales</span>
            <Sparkles size={18} />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Pricing;
