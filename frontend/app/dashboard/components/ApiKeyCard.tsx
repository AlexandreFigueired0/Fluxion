import { useState } from 'react';
import { Copy, Check, Key } from 'lucide-react';

interface ApiKeyCardProps {
  apiKeyName: string;
  apiKeyPrefix: string;
  justCreatedKey?: string | null;
  isGenerating?: boolean;
  onRevoke?: () => void;
  onGenerate?: (name: string) => void;
}

export default function ApiKeyCard({ apiKeyName, apiKeyPrefix, justCreatedKey, isGenerating, onRevoke, onGenerate }: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Show the full key only if justCreatedKey is set
  const displayKey = (typeof justCreatedKey === 'string' && justCreatedKey.length > 0) ? justCreatedKey : apiKeyPrefix;

  const handleCopy = () => {
    navigator.clipboard.writeText(justCreatedKey!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateClick = () => {
    if (onGenerate && keyName.trim()) {
      onGenerate(keyName);
      setKeyName('');
      setShowNameInput(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
          <Key className="text-orange-500" size={20} />
        </div>
        {apiKeyName && onRevoke && (
          <button 
            onClick={onRevoke}
            className="text-sm text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Revoke
          </button>
        )}
      </div>
      <div className="text-sm font-semibold mb-2">Your API Key</div>
      
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-6 w-6 text-orange-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-orange-500 font-semibold">Generating API Key...</span>
        </div>
      ) : apiKeyName ? (
        <>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-zinc-300 truncate">
              {displayKey}{justCreatedKey ? '' : '...'}
            </code>
            {justCreatedKey && (
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
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            {justCreatedKey ? (
              <>This is your new API key. Please copy and store it securely. You will not be able to see it again!</>
            ) : (
              <>Keep this secret. Don&apos;t commit it to git.</>
            )}
          </p>
        </>
      ) : (
        <div className="text-center py-6 text-zinc-500">
          <p className="mb-4">No API key found</p>
          {onGenerate && !showNameInput && (
            <button 
              onClick={() => setShowNameInput(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition text-white cursor-pointer"
            >
              Generate API Key
            </button>
          )}
          {onGenerate && showNameInput && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter a name for this API key (e.g., 'Production', 'Testing')"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateClick()}
              />
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={handleGenerateClick}
                  disabled={!keyName.trim()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition text-white cursor-pointer"
                >
                  Generate
                </button>
                <button 
                  onClick={() => {
                    setShowNameInput(false);
                    setKeyName('');
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded transition text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
