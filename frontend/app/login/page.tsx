'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Call your backend API
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ email, password })
    // });
    
    console.log('Login:', { email, password });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden flex items-center justify-center">
      {/* Grid background */}
      <div 
        className="fixed inset-0 opacity-20"
      />

      <div className="relative z-10 w-full max-w-md px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-black text-sm">
            FX
          </div>
          <span className="text-xl font-bold">FLUXION</span>
        </Link>

        {/* Login Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h1 className="text-3xl font-black mb-2">Welcome back</h1>
          <p className="text-zinc-400 mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-orange-500 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-orange-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-zinc-400">Remember me</span>
              </label>
              <a href="#" className="text-orange-500 hover:text-orange-400 transition">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-orange-500 hover:text-orange-400 transition font-semibold">
              Sign up
            </Link>
          </div>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-zinc-400 hover:text-white transition">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-zinc-400 hover:text-white transition">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}