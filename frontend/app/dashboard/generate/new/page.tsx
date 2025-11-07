import { Suspense } from 'react';
import { DashboardLayout, DashboardNav } from '../../components';
import { GenerateNewContent } from './content';

export default function GenerateNewPage() {
  return (
    <DashboardLayout>
      <DashboardNav />
      <Suspense fallback={<div className="max-w-4xl mx-auto px-8 py-12">Loading...</div>}>
        <GenerateNewContent />
      </Suspense>
    </DashboardLayout>
  );
}
