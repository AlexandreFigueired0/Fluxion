'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Job, PipelineStep, MatrixStrategy } from '../types';
import { StepEditor } from './StepEditor';

interface JobConfigPanelProps {
  job: Job;
  onUpdate: (job: Job) => void;
  onDelete: () => void;
  onClose: () => void;
}

const COMMON_RUNNERS = [
  'ubuntu-latest',
  'ubuntu-24.04',
  'windows-latest',
  'macos-latest',
];

/**
 * JobConfigPanel allows editing a job's configuration:
 * - Basic info (name, runs-on, timeout)
 * - Permissions
 * - Matrix strategy
 * - Steps within the job
 */
export function JobConfigPanel({ job, onUpdate, onDelete, onClose }: JobConfigPanelProps) {
  const [localJob, setLocalJob] = useState<Job>(job);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    steps: true,
    matrix: false,
    permissions: false,
  });

  useEffect(() => {
    setLocalJob(job);
  }, [job]);

  const handleJobChange = (field: keyof Job, value: any) => {
    const updated = { ...localJob, [field]: value };
    setLocalJob(updated);
    onUpdate(updated);
  };

  const addStep = () => {
    const newStep: PipelineStep = {
      id: `step_${Date.now()}`,
      type: 'action',
      uses: 'actions/checkout@v4',
    };
    const updated = {
      ...localJob,
      steps: [...localJob.steps, newStep],
    };
    setLocalJob(updated);
    onUpdate(updated);
    setSelectedStepId(newStep.id);
  };

  const updateStep = (stepId: string, updated: PipelineStep) => {
    const jobUpdate: Job = {
      ...localJob,
      steps: localJob.steps.map((s) => (s.id === stepId ? updated : s)),
    };
    setLocalJob(jobUpdate);
    onUpdate(jobUpdate);
  };

  const deleteStep = (stepId: string) => {
    const jobUpdate: Job = {
      ...localJob,
      steps: localJob.steps.filter((s) => s.id !== stepId),
    };
    setLocalJob(jobUpdate);
    onUpdate(jobUpdate);
    setSelectedStepId(null);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const selectedStep = selectedStepId ? localJob.steps.find((s) => s.id === selectedStepId) : null;

  // If a step is selected, show the step editor
  if (selectedStep) {
    return (
      <StepEditor
        step={selectedStep}
        onUpdate={(updated) => updateStep(selectedStep.id, updated)}
        onDelete={() => {
          deleteStep(selectedStep.id);
          setSelectedStepId(null);
        }}
        onClose={() => setSelectedStepId(null)}
      />
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Job: {job.name}</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Basic Configuration */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 transition flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-white">Basic Configuration</span>
            <span
              className={`text-zinc-400 transition-transform ${
                expandedSections.basic ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {expandedSections.basic && (
            <div className="px-4 py-3 space-y-3 border-t border-zinc-800">
              {/* Job Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Job Name</label>
                <input
                  type="text"
                  value={localJob.name}
                  onChange={(e) => handleJobChange('name', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>

              {/* Runs On */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Runs On</label>
                <select
                  value={Array.isArray(localJob.runsOn) ? localJob.runsOn[0] : localJob.runsOn}
                  onChange={(e) => handleJobChange('runsOn', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                >
                  {COMMON_RUNNERS.map((runner) => (
                    <option key={runner} value={runner}>
                      {runner}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1">Runner environment for this job</p>
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={localJob.timeout || ''}
                  onChange={(e) =>
                    handleJobChange('timeout', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="Default: 360"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                  min="1"
                />
              </div>

              {/* Environment */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Environment (optional)
                </label>
                <input
                  type="text"
                  value={localJob.environment || ''}
                  onChange={(e) => handleJobChange('environment', e.target.value || undefined)}
                  placeholder="e.g., production, staging"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  References a GitHub environment for deployment protection rules
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('steps')}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 transition flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-white">
              Steps ({localJob.steps.length})
            </span>
            <span
              className={`text-zinc-400 transition-transform ${
                expandedSections.steps ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {expandedSections.steps && (
            <div className="px-4 py-3 space-y-2 border-t border-zinc-800">
              {localJob.steps.length === 0 ? (
                <p className="text-sm text-zinc-400 py-2">No steps yet. Add one below.</p>
              ) : (
                localJob.steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    className="w-full text-left px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 transition border border-zinc-700"
                  >
                    <p className="text-xs font-medium text-white">
                      {idx + 1}. {step.name || 'Unnamed Step'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {step.type === 'action'
                        ? `Use: ${step.uses || 'N/A'}`
                        : `Run: ${step.run ? step.run.split('\n')[0] : 'N/A'}`}
                    </p>
                  </button>
                ))
              )}

              <button
                onClick={addStep}
                className="w-full text-sm text-orange-500 hover:text-orange-400 flex items-center justify-center gap-1 transition py-2"
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>
          )}
        </div>

        {/* Matrix Strategy */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('matrix')}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 transition flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-white">Matrix Strategy</span>
            <span
              className={`text-zinc-400 transition-transform ${
                expandedSections.matrix ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {expandedSections.matrix && (
            <div className="px-4 py-3 space-y-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-400">
                Run this job multiple times with different configurations. Add any custom matrix dimensions.
              </p>

              {/* Dynamic Matrix Fields */}
              {localJob.strategy &&
                Object.entries(localJob.strategy)
                  .filter(([key]) => !['exclude', 'include'].includes(key))
                  .map(([key, values]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-zinc-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <button
                          onClick={() => {
                            const updated = {
                              ...localJob,
                              strategy: {
                                ...localJob.strategy,
                                [key]: undefined,
                              },
                            };
                            delete updated.strategy[key];
                            setLocalJob(updated);
                            onUpdate(updated);
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g., ubuntu-latest, windows-latest, macos-latest (comma-separated)"
                        defaultValue={values?.join(', ') || ''}
                        onBlur={(e) => {
                          const newValues = e.currentTarget.value
                            .split(',')
                            .map((v) => v.trim())
                            .filter((v) => v);
                          const updated = {
                            ...localJob,
                            strategy: {
                              ...(localJob.strategy || {}),
                              [key]: newValues,
                            },
                          };
                          setLocalJob(updated);
                          onUpdate(updated);
                        }}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm mb-2"
                      />
                    </div>
                  ))}

              {/* Add New Matrix Dimension */}
              <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-2">
                <p className="text-xs text-zinc-400 font-semibold">Add New Dimension</p>
                <input
                  type="text"
                  placeholder="e.g., node-version, python-version, os, custom-var"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const key = e.currentTarget.value.trim().toLowerCase().replace(/\s+/g, '-');
                      const updated = {
                        ...localJob,
                        strategy: {
                          ...(localJob.strategy || {}),
                          [key]: [],
                        },
                      };
                      setLocalJob(updated);
                      onUpdate(updated);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                />
                <p className="text-xs text-zinc-500">Press Enter to add dimension</p>
              </div>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('permissions')}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 transition flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-white">Permissions</span>
            <span
              className={`text-zinc-400 transition-transform ${
                expandedSections.permissions ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {expandedSections.permissions && (
            <div className="px-4 py-3 space-y-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-400 mb-2">
                Configure GITHUB_TOKEN permissions for this job. Advanced feature.
              </p>
              <p className="text-xs text-zinc-500">
                Permissions configuration coming in Phase 2.
              </p>
            </div>
          )}
        </div>

        {/* Delete Job Button */}
        <button
          onClick={onDelete}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition mt-4"
        >
          Delete Job
        </button>
      </div>
    </div>
  );
}
