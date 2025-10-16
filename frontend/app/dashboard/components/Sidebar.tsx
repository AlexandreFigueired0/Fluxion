'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Workflow, 
  Sparkles, 
  Bug, 
  Settings,
  ChevronDown,
  ChevronRight,
  FileCode,
  Zap
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

export default function Sidebar({ isOpen = true }: SidebarProps) {
  const pathname = usePathname();
  const [generateExpanded, setGenerateExpanded] = useState(false);
  const [debugExpanded, setDebugExpanded] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Pipeline Builder',
      href: '/dashboard/pipeline-builder',
      icon: Workflow,
    },
  ];

  const generateOptions = [
    { name: 'New Workflow', href: '/dashboard/generate/new', icon: Sparkles },
    { name: 'Templates', href: '/dashboard/generate/templates', icon: FileCode },
    { name: 'History', href: '/dashboard/generate/history', icon: Workflow },
  ];

  const debugOptions = [
    { name: 'Debug Session', href: '/dashboard/debug/session', icon: Bug },
    { name: 'Quick Debug', href: '/dashboard/debug/quick', icon: Zap },
    { name: 'Debug History', href: '/dashboard/debug/history', icon: FileCode },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden z-20`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-black text-sm">
              FX
            </div>
            <span className="text-xl font-bold">FLUXION</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {/* Main Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-orange-600 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="py-3">
              <div className="border-t border-zinc-800" />
            </div>

            {/* Generate Section */}
            <div>
              <button
                onClick={() => setGenerateExpanded(!generateExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={20} />
                  <span className="font-medium">Generate</span>
                </div>
                {generateExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {/* Generate Sub-items */}
              {generateExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {generateOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Link
                        key={option.href}
                        href={option.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive(option.href)
                            ? 'bg-orange-600/20 text-orange-400'
                            : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{option.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Debug Section */}
            <div>
              <button
                onClick={() => setDebugExpanded(!debugExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <Bug size={20} />
                  <span className="font-medium">Debug</span>
                </div>
                {debugExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {/* Debug Sub-items */}
              {debugExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {debugOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Link
                        key={option.href}
                        href={option.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive(option.href)
                            ? 'bg-orange-600/20 text-orange-400'
                            : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{option.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="py-3">
              <div className="border-t border-zinc-800" />
            </div>

            {/* Settings */}
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive('/dashboard/settings')
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </nav>

        {/* Footer - User Info or Credits */}
        <div className="px-3 py-4 border-t border-zinc-800">
          <div className="px-3 py-2 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 mb-1">Quick Links</div>
            <a
              href="https://docs.fluxion.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-400 hover:text-orange-300 transition"
            >
              Documentation →
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
