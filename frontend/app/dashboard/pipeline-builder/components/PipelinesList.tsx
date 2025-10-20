'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, AlertCircle, Loader } from 'lucide-react';
import pipelineService from '../services/pipelineService';

interface Pipeline {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export function PipelinesList() {
  const { data: session } = useSession();
  const router = useRouter();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const userToken = session.user.id;
      const userID = session.user.id;

      const response = await pipelineService.listPipelines(userToken, userID);
      setPipelines(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pipelines';
      setError(errorMessage);
      console.error('Load pipelines error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/dashboard/pipeline-builder/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/pipeline-builder/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;

    if (!confirm('Are you sure you want to delete this pipeline?')) {
      return;
    }

    try {
      setDeletingId(id);
      const userToken = session.user.id;
      await pipelineService.deletePipeline(userToken, id);
      setPipelines(pipelines.filter((p) => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete pipeline';
      setError(errorMessage);
      console.error('Delete pipeline error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Pipelines</h2>
          <p className="text-zinc-400 text-sm mt-1">
            {pipelines.length} pipeline{pipelines.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
        >
          <Plus size={18} />
          New Pipeline
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <div>
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {pipelines.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <div className="text-zinc-500 mb-4">
            <p className="text-lg font-semibold">No pipelines yet</p>
            <p className="text-sm">Create your first pipeline to get started</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded flex items-center gap-2 transition mx-auto"
          >
            <Plus size={18} />
            Create Pipeline
          </button>
        </div>
      ) : (
        /* Pipelines Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {pipeline.name}
                  </h3>
                  {pipeline.description && (
                    <p className="text-sm text-zinc-400 truncate mt-1">
                      {pipeline.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-4 text-xs text-zinc-500 space-y-1">
                <p>
                  Created:{' '}
                  {new Date(pipeline.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p>
                  Updated:{' '}
                  {new Date(pipeline.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(pipeline.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 transition"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pipeline.id)}
                  disabled={deletingId === pipeline.id}
                  className="bg-red-900 hover:bg-red-800 disabled:bg-red-900 disabled:opacity-50 text-red-200 text-sm font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 transition"
                >
                  {deletingId === pipeline.id ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
