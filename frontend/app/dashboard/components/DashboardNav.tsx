'use client';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function DashboardNav() {
  return (
    <nav className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-zinc-100">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <Link href="/docs" className="text-zinc-400 hover:text-white transition cursor-pointer">
          Docs
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
