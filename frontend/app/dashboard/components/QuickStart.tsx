import { Terminal } from 'lucide-react';

interface QuickStartProps {
  apiKey?: string;
}

export default function QuickStart({ apiKey }: QuickStartProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-12">
      <div className="flex items-center gap-3 mb-4">
        <Terminal className="text-orange-500" size={24} />
        <h2 className="text-2xl font-bold">Quick Start</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-zinc-400 mb-2">1. Install Fluxion</p>
          <code className="block px-4 py-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-orange-400">
            brew install fluxion
          </code>
        </div>
        
        <div>
          <p className="text-sm text-zinc-400 mb-2">2. Set your API key</p>
          <code className="block px-4 py-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-orange-400">
            fluxion config set {apiKey || 'YOUR_API_KEY'}
          </code>
        </div>
        
        <div>
          <p className="text-sm text-zinc-400 mb-2">3. Generate your first workflow</p>
          <code className="block px-4 py-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-orange-400">
            fluxion generate &quot;build and test my app&quot;
          </code>
        </div>
      </div>
    </div>
  );
}
