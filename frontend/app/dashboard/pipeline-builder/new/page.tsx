'use client';

import { useDashboardData } from '../../hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  LoadingState,
} from '../../components';
import { Workflow as WorkflowIcon } from 'lucide-react';
import { PipelineBuilder } from '../components/PipelineBuilder';
import { useSearchParams } from 'next/navigation';
import { workflowFromJson, workflowFromString } from '../utils/pipelineParser';
import type { Workflow as WorkflowType } from '../types';

export default function NewPipelinePage() {
  const { loading, isLoading } = useDashboardData();
  const searchParams = useSearchParams();
  const configParam = searchParams.get('config');

  // Parse the config if provided
  let initialConfig: WorkflowType | undefined;
  if (configParam) {
    try {
      const decoded = decodeURIComponent(configParam);
      try {
        initialConfig = workflowFromJson(decoded);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        initialConfig = workflowFromString(decoded);
      }
    } catch (e) {
      console.error('Failed to parse config parameter:', e);
    }
  }

  if (loading || isLoading) {
    return <LoadingState />;
  }

  return (
    <DashboardLayout>
      <DashboardNav />

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <WorkflowIcon className="text-orange-500" size={32} />
            <h1 className="text-4xl font-black">{initialConfig ? 'Import Workflow' : 'New Pipeline'}</h1>
          </div>
          <p className="text-zinc-400">
            {initialConfig
              ? 'Fine-tune your AI-generated workflow before deploying.'
              : 'Create your CI/CD pipeline visually. Drag, connect, and configure.'}
          </p>
        </div>

        <PipelineBuilder initialWorkflow={initialConfig} />
      </div>
    </DashboardLayout>
  );
}
