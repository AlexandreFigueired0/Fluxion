'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Call your backend API
    // const response = await fetch('/api/auth/signup', {
    //   method: 'POST',
    //   body: JSON.stringify({ name, email, password })
    // });
    
    console.log('Signup:', { name, email, password });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden flex items-center justify-center">
      {/* Grid background */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundSize: '80px 80px'
        }}
      />

      <div className="relative z-10 w-full max-w-md px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-black text-sm">
            FX
          </div>
          <span className="text-xl font-bold">FLUXION</span>
        </Link>

        {/* Signup Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h1 className="text-3xl font-black mb-2">Get started</h1>
          <p className="text-zinc-400 mb-8">Create your account and get 50 free credits</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-orange-500 transition"
                placeholder="John Doe"
                required
              />
            </div>

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
                minLength={8}
              />
              <p className="text-xs text-zinc-500 mt-2">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-400 transition font-semibold">
              Sign in
            </Link>
          </div>
        </div>

        {/* <p className="text-center text-zinc-500 text-sm mt-8">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-zinc-400 hover:text-white transition">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-zinc-400 hover:text-white transition">Privacy Policy</a>
        </p> */}
      </div>
    </div>
  );
}