// components/sections/Hero.tsx
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <div className="max-w-7xl mx-auto px-8 pt-32 pb-24">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full mb-8">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm text-zinc-400">For developers who ship</span>
          </div>
          
          <h1 className="text-6xl font-black mb-6 leading-tight">
            CI/CD without<br />
            the headache
          </h1>
          
          <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
            Your workflow failed at 3am. Again. Fluxion tells you exactly why 
            and how to fix it. No more guessing. No more Stack Overflow rabbit holes.
          </p>

          <div className="flex gap-4">
            <Button>
              <span className="flex items-center gap-2">
                Start for Free
                <ArrowRight size={20} />
              </span>
            </Button>
            <Button variant="secondary">View on GitHub</Button>
          </div>

          <div className="mt-12 flex items-center gap-8 text-sm">
            {['No credit card', '50 free credits', '2min setup'].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-orange-500" />
                <span className="text-zinc-400">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Demo will be rendered here */}
        <div className="md:block hidden">
          {/* Placeholder for TerminalDemo component */}
        </div>
      </div>
    </div>
  );
}