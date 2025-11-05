'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, GitBranch, Lock, Globe, Loader } from 'lucide-react';
import { projectContextDetectorService, Repository, DetectResponse } from '../services/projectContextDetector';

interface RepoSelectorProps {
  userToken: string;
  onDetected: (context: DetectResponse) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

export function RepoSelector({ userToken, onDetected, onError, onLoading }: RepoSelectorProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'repos' | 'manual'>('repos');
  const [detecting, setDetecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedRef = useRef(false);

  // Load user's repositories on mount only
  useEffect(() => {
    if (userToken && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      
      const loadRepositories = async () => {
        setLoading(true);
        try {
          const repos = await projectContextDetectorService.getUserRepositories(userToken);
          setRepositories(repos);
          setFilteredRepos(repos);
          
          // If no repos, switch to manual tab
          if (repos.length === 0) {
            setActiveTab('manual');
          }
        } catch (error) {
          console.error('Failed to load repositories:', error);
          // Silently fail - user can still use manual entry
          setActiveTab('manual');
        } finally {
          setLoading(false);
        }
      };
      
      loadRepositories();
    }
  }, [userToken]);

  useEffect(() => {
    if (!showDropdown) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredRepos(repositories);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = repositories.filter(
        (repo) =>
          repo.name.toLowerCase().includes(lowerQuery) ||
          repo.full_name.toLowerCase().includes(lowerQuery) ||
          repo.description?.toLowerCase().includes(lowerQuery)
      );
      setFilteredRepos(filtered);
    }
  };

  const handleSelectRepository = async (repo: Repository) => {
    setShowDropdown(false);
    await detectRepository(repo.owner, repo.name);
  };

  const detectRepository = async (owner: string, repo: string) => {
    setDetecting(true);
    onLoading(true);

    try {
      const context = await projectContextDetectorService.detectProject(
        userToken,
        owner,
        repo
      );
      onDetected(context);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to detect project';
      onError(errorMessage);
    } finally {
      setDetecting(false);
      onLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('repos')}
            disabled={repositories.length === 0}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'repos'
                ? 'bg-zinc-800 text-orange-500 border-b-2 border-orange-500'
                : 'text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <GitBranch size={16} />
              Your Repositories
              {repositories.length > 0 && (
                <span className="ml-1 text-xs bg-zinc-700 px-2 py-1 rounded">{repositories.length}</span>
              )}
            </div>
          </button>
        </div>

        {/* Repositories Tab */}
        {activeTab === 'repos' && (
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-zinc-400">
                <Loader className="animate-spin" size={16} />
                Loading repositories...
              </div>
            ) : repositories.length === 0 ? (
              <div className="py-6 text-center text-zinc-400">
                <p className="mb-2">No repositories found</p>
                <p className="text-sm text-zinc-500">Connect your GitHub account to see your repositories</p>
              </div>
            ) : (
              <>
                {/* Search Input */}
                <div className="relative" ref={dropdownRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-700 rounded shadow-lg z-50 max-h-64 overflow-y-auto">
                    {filteredRepos.length === 0 ? (
                      <div className="p-4 text-center text-zinc-400">
                        {searchQuery ? 'No repositories match your search' : 'No repositories available'}
                      </div>
                    ) : (
                      filteredRepos.map((repo) => (
                        <button
                          key={repo.full_name}
                          onClick={() => handleSelectRepository(repo)}
                          className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition border-b border-zinc-800 last:border-b-0"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-zinc-100 truncate">{repo.full_name}</span>
                                {repo.private ? (
                                  <Lock size={14} className="text-orange-500 flex-shrink-0" />
                                ) : (
                                  <Globe size={14} className="text-zinc-500 flex-shrink-0" />
                                )}
                              </div>
                              {repo.description && (
                                <p className="text-xs text-zinc-400 truncate">{repo.description}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Loading State for Detection */}
      {detecting && (
        <div className="flex items-center justify-center gap-2 text-orange-500 text-sm py-3 bg-zinc-950 border border-orange-500/30 rounded">
          <Loader className="animate-spin" size={16} />
          Analyzing repository...
        </div>
      )}
    </div>
  );
}
