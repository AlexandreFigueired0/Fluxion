'use client';

import { useDashboardData } from '../../hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  LoadingState,
} from '../../components';
import { Sparkles } from 'lucide-react';

export default function GenerateNewPage() {
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
            <Sparkles className="text-orange-500" size={32} />
            <h1 className="text-4xl font-black">Generate Workflow</h1>
          </div>
          <p className="text-zinc-400">Describe your workflow and let AI generate it</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <label className="block mb-2 text-sm font-semibold">Workflow Description</label>
          <textarea
            placeholder="e.g., Build and test my Node.js app, run lint checks, deploy to production..."
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none min-h-[150px] resize-y"
          />
          
          <div className="mt-6 flex gap-4">
            <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-white font-semibold cursor-pointer">
              Generate Workflow
            </button>
            <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-white cursor-pointer">
              Use Template
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
