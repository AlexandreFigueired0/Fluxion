import { CreditCard } from 'lucide-react';
import Link from 'next/link';

interface CreditsCardProps {
  subscriptionCredits: number;
  permanentCredits: number;
  maxSubscriptionCredits?: number; // Max credits for subscription tier
}

export default function CreditsCard({ 
  subscriptionCredits, 
  permanentCredits,
  maxSubscriptionCredits = 25 // Default to Indie tier
}: CreditsCardProps) {
  const totalCredits = subscriptionCredits + permanentCredits;
  const isLowCredits = totalCredits < 5;
  
  // Calculate percentage of subscription credits used
  const usagePercent = maxSubscriptionCredits > 0 
    ? ((maxSubscriptionCredits - subscriptionCredits) / maxSubscriptionCredits) * 100 
    : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
          <CreditCard className="text-orange-500" size={20} />
        </div>
        <Link 
          href="/dashboard/billing" 
          className="text-sm text-orange-500 hover:text-orange-400 transition font-semibold cursor-pointer border border-orange-500/20 px-3 py-1 rounded-lg"
        >
          Buy more
        </Link>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-1 space-y-4">
        {/* Total Credits */}
        <div className="flex items-baseline gap-2">
          <div className="text-5xl font-black">{totalCredits}</div>
          <div className="text-zinc-400 text-base font-medium">credits</div>
        </div>

        {/* Subscription Credits with Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Subscription</span>
            <span className="font-medium text-zinc-300">{subscriptionCredits} / {maxSubscriptionCredits}</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
              style={{ width: `${100 - usagePercent}%` }}
            />
          </div>
        </div>

        {/* Permanent Credits */}
        <div className="w-full flex justify-between items-center text-sm">
          <span className="text-zinc-400">Permanent</span>
          <span className="font-bold text-zinc-200">{permanentCredits}</span>
        </div>

        {isLowCredits && totalCredits > 0 && (
          <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
            Running low
          </div>
        )}

        {totalCredits <= 0 && (
          <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
            No credits remaining
          </div>
        )}
      </div>
    </div>
  );
}
