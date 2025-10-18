'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NodeData, NodeType } from '../types';

interface NodeConfigPanelProps {
  node: { id: string; data: NodeData } | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
}

export function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
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

  const updateConfig = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const renderConfigFields = () => {
    switch (node.data.type) {
      case 'trigger':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Event</label>
              <select
                value={config.event || 'push'}
                onChange={(e) => updateConfig('event', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              >
                <option value="push">Push</option>
                <option value="pull_request">Pull Request</option>
                <option value="release">Release</option>
                <option value="schedule">Schedule</option>
                <option value="workflow_dispatch">Manual</option>
              </select>
            </div>
            {(config.event === 'push' || config.event === 'pull_request') && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Branches</label>
                <input
                  type="text"
                  value={config.branches || ''}
                  onChange={(e) => updateConfig('branches', e.target.value.split(',').map(b => b.trim()))}
                  placeholder="main, develop"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>
            )}
          </>
        );

      case 'setup':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Language</label>
              <select
                value={config.language || 'node'}
                onChange={(e) => updateConfig('language', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              >
                <option value="node">Node.js</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="java">Java</option>
                <option value="ruby">Ruby</option>
                <option value="rust">Rust</option>
                <option value="dotnet">.NET</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Version</label>
              <input
                type="text"
                value={config.version || ''}
                onChange={(e) => updateConfig('version', e.target.value)}
                placeholder="e.g., 18.x, 3.10"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.cache || false}
                onChange={(e) => updateConfig('cache', e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm text-zinc-300">Enable caching</label>
            </div>
          </>
        );

      case 'build':
      case 'test':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Command</label>
              <input
                type="text"
                value={config.command || ''}
                onChange={(e) => updateConfig('command', e.target.value)}
                placeholder="e.g., npm run build"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Working Directory</label>
              <input
                type="text"
                value={config.workingDirectory || ''}
                onChange={(e) => updateConfig('workingDirectory', e.target.value)}
                placeholder="e.g., ./backend"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>
          </>
        );

      case 'deploy':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Platform</label>
              <select
                value={config.platform || 'custom'}
                onChange={(e) => updateConfig('platform', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              >
                <option value="docker">Docker</option>
                <option value="vercel">Vercel</option>
                <option value="aws">AWS</option>
                <option value="gcp">Google Cloud</option>
                <option value="azure">Azure</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Command</label>
              <input
                type="text"
                value={config.command || ''}
                onChange={(e) => updateConfig('command', e.target.value)}
                placeholder="Deploy command"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Environment</label>
              <input
                type="text"
                value={config.environment || ''}
                onChange={(e) => updateConfig('environment', e.target.value)}
                placeholder="production, staging"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>
          </>
        );

      case 'custom':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Action (uses)</label>
              <input
                type="text"
                value={config.uses || ''}
                onChange={(e) => updateConfig('uses', e.target.value)}
                placeholder="e.g., actions/setup-node@v3"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Run Command</label>
              <textarea
                value={config.run || ''}
                onChange={(e) => updateConfig('run', e.target.value)}
                placeholder="Shell command to run"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                rows={3}
              />
            </div>
          </>
        );

      default:
        return null;
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

        {renderConfigFields()}

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
      </div>
    </div>
  );
}
