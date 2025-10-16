export default function LoadingState() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading dashboard...</p>
      </div>
    </div>
  );
}
