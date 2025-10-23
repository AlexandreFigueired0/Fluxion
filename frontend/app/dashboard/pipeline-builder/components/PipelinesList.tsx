'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, AlertCircle, Loader, ChevronDown, ChevronUp, Search, Edit } from 'lucide-react';
import pipelineService from '../services/pipelineService';

interface Pipeline {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

type SortBy = 'name' | 'created' | 'updated';
type SortOrder = 'asc' | 'desc';

export function PipelinesList() {
  const { data: session } = useSession();
  const router = useRouter();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const userToken = session.accessToken!;
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

  // Filter and sort pipelines
  const filteredAndSortedPipelines = useMemo(() => {
    const filtered = pipelines.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'name') {
        compareValue = a.name.localeCompare(b.name);
      } else if (sortBy === 'created') {
        compareValue =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'updated') {
        compareValue =
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [pipelines, searchQuery, sortBy, sortOrder]);

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

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
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
            {filteredAndSortedPipelines.length} of {pipelines.length} pipeline
            {pipelines.length !== 1 ? 's' : ''}
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
        <div className="space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search pipelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-600 transition"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-600 transition"
              >
                <option value="name">Sort by Name</option>
                <option value="created">Sort by Created</option>
                <option value="updated">Sort by Updated</option>
              </select>

              <button
                onClick={toggleSortOrder}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white hover:border-zinc-700 transition flex items-center gap-1"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Pipelines Table - Desktop View */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-zinc-300">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-zinc-300">
                    Description
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-zinc-300">
                    Updated
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-zinc-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedPipelines.map((pipeline) => (
                  <tr
                    key={pipeline.id}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50 transition"
                  >
                    <td className="px-6 py-4 text-white font-medium">{pipeline.name}</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm truncate">
                      {pipeline.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {new Date(pipeline.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(pipeline.id)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-zinc-700/50 transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pipeline.id)}
                        disabled={deletingId === pipeline.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50 p-2 rounded hover:bg-zinc-700/50 transition"
                        title="Delete"
                      >
                        {deletingId === pipeline.id ? (
                          <Loader size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pipelines Rows - Mobile View */}
          <div className="md:hidden space-y-3">
            {filteredAndSortedPipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">
                      {pipeline.name}
                    </h3>
                    {pipeline.description && (
                      <p className="text-sm text-zinc-400 truncate mt-1">
                        {pipeline.description}
                      </p>
                    )}
                    <div className="mt-3 space-y-1 text-xs text-zinc-500">
                      <p>
                        Updated:{' '}
                        {new Date(pipeline.updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(pipeline.id)}
                      className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-zinc-800 transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(pipeline.id)}
                      disabled={deletingId === pipeline.id}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 p-2 rounded hover:bg-zinc-800 transition"
                    >
                      {deletingId === pipeline.id ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredAndSortedPipelines.length === 0 && pipelines.length > 0 && (
            <div className="text-center py-8 text-zinc-400">
              <p>No pipelines match your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
