'use client';

import React from 'react'
import { ArrowRight, CheckCircle2, Sparkles, Zap, Code2, Terminal } from 'lucide-react'
import Link from 'next/link'
import  Button from '../ui/Button'

const Hero = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 pt-32 pb-24 relative">
      {/* Animated gradient orbs in background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="text-orange-500" />
            <span className="text-sm text-orange-400 font-medium">AI-Powered CI/CD Automation</span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Build & Debug
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              GitHub Actions
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              10× Faster
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
            Generate production-ready workflows in minutes using AI. 
            Debug failures instantly with intelligent explanations. 
            Edit visually without touching YAML.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Button>
              <Link href="/login" className="flex items-center gap-2 cursor-pointer">
                <Zap size={18} />
                Start for Free
                <ArrowRight size={20} />
              </Link>
            </Button>
            
            <button className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
              <Terminal size={18} />
              View Demo
            </button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-6 text-sm mb-8">
            {[
              { icon: CheckCircle2, text: 'No credit card' },
              { icon: Sparkles, text: '50 free credits' },
              { icon: Zap, text: '2min setup' }
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={16} className="text-orange-500 flex-shrink-0" />
                <span className="text-zinc-400">{text}</span>
              </div>
            ))}
          </div>

          {/* Key features highlight */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
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

        {/* Right side - Animated visual showcase */}
        <div className="md:block hidden relative">
          {/* Floating code blocks animation */}
          <div className="relative h-[600px]">
            {/* Main workflow card */}
            <div className="absolute top-0 right-0 w-80 bg-zinc-900/90 border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm animate-float">
              <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700/50 flex items-center gap-2">
                <Code2 size={16} className="text-orange-500" />
                <span className="text-sm font-mono text-zinc-300">.github/workflows/ci.yml</span>
              </div>
              <div className="p-4 font-mono text-xs text-zinc-300 leading-relaxed">
                <pre className="text-green-400">name: <span className="text-zinc-100">CI Pipeline</span></pre>
                <pre className="text-blue-400">on: <span className="text-zinc-100">push</span></pre>
                <pre className="text-purple-400">jobs:</pre>
                <pre className="text-zinc-400">  build:</pre>
                <pre className="text-zinc-500">    runs-on: ubuntu-latest</pre>
                <pre className="text-zinc-500">    steps:</pre>
                <pre className="text-orange-400">      - uses: <span className="text-zinc-100">actions/checkout@v4</span></pre>
                <pre className="text-cyan-400">      - run: <span className="text-zinc-100">npm build</span></pre>
              </div>
              {/* Success indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Generated</span>
              </div>
            </div>

            {/* AI sparkle indicator */}
            <div className="absolute top-32 left-0 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 backdrop-blur-sm animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Sparkles size={20} className="text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-100">AI Detected</div>
                  <div className="text-xs text-zinc-400">Next.js + TypeScript</div>
                </div>
              </div>
            </div>

            {/* Debug fix card */}
            <div className="absolute bottom-20 left-10 w-72 bg-zinc-900/90 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-sm shadow-xl animate-float">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <Zap size={16} className="text-cyan-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-100 mb-1">Root Cause Found</div>
                  <div className="text-xs text-zinc-400">Deprecated action version</div>
                </div>
              </div>
              <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                <div className="text-xs font-mono text-red-400 line-through mb-1">actions/checkout@v2</div>
                <div className="text-xs font-mono text-green-400">actions/checkout@v4 ✓</div>
              </div>
            </div>

            {/* Stats bubble */}
            <div className="absolute bottom-0 right-10 bg-zinc-900/90 border border-zinc-800/50 rounded-xl px-6 py-4 backdrop-blur-sm shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-black bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent mb-1">
                  10×
                </div>
                <div className="text-xs text-zinc-400 font-medium">Faster Setup</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating animation CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 2s;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}

export default Hero;