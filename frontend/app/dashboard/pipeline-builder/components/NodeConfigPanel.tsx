'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NodeData } from '../types';

interface NodeConfigPanelProps {
  node: { id: string; data: NodeData } | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
  onDelete: (id: string) => void;
}

export function NodeConfigPanel({ node, onClose, onUpdate, onDelete }: NodeConfigPanelProps) {
  const [label, setLabel] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      setLabel(node.data.label);
      setConfig(node.data.config || {});
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    onUpdate(node.id, { label, config });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      onDelete(node.id);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Configure Node</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
          />
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-400">
          Node-specific settings will return once the new logic lands. Use this panel to rename nodes for now.
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded transition"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 rounded transition"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={handleDelete}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition mt-2"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
