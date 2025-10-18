'use client';

import { useDashboardData } from '../hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  LoadingState,
} from '../components';
import { Workflow } from 'lucide-react';
import { PipelineBuilder } from './components/PipelineBuilder';

export default function PipelineBuilderPage() {
  const { loading, isLoading } = useDashboardData();

  if (loading || isLoading) {
    return <LoadingState />;
  }

  return (
    <DashboardLayout>
      <DashboardNav />

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Workflow className="text-orange-500" size={32} />
            <h1 className="text-4xl font-black">Pipeline Builder</h1>
          </div>
          <p className="text-zinc-400">Create and manage your CI/CD pipelines visually. Drag nodes from the palette, connect them, and generate GitHub Actions workflows.</p>
        </div>

        <PipelineBuilder />
      </div>
    </DashboardLayout>
  );
}
