'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Trigger, TriggerEvent } from '../types';

interface TriggerEditorProps {
  trigger: Trigger;
  onUpdate: (trigger: Trigger) => void;
}

const TRIGGER_EVENTS: { value: TriggerEvent; label: string; description: string }[] = [
  {
    value: 'push',
    label: 'Push to Branch',
    description: 'Run workflow when code is pushed',
  },
  {
    value: 'pull_request',
    label: 'Pull Request',
    description: 'Run workflow when a pull request is opened or updated',
  },
  {
    value: 'schedule',
    label: 'Schedule',
    description: 'Run workflow on a schedule (cron)',
  },
  {
    value: 'workflow_dispatch',
    label: 'Manual Trigger',
    description: 'Run workflow manually from GitHub UI',
  },
  {
    value: 'release',
    label: 'Release',
    description: 'Run workflow when a release is published',
  },
];

export function TriggerEditor({ trigger, onUpdate }: TriggerEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localTrigger, setLocalTrigger] = useState<Trigger>(trigger);

  useEffect(() => {
    setLocalTrigger(trigger);
  }, [trigger]);

  const handleEventChange = (event: TriggerEvent) => {
    const updated = { ...localTrigger, event };
    // Clear event-specific fields when switching events
    if (event === 'push' || event === 'pull_request') {
      updated.schedule = undefined;
      updated.inputs = undefined;
    } else if (event === 'schedule') {
      updated.branches = undefined;
      updated.tags = undefined;
      updated.paths = undefined;
      updated.inputs = undefined;
    } else if (event === 'workflow_dispatch') {
      updated.branches = undefined;
      updated.tags = undefined;
      updated.paths = undefined;
      updated.schedule = undefined;
    }
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  const addBranch = () => {
    const updated = {
      ...localTrigger,
      branches: [...(localTrigger.branches || []), ''],
    };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  const removeBranch = (index: number) => {
    const updated = {
      ...localTrigger,
      branches: (localTrigger.branches || []).filter((_, i) => i !== index),
    };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  const updateBranch = (index: number, value: string) => {
    const updated = {
      ...localTrigger,
      branches: (localTrigger.branches || []).map((b, i) => (i === index ? value : b)),
    };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  const addPath = () => {
    const updated = {
      ...localTrigger,
      paths: [...(localTrigger.paths || []), ''],
    };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  const removePath = (index: number) => {
    const updated = {
      ...localTrigger,
      paths: (localTrigger.paths || []).filter((_, i) => i !== index),
    };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  const updatePath = (index: number, value: string) => {
    const updated = {
      ...localTrigger,
      paths: (localTrigger.paths || []).map((p, i) => (i === index ? value : p)),
    };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  const updateSchedule = (schedule: string) => {
    const updated = { ...localTrigger, schedule };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  const currentEvent = TRIGGER_EVENTS.find((e) => e.value === localTrigger.event);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800 transition rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Workflow Trigger</h3>
          {currentEvent && (
            <span className="text-xs text-zinc-400 ml-2">{currentEvent.label}</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-zinc-800 px-4 py-4 space-y-4">
          {/* Event Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Trigger Event</label>
            <select
              value={localTrigger.event}
              onChange={(e) => handleEventChange(e.target.value as TriggerEvent)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
            >
              {TRIGGER_EVENTS.map((event) => (
                <option key={event.value} value={event.value}>
                  {event.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">{currentEvent?.description}</p>
          </div>

          {/* Push/Pull Request Specific */}
          {(localTrigger.event === 'push' || localTrigger.event === 'pull_request') && (
            <>
              {/* Branches */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Run on Branches
                </label>
                <div className="space-y-2">
                  {(localTrigger.branches || []).map((branch, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => updateBranch(index, e.target.value)}
                        placeholder="e.g., main, develop"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                      />
                      <button
                        onClick={() => removeBranch(index)}
                        className="text-zinc-400 hover:text-red-400 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBranch}
                    className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1 transition"
                  >
                    <Plus size={16} />
                    Add Branch
                  </button>
                </div>
              </div>

              {/* Paths (Monorepo Support) */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Run on Path Changes (optional)
                </label>
                <p className="text-xs text-zinc-500 mb-2">
                  Leave empty to run on all changes. Useful for monorepos.
                </p>
                <div className="space-y-2">
                  {(localTrigger.paths || []).map((path, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={path}
                        onChange={(e) => updatePath(index, e.target.value)}
                        placeholder="e.g., src/**, lib/**, !src/docs/**"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                      />
                      <button
                        onClick={() => removePath(index)}
                        className="text-zinc-400 hover:text-red-400 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addPath}
                    className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1 transition"
                  >
                    <Plus size={16} />
                    Add Path Pattern
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Schedule Specific */}
          {localTrigger.event === 'schedule' && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Cron Schedule
              </label>
              <input
                type="text"
                value={localTrigger.schedule || ''}
                onChange={(e) => updateSchedule(e.target.value)}
                placeholder="e.g., 0 0 * * 0 (weekly on Sunday)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Cron syntax. Use{' '}
                <a
                  href="https://crontab.guru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400"
                >
                  crontab.guru
                </a>{' '}
                to generate expressions.
              </p>
            </div>
          )}

          {/* Workflow Dispatch Specific */}
          {localTrigger.event === 'workflow_dispatch' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-400">
              <p className="font-medium text-zinc-300 mb-1">Workflow Dispatch</p>
              <p>
                This workflow can be triggered manually from GitHub. Users can provide inputs when
                triggering it.
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Workflow dispatch inputs configuration coming in Phase 2.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
