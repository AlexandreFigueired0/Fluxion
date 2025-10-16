import { CreditCard } from 'lucide-react';
import Link from 'next/link';

interface CreditsCardProps {
  credits: number;
  maxCredits?: number;
}

export default function CreditsCard({ credits, maxCredits = 50 }: CreditsCardProps) {
  const usedCredits = maxCredits - credits;
  const progressPercentage = (credits / maxCredits) * 100;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
          <CreditCard className="text-orange-500" size={20} />
        </div>
        <Link 
          href="/pricing" 
          className="text-sm text-orange-500 hover:text-orange-400 transition font-semibold cursor-pointer"
        >
          Buy more
        </Link>
      </div>
      <div className="text-4xl font-black mb-2">{credits}</div>
      <div className="text-sm text-zinc-400">Credits remaining</div>
      
      {/* Progress bar */}
      <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-orange-500 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="text-xs text-zinc-500 mt-2">
        {usedCredits} of {maxCredits} free credits used
      </div>
    </div>
  );
}
