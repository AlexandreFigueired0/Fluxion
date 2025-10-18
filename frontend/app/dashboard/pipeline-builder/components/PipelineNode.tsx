'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../types';
import { 
  GitBranch, 
  Download, 
  Settings, 
  Hammer, 
  TestTube, 
  Rocket, 
  Code 
} from 'lucide-react';

const nodeIcons = {
  trigger: GitBranch,
  checkout: Download,
  setup: Settings,
  build: Hammer,
  test: TestTube,
  deploy: Rocket,
  custom: Code,
};

const nodeColors = {
  trigger: 'bg-blue-600 border-blue-500',
  checkout: 'bg-green-600 border-green-500',
  setup: 'bg-purple-600 border-purple-500',
  build: 'bg-orange-600 border-orange-500',
  test: 'bg-yellow-600 border-yellow-500',
  deploy: 'bg-red-600 border-red-500',
  custom: 'bg-zinc-600 border-zinc-500',
};

export function PipelineNode({ data, selected }: NodeProps<NodeData>) {
  const Icon = nodeIcons[data.type];
  const colorClass = nodeColors[data.type];

  return (
    <div
      className={`
        ${colorClass}
        border-2 rounded-lg px-4 py-3 min-w-[180px]
        transition-all duration-200
        ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''}
        shadow-lg
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-white !w-3 !h-3 !border-2 !border-zinc-900"
      />
      
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-white" />
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">
            {data.label}
          </div>
          <div className="text-white/70 text-xs mt-1">
            {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
          </div>
        </div>
      </div>

      {Object.keys(data.config).length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/20">
          <div className="text-white/60 text-xs space-y-1">
            {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="font-semibold">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-white !w-3 !h-3 !border-2 !border-zinc-900"
      />
    </div>
  );
}
