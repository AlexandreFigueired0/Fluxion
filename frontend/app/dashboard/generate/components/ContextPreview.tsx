'use client';

import { useState } from 'react';
import { X, Plus, Edit2, Check, AlertCircle } from 'lucide-react';
import { DetectResponse } from '../services/projectContextDetector';

interface ContextPreviewProps {
  context: DetectResponse;
  onContextChange?: (updatedContext: DetectResponse) => void;
}

export function ContextPreview({ context, onContextChange }: ContextPreviewProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedContext, setEditedContext] = useState<DetectResponse>(context);
  const [newDependency, setNewDependency] = useState('');

  const handleSave = () => {
    setEditMode(false);
    onContextChange?.(editedContext);
  };

  const handleCancel = () => {
    setEditedContext(context);
    setEditMode(false);
  };

  const updateField = (field: keyof DetectResponse, value: string | string[]) => {
    setEditedContext({
      ...editedContext,
      [field]: value,
    });
  };

  const addDependency = () => {
    if (newDependency.trim()) {
      const currentDeps = editedContext.dependencies || [];
      setEditedContext({
        ...editedContext,
        dependencies: [...currentDeps, newDependency.trim()],
      });
      setNewDependency('');
    }
  };

  const removeDependency = (index: number) => {
    const updatedDeps = (editedContext.dependencies || []).filter((_, i) => i !== index);
    setEditedContext({
      ...editedContext,
      dependencies: updatedDeps,
    });
  };

  const displayContext = editMode ? editedContext : context;

  return (
  <div className="w-full rounded-lg border border-zinc-800 bg-zinc-800 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-900/30 p-2">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Detected Project Context</h2>
            <p className="text-sm text-zinc-400">Review and customize the detected project information</p>
          </div>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 border border-zinc-700"
        >
          <Edit2 className="h-4 w-4" />
          {editMode ? 'Done Editing' : 'Edit'}
        </button>
      </div>

  <div className="space-y-6">
        {/* Primary Language & Package Manager */}
  <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Primary Language</label>
            {editMode ? (
              <input
                type="text"
                value={displayContext.primary_lang || ''}
                onChange={(e) => updateField('primary_lang', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none placeholder-zinc-500"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="text-sm font-medium text-zinc-100">{displayContext.primary_lang || 'Unknown'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Package Manager</label>
            {editMode ? (
              <input
                type="text"
                value={displayContext.package_manager || ''}
                onChange={(e) => updateField('package_manager', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none placeholder-zinc-500"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-medium text-zinc-100">{displayContext.package_manager || 'None'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Build & Test Commands */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Build Command</label>
            {editMode ? (
              <input
                type="text"
                value={displayContext.build_command || ''}
                onChange={(e) => updateField('build_command', e.target.value)}
                placeholder="e.g., npm run build"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-100 focus:border-blue-500 focus:outline-none placeholder-zinc-500"
              />
            ) : (
              <div className="rounded-lg bg-zinc-900 px-3 py-2">
                <code className="text-sm text-zinc-100">{displayContext.build_command || 'No build command detected'}</code>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Test Command</label>
            {editMode ? (
              <input
                type="text"
                value={displayContext.test_command || ''}
                onChange={(e) => updateField('test_command', e.target.value)}
                placeholder="e.g., npm test"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-100 focus:border-blue-500 focus:outline-none placeholder-zinc-500"
              />
            ) : (
              <div className="rounded-lg bg-zinc-900 px-3 py-2">
                <code className="text-sm text-zinc-100">{displayContext.test_command || 'No test command detected'}</code>
              </div>
            )}
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Key Dependencies ({(displayContext.dependencies || []).length})</label>
          <div className="space-y-3">
            {(displayContext.dependencies || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displayContext.dependencies!.map((dep, index) => (
                  <div key={index} className="inline-flex items-center gap-2 rounded-full bg-blue-900/30 px-3 py-1">
                    <span className="text-sm text-zinc-100">{dep}</span>
                    {editMode && (
                      <button
                        onClick={() => removeDependency(index)}
                        className="text-zinc-400 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-900/20 px-3 py-2">
                <p className="text-sm text-yellow-300">No dependencies detected</p>
              </div>
            )}

            {editMode && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newDependency}
                  onChange={(e) => setNewDependency(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDependency()}
                  placeholder="Add dependency name..."
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none placeholder-zinc-500"
                />
                <button
                  onClick={addDependency}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-900/30 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Docker & CI Files */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Special Files</label>
          <div className="space-y-2">
            {(displayContext.docker_files || []).length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-orange-900/20 px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400"></span>
                <span className="text-sm text-orange-200">Docker files: {displayContext.docker_files.join(', ')}</span>
              </div>
            )}
            {(displayContext.existing_ci || []).length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-purple-900/20 px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-purple-400"></span>
                <span className="text-sm text-purple-200">CI configs: {displayContext.existing_ci.join(', ')}</span>
              </div>
            )}
            {(displayContext.docker_files || []).length === 0 && (displayContext.existing_ci || []).length === 0 && (
              <div className="rounded-lg bg-zinc-900 px-3 py-2">
                <p className="text-sm text-zinc-400">No Docker or CI configuration files detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Project Structure Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Project Structure</label>
          {editMode ? (
            <textarea
              value={displayContext.structure || ''}
              onChange={(e) => updateField('structure', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none placeholder-zinc-500"
            />
          ) : (
            <div className="rounded-lg bg-zinc-900 px-3 py-2">
              <p className="whitespace-pre-wrap text-sm text-zinc-300">
                {displayContext.structure || 'No project structure information available'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
  <div className="mt-6 flex gap-3 border-t border-zinc-800 pt-6">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Check className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
