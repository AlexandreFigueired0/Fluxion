'use client';

import React, { useState } from 'react';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHeader from '../components/DashboardHeader';
import { PricingCard, CreditBalance, PurchaseHistory } from './components';

const BillingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

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

  const userName = session?.user?.name || 'User';

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

  const handleSelectPackage = (credits: number) => {
    setSelectedPackage(credits);
    // This will trigger payment flow later
    console.log(`Selected ${credits} credits`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <DashboardHeader userName={userName} />

        {/* Credit Balance Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Your Credits</h2>
          <CreditBalance />
        </section>

        {/* Purchase Credits Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-3">Buy Credits</h2>
            <p className="text-zinc-400">
              Purchase credit packages to use Fluxion features. Credits never expire while your account is active.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {creditPackages.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <PricingCard
                  key={pkg.id}
                  name={pkg.name}
                  credits={pkg.credits}
                  price={pkg.price}
                  description={pkg.description}
                  features={pkg.features}
                  icon={Icon}
                  gradient={pkg.gradient}
                  popular={pkg.popular}
                  onSelect={handleSelectPackage}
                  buttonText={selectedPackage === pkg.credits ? 'Processing...' : `Get ${pkg.credits} Credits`}
                  buttonVariant={pkg.popular ? 'primary' : 'secondary'}
                />
              );
            })}
          </div>
        </section>

        {/* Purchase History Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Purchase History</h2>
            <p className="text-zinc-400">All your credit purchases and transactions</p>
          </div>
          <PurchaseHistory />
        </section>

        {/* Additional Info */}
        <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 md:p-12">
          <h3 className="text-xl font-bold mb-4">Questions about credits?</h3>
          <div className="space-y-3 text-zinc-400">
            <p>
              • <span className="font-semibold text-white">1 credit</span> = 1 AI request for workflow generation or debugging
            </p>
            <p>
              • Credits are <span className="font-semibold text-white">non-refundable</span> but don&apos;t expire as long as your account is active
            </p>
            <p>
              • Need a <span className="font-semibold text-white">custom package</span>? Contact our sales team for volume discounts
            </p>
          </div>
          <button className="mt-6 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold transition">
            Contact Support
          </button>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
