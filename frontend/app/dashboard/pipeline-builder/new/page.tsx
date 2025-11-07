import { Suspense } from 'react';
import { DashboardLayout, DashboardNav } from '../../components';
import { NewPipelineContent } from './content';

export default function NewPipelinePage() {
  return (
    <DashboardLayout>
      <DashboardNav />
      <Suspense fallback={<div className="max-w-[1800px] mx-auto px-8 py-8">Loading...</div>}>
        <NewPipelineContent />
      </Suspense>
    </DashboardLayout>
  );
}
