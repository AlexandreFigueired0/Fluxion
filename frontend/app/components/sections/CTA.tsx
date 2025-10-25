'use client';

import { ArrowRight, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';

const CTA = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12 border-t border-zinc-800">
      <div className="relative">
        
        <div className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 p-12 md:p-16 backdrop-blur-sm overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto text-center">

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Stop fighting YAML
                <br />
                Start deploying
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join developers who&apos;ve reclaimed their time from CI/CD headaches. 
              Get your first workflow generated in under 2 minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button className="cursor-pointer">
                <Link href="/login" className="flex items-center gap-2">
                  <Zap size={18} />
                  Start Building for Free
                  <ArrowRight size={20} />
                </Link>
              </Button>
            </div>

            {/* Benefits grid */}
            <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-zinc-800/50">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <span className="text-zinc-300 font-semibold">No credit card required</span>
                </div>
                <p className="text-sm text-zinc-500">Start free, upgrade when ready</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={18} className="text-orange-500" />
                  <span className="text-zinc-300 font-semibold">Free credits included</span>
                </div>
                <p className="text-sm text-zinc-500">Enough for several of workflows</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Zap size={18} className="text-cyan-500" />
                  <span className="text-zinc-300 font-semibold">Setup in 2 minutes</span>
                </div>
                <p className="text-sm text-zinc-500">No complex configuration needed</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CTA;
