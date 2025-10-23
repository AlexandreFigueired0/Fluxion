'use client';

import { useDashboardData } from './hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  DashboardHeader,
  CreditsCard,
  LoadingState,
} from './components';
import { Workflow, Zap, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { credits, userName, loading, isLoading, } = useDashboardData();

  if (loading || isLoading) {
    return <LoadingState />;
  }

  return (
    <DashboardLayout>
      <DashboardNav />

      <div className="max-w-6xl mx-auto px-8 py-12">
        <DashboardHeader userName={userName} />

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <CreditsCard credits={credits} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Zap className="text-blue-500" size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-zinc-100">Getting Started</h3>
              <p className="text-sm text-zinc-400">Start building your first CI/CD pipeline with our visual pipeline builder.</p>
            </div>
          </div>
        </div>

        {/* Main CTA - Pipeline Builder */}
        <Link href="/dashboard/pipeline-builder">
          <div className="bg-gradient-to-r from-orange-900/20 via-orange-900/10 to-transparent border border-orange-500/30 rounded-lg p-8 mb-12 hover:border-orange-500/50 transition cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <Workflow className="text-orange-500" size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-100">Pipeline Builder</h2>
                </div>
                <p className="text-zinc-400 max-w-xl">Create and manage your CI/CD pipelines visually. Drag nodes, connect them, and automatically generate GitHub Actions workflows.</p>
              </div>
              <ArrowRight className="text-orange-500 group-hover:translate-x-1 transition" size={32} />
            </div>
          </div>
        </Link>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-zinc-100">Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Visual Builder */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center mb-4">
                <Workflow className="text-orange-500" size={20} />
              </div>
              <h4 className="font-semibold text-zinc-100 mb-2">Visual Pipeline Builder</h4>
              <p className="text-sm text-zinc-400 mb-4">Drag-and-drop interface to design complex CI/CD workflows without writing YAML.</p>
              <Link href="/dashboard/pipeline-builder" className="text-orange-500 text-sm font-medium hover:text-orange-400 transition flex items-center gap-1">
                Explore <ArrowRight size={14} />
              </Link>
            </div>

            {/* Documentation */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-blue-500" size={20} />
              </div>
              <h4 className="font-semibold text-zinc-100 mb-2">Documentation</h4>
              <p className="text-sm text-zinc-400 mb-4">Learn how to use Fluxion with comprehensive guides and examples.</p>
              <Link href="/docs" className="text-blue-500 text-sm font-medium hover:text-blue-400 transition flex items-center gap-1">
                Read docs <ArrowRight size={14} />
              </Link>
            </div>

            {/* API Reference */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-purple-500" size={20} />
              </div>
              <h4 className="font-semibold text-zinc-100 mb-2">API Integration</h4>
              <p className="text-sm text-zinc-400 mb-4">Integrate Fluxion with your existing tools and workflows.</p>
              <Link href="/docs" className="text-purple-500 text-sm font-medium hover:text-purple-400 transition flex items-center gap-1">
                Learn more <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Quick Tips</h3>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Start by creating a new pipeline in the Pipeline Builder to visualize your CI/CD workflow.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Use templates to quickly set up common CI/CD patterns for your project type.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Export your pipelines as GitHub Actions workflows directly to your repository.</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}