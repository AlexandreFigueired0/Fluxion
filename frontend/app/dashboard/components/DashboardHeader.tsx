interface DashboardHeaderProps {
  userName: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-black mb-2">Welcome, {userName}!</h1>
      <p className="text-zinc-400">Manage your API keys and view usage</p>
    </div>
  );
}
