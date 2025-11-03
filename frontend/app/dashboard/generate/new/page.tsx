'use client';

import { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  LoadingState,
} from '../../components';
import { Sparkles, Copy, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { GenerateResponse, generateService } from '../services/generate';
import { RepoSelector } from '../components/RepoSelector';
import { ContextPreview } from '../components/ContextPreview';
import { DetectResponse } from '../services/projectContextDetector';

export default function GenerateNewPage() {
  const { loading, isLoading, } = useDashboardData();
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<GenerateResponse>({} as GenerateResponse);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [projectContext, setProjectContext] = useState<DetectResponse | null>(null);
  const [contextError, setContextError] = useState<string>("");
  const { data: session } = useSession();

  const handleGenerate = async () => {
    setSubmitting(true);

    const result = await generateService.generateWorkflow(
      session?.accessToken || '',
      description,
      projectContext || undefined,
    ).catch((err) => {
      setError(err.message || 'An error occurred while generating the workflow.');
    }).finally(() => {
      setSubmitting(false);
    });

    if (result) {
      setResult(result);
      setError("");
    }
  }

  const handleContextDetected = (context: DetectResponse) => {
    setProjectContext(context);
    setContextError("");
  };

  const handleContextError = (error: string) => {
    setContextError(error);
  };

  const handleClearContext = () => {
    setProjectContext(null);
    setContextError("");
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-8">
          {/* Repository Selector */}
          {session?.accessToken && (
            <div>
              <label className="block mb-4 text-sm font-semibold">Project Context (Optional)</label>
              <RepoSelector
                userToken={session.accessToken}
                onDetected={handleContextDetected}
                onError={handleContextError}
                onLoading={() => {}}
              />
              {contextError && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {contextError}
                </div>
              )}
            </div>
          )}

          {/* Context Preview */}
          {projectContext && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Detected Context</h3>
                <button
                  onClick={handleClearContext}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm text-zinc-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>
              <ContextPreview
                context={projectContext}
                onContextChange={setProjectContext}
                onUseContext={() => {}}
              />
            </div>
          )}

          {/* Workflow Description */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Workflow Description</label>
            <textarea
              placeholder="e.g., Build and test my Node.js app, run lint checks, deploy to production..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none min-h-[150px] resize-y"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={submitting}
            />
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-white font-semibold cursor-pointer disabled:opacity-60"
              onClick={handleGenerate}
              disabled={submitting || !description.trim()}
            >
              {submitting ? 'Generating...' : 'Generate Workflow'}
            </button>
          </div>
          <p className="text-zinc-400 mt-4">For better results, consider adding project context. <Link href="/docs/cli" className="text-orange-500 underline">See how</Link></p>
          {result.pipeline_config && (
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
