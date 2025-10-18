'use client';

import { 
  GitBranch, 
  Download, 
  Settings, 
  Hammer, 
  TestTube, 
  Rocket, 
  Code 
} from 'lucide-react';
import { NodeType } from '../types';

const nodeTemplates = [
  { type: 'trigger' as NodeType, label: 'Trigger', icon: GitBranch, color: 'bg-blue-600' },
  { type: 'checkout' as NodeType, label: 'Checkout', icon: Download, color: 'bg-green-600' },
  { type: 'setup' as NodeType, label: 'Setup', icon: Settings, color: 'bg-purple-600' },
  { type: 'build' as NodeType, label: 'Build', icon: Hammer, color: 'bg-orange-600' },
  { type: 'test' as NodeType, label: 'Test', icon: TestTube, color: 'bg-yellow-600' },
  { type: 'deploy' as NodeType, label: 'Deploy', icon: Rocket, color: 'bg-red-600' },
  { type: 'custom' as NodeType, label: 'Custom', icon: Code, color: 'bg-zinc-600' },
];

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Node Palette</h3>
      <div className="space-y-2">
        {nodeTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <div
              key={template.type}
              draggable
              onDragStart={(e) => onDragStart(e, template.type)}
              onClick={() => onAddNode(template.type)}
              className={`
                ${template.color} 
                border border-white/20 rounded px-3 py-2 
                cursor-grab active:cursor-grabbing
                flex items-center gap-2
                hover:scale-105 transition-transform
                text-white text-sm font-medium
              `}
            >
              <Icon size={16} />
              {template.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
