import { useState } from 'react';
import { Copy, Check, Key } from 'lucide-react';

interface ApiKeyCardProps {
  apiKey: string;
  onRevoke?: () => void;
  onGenerate?: () => void;
}

export default function ApiKeyCard({ apiKey, onRevoke, onGenerate }: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
          <Key className="text-orange-500" size={20} />
        </div>
        {apiKey && onRevoke && (
          <button 
            onClick={onRevoke}
            className="text-sm text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Revoke
          </button>
        )}
      </div>
      <div className="text-sm font-semibold mb-2">Your API Key</div>
      
      {apiKey ? (
        <>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-zinc-300 truncate">
              {apiKey}*********************
            </code>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition flex items-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-xs text-zinc-500 mt-3">
            Keep this secret. Don&apos;t commit it to git.
          </p>
        </>
      ) : (
        <div className="text-center py-6 text-zinc-500">
          <p className="mb-4">No API key found</p>
          {onGenerate && (
            <button 
              onClick={onGenerate}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition text-white cursor-pointer"
            >
              Generate API Key
            </button>
          )}
        </div>
      )}
    </div>
  );
}
