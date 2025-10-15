'use client';

import { useState } from 'react';
import { Copy, Check, Key, CreditCard, Terminal, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function DashboardPage() {
  const [apiKey] = useState('flx_1a2b3c4d5e6f7g8h9i0j');
  const [copied, setCopied] = useState(false);
  const [credits] = useState(42);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usageHistory = [
    { id: 1, endpoint: 'generate', timestamp: '2 hours ago' },
    { id: 2, endpoint: 'debug', timestamp: '5 hours ago' },
    { id: 3, endpoint: 'generate', timestamp: '1 day ago' },
    { id: 4, endpoint: 'debug', timestamp: '1 day ago' },
    { id: 5, endpoint: 'generate', timestamp: '2 days ago' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Grid background */}
      <div 
        className="fixed inset-0 opacity-20"
      />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-black text-sm">
              FX
            </div>
            <span className="text-xl font-bold">FLUXION</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/docs" className="text-zinc-400 hover:text-white transition">
              Docs
            </Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black mb-2">Dashboard</h1>
            <p className="text-zinc-400">Manage your API keys and view usage</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Credits Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-orange-500" size={20} />
                </div>
                <Link 
                  href="/pricing" 
                  className="text-sm text-orange-500 hover:text-orange-400 transition font-semibold"
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
                  style={{ width: `${(credits / 50) * 100}%` }}
                />
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                {credits} of 50 free credits used
              </div>
            </div>

            {/* API Key Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                  <Key className="text-orange-500" size={20} />
                </div>
                <button className="text-sm text-zinc-400 hover:text-white transition">
                  Revoke
                </button>
              </div>
              <div className="text-sm font-semibold mb-2">Your API Key</div>
              
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-zinc-300 truncate">
                  {apiKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-green-500" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-zinc-500 mt-3">
                Keep this secret. Don&apos;t commit it to git.
              </p>
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="text-orange-500" size={24} />
              <h2 className="text-2xl font-bold">Quick Start</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400 mb-2">1. Install Fluxion</p>
                <code className="block px-4 py-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-orange-400">
                  brew install fluxion
                </code>
              </div>
              
              <div>
                <p className="text-sm text-zinc-400 mb-2">2. Set your API key</p>
                <code className="block px-4 py-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-orange-400">
                  fluxion config set {apiKey}
                </code>
              </div>
              
              <div>
                <p className="text-sm text-zinc-400 mb-2">3. Generate your first workflow</p>
                <code className="block px-4 py-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-orange-400">
                  fluxion generate &quot;build and test my app&quot;
                </code>
              </div>
            </div>
          </div>

          {/* Usage History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold">Recent Usage</h2>
            </div>
            
            <div className="divide-y divide-zinc-800">
              {usageHistory.map((usage) => (
                <div key={usage.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      usage.endpoint === 'generate' ? 'bg-orange-500' : 'bg-zinc-500'
                    }`} />
                    <span className="font-mono text-sm">fluxion {usage.endpoint}</span>
                  </div>
                  <span className="text-sm text-zinc-400">{usage.timestamp}</span>
                </div>
              ))}
            </div>
            
            {usageHistory.length === 0 && (
              <div className="px-6 py-12 text-center text-zinc-500">
                No usage yet. Run your first command to see it here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}