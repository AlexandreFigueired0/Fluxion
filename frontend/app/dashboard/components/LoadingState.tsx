export default function LoadingState() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative">
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div className="h-full bg-orange-600 animate-loading-bar" />
      </div>
    </div>
  );
}
