import { CreditCard } from 'lucide-react';
import Link from 'next/link';

interface CreditsCardProps {
  credits: number;
}

export default function CreditsCard({ credits }: CreditsCardProps) {
  const isLowCredits = credits < 10;
  // credits rounded to 2 decimal places
  const roundedCredits = Math.round(credits * 100) / 100;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
          <CreditCard className="text-orange-500" size={20} />
        </div>
        <Link 
          href="/billing" 
          className="text-sm text-orange-500 hover:text-orange-400 transition font-semibold cursor-pointer border border-orange-500/20 px-3 py-1 rounded-lg"
        >
          Buy more
        </Link>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex items-baseline gap-2 mt-6">
          <div className="text-5xl font-black">{roundedCredits}</div>
          <div className="text-zinc-400 text-base font-medium">credits</div>
        </div>
        
        {isLowCredits && roundedCredits > 0 && (
          <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
            Running low
          </div>
        )}
        
        {roundedCredits <= 0 && (
          <div className="mt-3 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
            No credits remaining
          </div>
        )}
      </div>
    </div>
  );
}
