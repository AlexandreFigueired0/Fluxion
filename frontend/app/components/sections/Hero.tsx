'use client';

import { ArrowRight, CheckCircle2, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import  Button from '../ui/Button'

const Hero = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-24 relative">
      
      <div className="max-w-[1400px] mx-auto text-center relative z-10">
        {/* Main headline */}
        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            Generate
          </span>
          <br />
          <span className="text-orange-500">
            GitHub Actions
          </span>
          <br />
          <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            10x Faster
          </span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl text-zinc-400 mb-8 leading-relaxed max-w-3xl mx-auto">
          Generate production-ready workflows in minutes using our <span className="text-orange-400 font-semibold">AI-Powered CI/CD Automation</span> features. 
          Debug failures instantly with intelligent explanations. 
          Edit visually without touching YAML.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <Button>
            <Link href="/login" className="flex items-center gap-2 cursor-pointer">
              <Zap size={18} />
              Start for Free
              <ArrowRight size={20} />
            </Link>
          </Button>
          
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-8 text-sm mb-8">
          {[
            { icon: CheckCircle2, text: 'No credit card' },
            { icon: Sparkles, text: 'Free credits' },
            { icon: Zap, text: '2min setup' }
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={16} className="text-orange-500 flex-shrink-0" />
              <span className="text-zinc-400">{text}</span>
            </div>
          ))}
        </div>

        {/* Key features highlight */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-black bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent">
                AI
              </div>
              <div className="text-xs text-zinc-500">Smart Generation</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black bg-gradient-to-br from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                Visual
              </div>
              <div className="text-xs text-zinc-500">Drag & Drop</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent">
                Debug
              </div>
              <div className="text-xs text-zinc-500">Instant Fix</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;