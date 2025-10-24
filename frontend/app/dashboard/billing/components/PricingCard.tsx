'use client';

import React from 'react';
import { Check, LucideIcon } from 'lucide-react';

interface PricingCardProps {
  name: string;
  credits: number;
  price: number;
  description: string;
  features: string[];
  icon: LucideIcon;
  gradient: string;
  popular?: boolean;
  onSelect: (credits: number) => void;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary';
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  credits,
  price,
  description,
  features,
  icon: Icon,
  gradient,
  popular = false,
  onSelect,
  buttonText = `Get ${credits} Credits`,
  buttonVariant = 'secondary',
}) => {
  return (
    <div
      className={`relative rounded-2xl border transition group ${
        popular
          ? 'border-orange-500/50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-500/5 shadow-2xl shadow-orange-500/10 md:scale-105'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700/50 hover:bg-zinc-900'
      }`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} p-0.5 mb-6 flex items-center justify-center group-hover:scale-110 transition`}>
          <div className="w-full h-full rounded-lg bg-zinc-900 flex items-center justify-center">
            <Icon size={24} className="text-orange-500" />
          </div>
        </div>

        {/* Plan name & description */}
        <h3 className="text-2xl font-black mb-2">{name}</h3>
        <p className="text-zinc-400 text-sm mb-6">{description}</p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black">${price}</span>
            <span className="text-zinc-400 text-sm">/one-time</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-orange-500 font-semibold">{credits} credits</span>
            <span className="text-zinc-600 text-sm">included</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSelect(credits)}
          className={`w-full py-3 px-4 rounded-lg font-bold transition mb-6 ${
            buttonVariant === 'primary'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700'
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          }`}
        >
          {buttonText}
        </button>

        {/* Features list */}
        <div className="space-y-3 border-t border-zinc-800 pt-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <Check size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-zinc-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
