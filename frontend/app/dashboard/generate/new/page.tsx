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
import { useSession, signIn } from 'next-auth/react';
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
  const [useProjectContext, setUseProjectContext] = useState(false);
  const [gitHubConnecting, setGitHubConnecting] = useState(false);
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

  const handleUseContext = () => {
    setUseProjectContext(true);
  };

  const handleRemoveContext = () => {
    setProjectContext(null);
    setUseProjectContext(false);
    setContextError("");
  };

  const handleConnectGitHub = async () => {
    setGitHubConnecting(true);
    try {
      // Redirect to GitHub OAuth sign in
      await signIn("github", { 
        redirect: false,
        callbackUrl: window.location.pathname
      });
    } catch (error) {
      console.error("GitHub connection error:", error);
      setContextError("Failed to connect GitHub. Please try again.");
    } finally {
      setGitHubConnecting(false);
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-8">
          {/* Use Project Context Toggle */}
          {!projectContext && !useProjectContext && (
            <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">Use Project Context</h3>
                  <p className="text-xs text-zinc-400 mt-1">Analyze your project for better AI-generated workflows (+2 credits)</p>
                </div>
                <button
                  onClick={() => setUseProjectContext(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium text-white transition"
                >
                  Enable
                </button>
              </div>
            </div>
          )}

          {/* Repository Selector - Only show if enabled */}
          {useProjectContext && !projectContext && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">Project Context</h3>
                  <p className="text-xs text-zinc-400 mt-1">Select your GitHub repository to analyze</p>
                </div>
                <button
                  onClick={() => setUseProjectContext(false)}
                  className="text-xs text-zinc-400 hover:text-red-400 transition"
                >
                  Disable
                </button>
              </div>

              {/* GitHub Connection Options */}
              <div className="space-y-3">
                {/* Option 1: GitHub Connected (via OAuth) */}
                {session?.githubToken && session?.accessToken && (
                  <div>
                    <RepoSelector
                      userToken={session.accessToken}
                      onDetected={handleContextDetected}
                      onError={handleContextError}
                      onLoading={() => {}}
                    />
                    {contextError && (
                      <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                        {contextError}
                      </div>
                    )}
                  </div>
                )}

                {/* Option 2: GitHub OAuth for non-GitHub users */}
                {!session?.githubToken && (
                  <div className="rounded-lg bg-zinc-800 p-4 border border-zinc-700 space-y-3">
                    <div>
                      <p className="text-xs text-zinc-300 mb-3">
                        You haven&apos;t connected your GitHub account yet. Connect to access your repositories and analyze projects.
                      </p>
                    </div>
                    <button
                      onClick={handleConnectGitHub}
                      disabled={gitHubConnecting}
                      className="w-full px-4 py-2 bg-[#1f2937] hover:bg-[#111827] border border-zinc-600 rounded-lg text-sm font-medium text-white transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.557.636-1.914-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.194 20 14.44 20 10.017 20 4.484 15.522 0 10 0z" />
                      </svg>
                      {gitHubConnecting ? 'Connecting...' : 'Connect GitHub'}
                    </button>
                    <p className="text-xs text-zinc-500">
                      We&apos;ll securely connect your GitHub account to access your repositories.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Context Preview - Only show if context detected */}
          {projectContext && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Detected Context</h3>
                  <p className="text-xs text-zinc-400 mt-1">Review your project details. Editable fields will enhance the workflow.</p>
                </div>
                <button
                  onClick={handleRemoveContext}
                  className="text-xs px-3 py-1 text-zinc-400 hover:text-red-400 transition"
                >
                  ✕ Remove
                </button>
              </div>
              <ContextPreview
                context={projectContext}
                onContextChange={setProjectContext}
                onUseContext={handleUseContext}
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
