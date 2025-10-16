'use client';

import { useDashboardData } from '../../hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  LoadingState,
} from '../../components';
import { Bug } from 'lucide-react';

export default function DebugSessionPage() {
  const { loading, isLoading } = useDashboardData();

  if (loading || isLoading) {
    return <LoadingState />;
  }

  return (
    <DashboardLayout>
      <DashboardNav />

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bug className="text-orange-500" size={32} />
            <h1 className="text-4xl font-black">Debug Session</h1>
          </div>
          <p className="text-zinc-400">Analyze and fix your pipeline issues with AI</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <label className="block mb-2 text-sm font-semibold">Paste Error Log or Describe Issue</label>
          <textarea
            placeholder="Paste your error logs or describe the issue you're experiencing..."
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none min-h-[200px] resize-y font-mono text-sm"
          />
          
          <div className="mt-6">
            <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-white font-semibold cursor-pointer">
              Analyze & Fix
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
