'use client';

import { useDashboardData } from '../hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  LoadingState,
} from '../components';
import { Workflow, Plus } from 'lucide-react';

export default function PipelineBuilderPage() {
  const { loading, isLoading } = useDashboardData();

  if (loading || isLoading) {
    return <LoadingState />;
  }

  return (
    <DashboardLayout>
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Workflow className="text-orange-500" size={32} />
            <h1 className="text-4xl font-black">Pipeline Builder</h1>
          </div>
          <p className="text-zinc-400">Create and manage your CI/CD pipelines visually</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <Workflow className="text-zinc-600 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-2">Visual Pipeline Builder</h2>
          <p className="text-zinc-400 mb-6">Design your workflows with drag-and-drop</p>
          <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-white font-semibold flex items-center gap-2 mx-auto cursor-pointer">
            <Plus size={20} />
            Create New Pipeline
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
