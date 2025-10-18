'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { PipelineStep, StepType } from '../types';

interface StepEditorProps {
  step: PipelineStep;
  onUpdate: (step: PipelineStep) => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * StepEditor allows editing a single step within a job.
 * Shows different configuration options based on step type (action or run).
 */
export function StepEditor({ step, onUpdate, onDelete, onClose }: StepEditorProps) {
  const [localStep, setLocalStep] = useState<PipelineStep>(step);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newWithKey, setNewWithKey] = useState('');
  const [newWithValue, setNewWithValue] = useState('');

  useEffect(() => {
    setLocalStep(step);
  }, [step]);

  const handleTypeChange = (type: StepType) => {
    const updated = { ...localStep, type };
    // Clear type-specific fields
    if (type === 'action') {
      updated.run = undefined;
      updated.shell = undefined;
    } else if (type === 'run') {
      updated.uses = undefined;
      updated.with = undefined;
    }
    setLocalStep(updated);
    onUpdate(updated);
  };

  const handleBasicFieldChange = (field: keyof PipelineStep, value: any) => {
    const updated = { ...localStep, [field]: value };
    setLocalStep(updated);
    onUpdate(updated);
  };

  const addEnvVar = () => {
    if (!newEnvKey.trim()) return;
    const updated = {
      ...localStep,
      env: { ...localStep.env, [newEnvKey]: newEnvValue },
    };
    setLocalStep(updated);
    onUpdate(updated);
    setNewEnvKey('');
    setNewEnvValue('');
  };

  const removeEnvVar = (key: string) => {
    const updated: PipelineStep = {
      ...localStep,
      env: Object.fromEntries(
        Object.entries(localStep.env || {}).filter(([k]) => k !== key)
      ),
    };
    setLocalStep(updated);
    onUpdate(updated);
  };

  const addWithInput = () => {
    if (!newWithKey.trim()) return;
    const updated: PipelineStep = {
      ...localStep,
      with: { ...localStep.with, [newWithKey]: newWithValue },
    };
    setLocalStep(updated);
    onUpdate(updated);
    setNewWithKey('');
    setNewWithValue('');
  };

  const removeWithInput = (key: string) => {
    const updated: PipelineStep = {
      ...localStep,
      with: Object.fromEntries(
        Object.entries(localStep.with || {}).filter(([k]) => k !== key)
      ),
    };
    setLocalStep(updated);
    onUpdate(updated);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Edit Step</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Step Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Step Name</label>
          <input
            type="text"
            value={localStep.name || ''}
            onChange={(e) => handleBasicFieldChange('name', e.target.value)}
            placeholder="e.g., Install Dependencies"
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-xs text-zinc-500 mt-1">Optional but recommended for clarity</p>
        </div>

        {/* Step Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Step Type</label>
          <div className="flex gap-2">
            {(['action', 'run'] as StepType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`
                  px-4 py-2 rounded text-sm font-medium transition
                  ${
                    localStep.type === type
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }
                `}
              >
                {type === 'action' ? 'Use Action' : 'Run Script'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Type Configuration */}
        {localStep.type === 'action' && (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Action</label>
              <input
                type="text"
                value={localStep.uses || ''}
                onChange={(e) => handleBasicFieldChange('uses', e.target.value)}
                placeholder="e.g., actions/checkout@v4"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm font-mono text-xs"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Format: owner/repo@ref (e.g., actions/setup-node@v4)
              </p>
            </div>

            {/* Action Inputs (with:) */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Action Inputs (with:)
              </label>
              <div className="space-y-2 mb-2">
                {localStep.with &&
                  Object.entries(localStep.with).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2">
                        <p className="text-xs font-medium text-zinc-300">{key}</p>
                        <p className="text-xs text-zinc-400">{value}</p>
                      </div>
                      <button
                        onClick={() => removeWithInput(key)}
                        className="text-zinc-400 hover:text-red-400 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
              </div>

              {/* Add new input */}
              <div className="space-y-2 bg-zinc-950 border border-zinc-800 rounded p-2">
                <input
                  type="text"
                  value={newWithKey}
                  onChange={(e) => setNewWithKey(e.target.value)}
                  placeholder="Key (e.g., node-version)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs"
                />
                <input
                  type="text"
                  value={newWithValue}
                  onChange={(e) => setNewWithValue(e.target.value)}
                  placeholder="Value (e.g., 18.x)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs"
                />
                <button
                  onClick={addWithInput}
                  className="w-full text-sm text-orange-500 hover:text-orange-400 flex items-center justify-center gap-1 transition"
                >
                  <Plus size={14} />
                  Add Input
                </button>
              </div>
            </div>
          </>
        )}

        {/* Run Type Configuration */}
        {localStep.type === 'run' && (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Command</label>
              <textarea
                value={localStep.run || ''}
                onChange={(e) => handleBasicFieldChange('run', e.target.value)}
                placeholder="e.g., npm install && npm test"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm font-mono text-xs resize-none h-24"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Shell command to execute. Multiple commands can be separated by &&
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Shell</label>
              <select
                value={localStep.shell || 'bash'}
                onChange={(e) => handleBasicFieldChange('shell', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
              >
                <option value="bash">Bash (default)</option>
                <option value="sh">Shell</option>
                <option value="pwsh">PowerShell</option>
                <option value="cmd">CMD (Windows)</option>
              </select>
            </div>
          </>
        )}

        {/* Working Directory (Common) */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Working Directory</label>
          <input
            type="text"
            value={localStep.workingDirectory || ''}
            onChange={(e) => handleBasicFieldChange('workingDirectory', e.target.value)}
            placeholder="e.g., ./packages/frontend"
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm text-xs"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Overrides job working directory (useful for monorepos)
          </p>
        </div>

        {/* Environment Variables */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Environment Variables</label>
          <div className="space-y-2 mb-2">
            {localStep.env &&
              Object.entries(localStep.env).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2">
                    <p className="text-xs font-medium text-zinc-300">{key}</p>
                    <p className="text-xs text-zinc-400 break-all">{value}</p>
                  </div>
                  <button
                    onClick={() => removeEnvVar(key)}
                    className="text-zinc-400 hover:text-red-400 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
          </div>

          {/* Add new env var */}
          <div className="space-y-2 bg-zinc-950 border border-zinc-800 rounded p-2">
            <input
              type="text"
              value={newEnvKey}
              onChange={(e) => setNewEnvKey(e.target.value)}
              placeholder="Variable name (e.g., NODE_ENV)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs"
            />
            <input
              type="text"
              value={newEnvValue}
              onChange={(e) => setNewEnvValue(e.target.value)}
              placeholder="Value (e.g., production)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs"
            />
            <button
              onClick={addEnvVar}
              className="w-full text-sm text-orange-500 hover:text-orange-400 flex items-center justify-center gap-1 transition"
            >
              <Plus size={14} />
              Add Variable
            </button>
          </div>
        </div>

        {/* Conditional Execution */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Conditional Execution</label>
          <input
            type="text"
            value={localStep.if || ''}
            onChange={(e) => handleBasicFieldChange('if', e.target.value)}
            placeholder="e.g., success(), failure(), always()"
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm font-mono text-xs"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Advanced: Condition for when this step runs. Common: success(), failure(), always(), cancelled()
          </p>
        </div>

        {/* Continue on Error */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="continue-on-error"
            checked={localStep.continueOnError || false}
            onChange={(e) => handleBasicFieldChange('continueOnError', e.target.checked)}
            className="rounded border-zinc-700"
          />
          <label htmlFor="continue-on-error" className="text-sm text-zinc-300">
            Continue if this step fails
          </label>
        </div>

        {/* Timeout */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Timeout (minutes)</label>
          <input
            type="number"
            value={localStep.timeout || ''}
            onChange={(e) => handleBasicFieldChange('timeout', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Leave empty to use job timeout"
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
            min="1"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 rounded transition"
          >
            Close
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
          >
            Delete Step
          </button>
        </div>
      </div>
    </div>
  );
}
