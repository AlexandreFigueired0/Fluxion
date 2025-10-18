'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Job } from '../types';
import { Zap, Settings } from 'lucide-react';

interface JobNodeData {
  job: Job;
  isSelected: boolean;
}

/**
 * JobNode represents a single job on the pipeline canvas.
 * It's a container showing:
 * - Job name
 * - Runner (runs-on)
 * - Number of steps
 * - Quick indicators (matrix, timeout, environment)
 */
export function JobNode({ data, selected }: NodeProps<JobNodeData>) {
  const { job, isSelected } = data;

  // Determine if job has matrix strategy
  const hasMatrix = job.strategy && Object.values(job.strategy).some((v) => v && v.length > 0);

  // Determine color based on job state
  const baseColor = selected || isSelected ? 'bg-orange-600 border-orange-500' : 'bg-zinc-700 border-zinc-600';

  return (
    <div
      className={`
        ${baseColor}
        border-2 rounded-lg px-4 py-3 min-w-[240px]
        transition-all duration-200 shadow-lg
        ${selected || isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''}
      `}
    >
      {/* Input Handle (for job dependencies) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-white !w-3 !h-3 !border-2 !border-zinc-900"
      />

      {/* Job Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{job.name}</h3>
          <p className="text-white/60 text-xs mt-0.5">{job.runsOn}</p>
        </div>

        {/* Quick indicators */}
        <div className="flex gap-1 flex-shrink-0">
          {hasMatrix && (
            <div
              className="bg-blue-500/30 rounded px-1.5 py-0.5"
              title="Matrix strategy enabled"
            >
              <Zap size={12} className="text-blue-300" />
            </div>
          )}
          {job.timeout && (
            <div
              className="bg-purple-500/30 rounded px-1.5 py-0.5"
              title={`${job.timeout} min timeout`}
            >
              <span className="text-xs text-purple-300">{job.timeout}m</span>
            </div>
          )}
        </div>
      </div>

      {/* Steps Preview */}
      <div className="bg-white/10 rounded px-2 py-1.5 mb-2">
        <p className="text-white/70 text-xs font-medium">
          {job.steps.length} step{job.steps.length !== 1 ? 's' : ''}
        </p>
        {job.steps.length > 0 && (
          <div className="mt-1 space-y-1">
            {job.steps.slice(0, 2).map((step, idx) => (
              <div key={idx} className="text-white/50 text-xs truncate">
                • {step.name || step.uses?.split('@')[0] || step.run?.split(' ')[0] || 'Step'}
              </div>
            ))}
            {job.steps.length > 2 && (
              <div className="text-white/40 text-xs">
                + {job.steps.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Environment Indicator */}
      {job.environment && (
        <div className="flex items-center gap-1 text-xs text-white/60 mb-2">
          <Settings size={12} />
          <span>{job.environment}</span>
        </div>
      )}

      {/* Output Handle (for dependent jobs) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-white !w-3 !h-3 !border-2 !border-zinc-900"
      />
    </div>
  );
}
