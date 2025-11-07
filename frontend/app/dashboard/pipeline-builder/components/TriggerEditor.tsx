'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import {
  WorkflowTrigger,
  PushTriggerConfig,
  PullRequestTriggerConfig,
  ScheduleTrigger,
} from '../types';

interface TriggerEditorProps {
  trigger: WorkflowTrigger | undefined;
  onUpdate: (trigger: WorkflowTrigger) => void;
  onExpandChange?: (isExpanded: boolean) => void;
}

interface TriggerOption {
  key: 'push' | 'pull_request' | 'schedule' | 'workflow_dispatch' | 'release';
  label: string;
  description: string;
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    key: 'push',
    label: 'Push to Branch',
    description: 'Run workflow when code is pushed',
  },
  {
    key: 'pull_request',
    label: 'Pull Request',
    description: 'Run workflow when a pull request is opened or updated',
  },
  {
    key: 'schedule',
    label: 'Schedule',
    description: 'Run workflow on a schedule (cron)',
  },
  {
    key: 'workflow_dispatch',
    label: 'Manual Trigger',
    description: 'Run workflow manually from GitHub UI',
  },
  {
    key: 'release',
    label: 'Release',
    description: 'Run workflow when a release is published',
  },
];

/**
 * TriggerEditor allows configuring workflow triggers using the GitHub Actions `on` field.
 * Supports multiple event types: push, pull_request, schedule, workflow_dispatch, release, etc.
 */
export function TriggerEditor({ trigger, onUpdate, onExpandChange }: TriggerEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localTrigger, setLocalTrigger] = useState<WorkflowTrigger>(
    trigger || { push: { branches: ['main'] } }
  );

  useEffect(() => {
    if (trigger) {
      setLocalTrigger(trigger);
    }
  }, [trigger]);

  const handleToggleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandChange?.(expanded);
  };

  // Check if a trigger type is enabled
  const isEventEnabled = (key: string): boolean => {
    if (typeof localTrigger !== 'object') return false;
    return key in localTrigger;
  };

  // Toggle an event type on/off
  const toggleEventType = (
    key: 'push' | 'pull_request' | 'schedule' | 'workflow_dispatch' | 'release'
  ) => {
    const updated: WorkflowTrigger = { ...localTrigger };

    if (updated[key]) {
      delete updated[key];
    } else {
      switch (key) {
        case 'push':
          updated.push = { branches: ['main'] };
          break;
        case 'pull_request':
          updated.pull_request = { branches: ['main'] };
          break;
        case 'schedule':
          updated.schedule = [{ cron: '0 0 * * 0' }];
          break;
        case 'workflow_dispatch':
          updated.workflow_dispatch = {};
          break;
        case 'release':
          updated.release = {};
          break;
      }
    }

    setLocalTrigger(updated);
    onUpdate(updated);
  };

  // Update push trigger configuration
  const updatePushConfig = (config: PushTriggerConfig) => {
    const updated: WorkflowTrigger = { ...localTrigger, push: config };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  // Update pull_request trigger configuration
  const updatePullRequestConfig = (config: PullRequestTriggerConfig) => {
    const updated: WorkflowTrigger = { ...localTrigger, pull_request: config };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  // Update schedule trigger configuration
  const updateScheduleConfig = (schedules: ScheduleTrigger[]) => {
    const updated: WorkflowTrigger = { ...localTrigger, schedule: schedules };
    setLocalTrigger(updated);
    onUpdate(updated);
  };

  // Get trigger config for push event (safe access)
  const getPushConfig = (): PushTriggerConfig | undefined => {
    if (typeof localTrigger === 'object' && 'push' in localTrigger) {
      return localTrigger.push as PushTriggerConfig;
    }
    return undefined;
  };

  // Get trigger config for pull_request event (safe access)
  const getPullRequestConfig = (): PullRequestTriggerConfig | undefined => {
    if (typeof localTrigger === 'object' && 'pull_request' in localTrigger) {
      return localTrigger.pull_request as PullRequestTriggerConfig;
    }
    return undefined;
  };

  // Get trigger config for schedule event (safe access)
  const getScheduleConfig = (): ScheduleTrigger[] | undefined => {
    if (typeof localTrigger === 'object' && 'schedule' in localTrigger) {
      return localTrigger.schedule as ScheduleTrigger[];
    }
    return undefined;
  };

  // Push-specific handlers
  const addBranchToPush = () => {
    const config = getPushConfig();
    if (config) {
      updatePushConfig({
        ...config,
        branches: [...(config.branches || []), ''],
      });
    }
  };

  const removeBranchFromPush = (index: number) => {
    const config = getPushConfig();
    if (config) {
      const branches = (config.branches || []).filter((_, i) => i !== index);
      updatePushConfig({ ...config, branches });
    }
  };

  const updateBranchInPush = (index: number, value: string) => {
    const config = getPushConfig();
    if (config) {
      const branches = (config.branches || []).map((branch, i) =>
        i === index ? value : branch
      );
      updatePushConfig({ ...config, branches });
    }
  };

  const updateBranchInPullRequest = (index: number, value: string) => {
    const config = getPullRequestConfig();
    if (config) {
      const branches = (config.branches || []).map((branch, i) =>
        i === index ? value : branch
      );
      updatePullRequestConfig({ ...config, branches });
    }
  };

  const removeBranchFromPullRequest = (index: number) => {
    const config = getPullRequestConfig();
    if (config) {
      const branches = (config.branches || []).filter((_, i) => i !== index);
      updatePullRequestConfig({ ...config, branches });
    }
  };

  const addPathToPush = () => {
    const config = getPushConfig();
    if (config) {
      updatePushConfig({
        ...config,
        paths: [...(config.paths || []), ''],
      });
    }
  };

  const removePathFromPush = (index: number) => {
    const config = getPushConfig();
    if (config) {
      const paths = (config.paths || []).filter((_, i) => i !== index);
      updatePushConfig({ ...config, paths });
    }
  };

  const updatePathInPush = (index: number, value: string) => {
    const config = getPushConfig();
    if (config) {
      const paths = (config.paths || []).map((path, i) =>
        i === index ? value : path
      );
      updatePushConfig({ ...config, paths });
    }
  };

  // Schedule-specific handlers
  const addCronSchedule = () => {
    const schedules = getScheduleConfig() || [];
    updateScheduleConfig([...schedules, { cron: '' }]);
  };

  const removeCronSchedule = (index: number) => {
    const schedules = getScheduleConfig() || [];
    updateScheduleConfig(schedules.filter((_, i) => i !== index));
  };

  const updateCronSchedule = (index: number, value: string) => {
    const schedules = getScheduleConfig() || [];
    updateScheduleConfig(
      schedules.map((schedule, i) =>
        i === index ? { cron: value } : schedule
      )
    );
  };

  const getEnabledCount = (): number => {
    if (typeof localTrigger !== 'object') return 0;
    return Object.entries(localTrigger).filter(([, value]) => value !== undefined).length;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col max-h-[400px]">
      {/* Header */}
      <button
        onClick={() => handleToggleExpand(!isExpanded)}
        className="px-4 py-3 flex items-center justify-between hover:bg-zinc-800 transition flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Workflow Triggers</h3>
          {getEnabledCount() > 0 && (
            <span className="text-xs text-zinc-400 ml-2">
              {getEnabledCount()} event{getEnabledCount() !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Content - Scrollable when expanded */}
      {isExpanded && (
        <div className="border-t border-zinc-800 px-4 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Event Type Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Enable Trigger Events
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Select which events should trigger this workflow
            </p>
            <div className="space-y-2">
              {TRIGGER_OPTIONS.map((option) => (
                <label
                  key={option.key}
                  className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={isEventEnabled(option.key)}
                    onChange={() => toggleEventType(option.key)}
                    className="w-4 h-4 rounded border-zinc-700"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{option.label}</p>
                    <p className="text-xs text-zinc-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Push Event Configuration */}
          {getPushConfig() && (
            <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-3">
              <h4 className="text-sm font-semibold text-white">Push Event</h4>

              {/* Branches */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Run on Branches
                </label>
                <div className="space-y-2">
                  {(getPushConfig()?.branches || []).map((branch: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => updateBranchInPush(index, e.target.value)}
                        placeholder="e.g., main, develop"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs"
                      />
                      <button
                        onClick={() => removeBranchFromPush(index)}
                        className="text-zinc-400 hover:text-red-400 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBranchToPush}
                    className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1 transition"
                  >
                    <Plus size={14} />
                    Add Branch
                  </button>
                </div>
              </div>

              {/* Paths */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Run on Path Changes (optional)
                </label>
                <p className="text-xs text-zinc-500 mb-2">Useful for monorepos</p>
                <div className="space-y-2">
                  {(getPushConfig()?.paths || []).map((path: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={path}
                        onChange={(e) => updatePathInPush(index, e.target.value)}
                        placeholder="e.g., src/**, lib/**, !src/docs/**"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs"
                      />
                      <button
                        onClick={() => removePathFromPush(index)}
                        className="text-zinc-400 hover:text-red-400 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addPathToPush}
                    className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1 transition"
                  >
                    <Plus size={14} />
                    Add Path Pattern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pull Request Event Configuration */}
          {getPullRequestConfig() && (
            <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-3">
              <h4 className="text-sm font-semibold text-white">Pull Request Event</h4>

              {/* Branches */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Run on Branches
                </label>
                <div className="space-y-2">
                  {(getPullRequestConfig()?.branches || []).map((branch: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => updateBranchInPullRequest(index, e.target.value)}
                        placeholder="e.g., main, develop"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs"
                      />
                      <button
                        onClick={() => removeBranchFromPullRequest(index)}
                        className="text-zinc-400 hover:text-red-400 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Event Configuration */}
          {getScheduleConfig() && (
            <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-3">
              <h4 className="text-sm font-semibold text-white">Schedule Events</h4>

              <div className="space-y-2">
                {getScheduleConfig()!.map((schedule: ScheduleTrigger, index: number) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={schedule.cron}
                      onChange={(e) => updateCronSchedule(index, e.target.value)}
                      placeholder="e.g., 0 0 * * 0 (weekly on Sunday)"
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs font-mono"
                    />
                    <button
                      onClick={() => removeCronSchedule(index)}
                      className="text-zinc-400 hover:text-red-400 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addCronSchedule}
                  className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1 transition"
                >
                  <Plus size={14} />
                  Add Schedule
                </button>
              </div>
              <p className="text-xs text-zinc-500">
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

          {/* Workflow Dispatch Info */}
          {isEventEnabled('workflow_dispatch') && (
            <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm">
              <p className="font-medium text-zinc-300">Manual Trigger</p>
              <p className="text-xs text-zinc-400 mt-1">
                This workflow can be triggered manually from GitHub.
              </p>
            </div>
          )}

          {/* Release Info */}
          {isEventEnabled('release') && (
            <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm">
              <p className="font-medium text-zinc-300">Release Event</p>
              <p className="text-xs text-zinc-400 mt-1">
                This workflow runs when a release is published.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
