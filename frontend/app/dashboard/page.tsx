'use client';

import { useDashboardData } from './hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  DashboardHeader,
  CreditsCard,
  LoadingState,
} from './components';
import { Workflow, Zap, ArrowRight, Sparkles, Bug } from 'lucide-react';
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

        {/* AI Features Section */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-zinc-100">AI-Powered Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Generate */}
            <Link href="/dashboard/generate/new">
              <div className="bg-gradient-to-br from-emerald-900/20 via-emerald-900/10 to-transparent border border-emerald-500/30 rounded-lg p-6 hover:border-emerald-500/50 transition cursor-pointer h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-emerald-500" size={20} />
                  </div>
                  <h4 className="font-semibold text-zinc-100">Generate Workflow</h4>
                </div>
                <p className="text-sm text-zinc-400 mb-4">Describe your workflow in plain English and let AI generate the complete CI/CD configuration for you.</p>
                <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                  Start generating <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* AI Debug */}
            <Link href="/dashboard/debug/session">
              <div className="bg-gradient-to-br from-cyan-900/20 via-cyan-900/10 to-transparent border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-500/50 transition cursor-pointer h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                    <Bug className="text-cyan-500" size={20} />
                  </div>
                  <h4 className="font-semibold text-zinc-100">Debug Workflow</h4>
                </div>
                <p className="text-sm text-zinc-400 mb-4">Upload your workflow configuration and get AI-powered insights to fix issues and optimize performance.</p>
                <div className="flex items-center gap-1 text-cyan-500 text-sm font-medium">
                  Start debugging <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Quick Tips</h3>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Start by creating a pipeline configuration with our Generate feature</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Open the generated workflow in the visual editor to make adjustments.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Test your pipelines thoroughly before deploying to production.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span>Debug your workflows using the built-in Debug feature.</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}