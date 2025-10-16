interface Usage {
  id: number;
  endpoint: string;
  timestamp: string;
}

interface UsageHistoryProps {
  usageHistory: Usage[];
}

export default function UsageHistory({ usageHistory }: UsageHistoryProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold">Recent Usage</h2>
      </div>
      
      <div className="divide-y divide-zinc-800">
        {usageHistory.map((usage) => (
          <div 
            key={usage.id} 
            className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                usage.endpoint === 'generate' ? 'bg-orange-500' : 'bg-zinc-500'
              }`} />
              <span className="font-mono text-sm">fluxion {usage.endpoint}</span>
            </div>
            <span className="text-sm text-zinc-400">{usage.timestamp}</span>
          </div>
        ))}
      </div>
      
      {usageHistory.length === 0 && (
        <div className="px-6 py-12 text-center text-zinc-500">
          No usage yet. Run your first command to see it here.
        </div>
      )}
    </div>
  );
}
