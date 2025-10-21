'use client';

import { useState } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { Workflow } from '../types';
import { pipelineToYaml, downloadPipelineYaml } from '../utils/yamlGenerator';

interface YamlPreviewModalProps {
  pipeline: Workflow;
  isOpen: boolean;
  onClose: () => void;
}

export function YamlPreviewModal({ pipeline, isOpen, onClose }: YamlPreviewModalProps) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  if (!isOpen) return null;

  const yaml = pipelineToYaml(pipeline);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">YAML Preview</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* YAML Content */}
        <div className="flex-1 overflow-auto p-6 bg-zinc-950">
          <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap break-words">
            {yaml}
          </pre>
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-900">
          <p className="text-xs text-zinc-500">
            Ready to use in <code className="bg-zinc-800 px-2 py-1 rounded">.github/workflows/main.yml</code>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
              title="Copy to clipboard"
            >
              {copiedToClipboard ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy YAML
                </>
              )}
            </button>

            <button
              onClick={() => {
                downloadPipelineYaml(pipeline);
                onClose();
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
              title="Download as file"
            >
              <Download size={18} />
              Download
            </button>

            <button
              onClick={onClose}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
