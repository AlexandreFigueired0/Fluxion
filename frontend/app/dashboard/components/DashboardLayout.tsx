import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function DashboardLayout({ children, showSidebar = true }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-20" />

      <div className="relative z-10 flex">
        {showSidebar && <Sidebar />}
        
        <div className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
