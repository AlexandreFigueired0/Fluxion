'use client';

import { ArrowRight, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';

const CTA = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 py-24 border-t border-zinc-800">
      <div className="relative">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-600/5 to-orange-500/10 rounded-3xl blur-3xl" />
        
        <div className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 rounded-2xl p-12 md:p-16 backdrop-blur-sm overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
              <Sparkles size={14} className="text-orange-500" />
              <span className="text-sm text-orange-400 font-medium">Ready to ship faster?</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Stop fighting YAML.
                <br />
                Start shipping code.
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
              
              <button className="px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
                View Live Demo
                <ArrowRight size={18} className="text-zinc-400" />
              </button>
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
                  <span className="text-zinc-300 font-semibold">50 free credits included</span>
                </div>
                <p className="text-sm text-zinc-500">Enough for dozens of workflows</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Zap size={18} className="text-cyan-500" />
                  <span className="text-zinc-300 font-semibold">Setup in 2 minutes</span>
                </div>
                <p className="text-sm text-zinc-500">No complex configuration needed</p>
              </div>
            </div>

            {/* Social proof hint */}
            <div className="mt-10 pt-8 border-t border-zinc-800/50">
              <p className="text-sm text-zinc-500">
                Trusted by developers at startups and enterprises worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CTA;
