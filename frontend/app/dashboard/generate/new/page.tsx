'use client';

import { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  LoadingState,
} from '../../components';
import { Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function GenerateNewPage() {
  const { loading, isLoading, userId, apiKeyName, apiKeyPrefix } = useDashboardData();
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: session, status } = useSession();

  const handleGenerate = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/commands/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          prompt: description,
          project_context: {}, // TODO: fill with real context if available
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate workflow');
      }
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyConfig = async () => {
    const configText = result.pipeline_config || JSON.stringify(result, null, 2);
    try {
      await navigator.clipboard.writeText(configText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={submitting}
          />
          {error && <div className="text-red-500 mt-2">{error}</div>}
          <div className="mt-6 flex gap-4">
            <button
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-white font-semibold cursor-pointer disabled:opacity-60"
              onClick={handleGenerate}
              disabled={submitting || !description.trim()}
            >
              {submitting ? 'Generating...' : 'Generate Workflow'}
            </button>
            {/* <Link href="/dashboard/generate/templates" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-white cursor-pointer">
              Use Template
            </Link> */}
          </div>
          <p className="text-zinc-400 mt-4">For better results, consider adding project context. <Link href="/docs/cli" className="text-orange-500 underline">See how</Link></p>
          {result && (
            <div className="mt-8 flex flex-col gap-6">
              {/* Config Box */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold">Generated Workflow Config</h2>
                  <div className="flex gap-2">
                    <Link
                      href={{
                        pathname: `/dashboard/pipeline-builder/new`,
                        query: { config: JSON.stringify(result.pipeline_json) },
                      }}
                      className="flex items-center gap-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 border border-orange-600 rounded transition text-sm text-white"
                    >
                      Open in Editor
                    </Link>
                    <button
                      onClick={handleCopyConfig}
                      className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition text-sm text-white"
                    >
                      {copied ? (
                        <>
                          <Check size={16} className="text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap break-words text-zinc-100 text-sm">
                  {result.pipeline_config || JSON.stringify(result, null, 2)}
                </pre>
              </div>
              {/* Details Box */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <h2 className="text-lg font-bold mb-2">Details & Insights</h2>
                {result.pipeline_description && (
                  <div className="mb-4 text-zinc-400">{result.pipeline_description}</div>
                )}
                {result.assumptions && result.assumptions.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold">Assumptions:</div>
                    <ul className="list-disc ml-6 text-zinc-300">
                      {result.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                {result.requirements && result.requirements.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold">Requirements:</div>
                    <ul className="list-disc ml-6 text-zinc-300">
                      {result.requirements.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {result.next_steps && result.next_steps.length > 0 && (
                  <div>
                    <div className="font-semibold">Next Steps:</div>
                    <ul className="list-disc ml-6 text-zinc-300">
                      {result.next_steps.map((n: string, i: number) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
