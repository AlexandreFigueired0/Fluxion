'use client';

import { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import ApiKeyCard from '../components/ApiKeyCard';
import {
  DashboardLayout,
  DashboardNav,
  LoadingState,
} from '../components';
import { Settings as SettingsIcon, Key, Bell, User, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const { userName, email, credits, loading, isLoading, userId, apiKeyName, apiKeyPrefix, refetchApiKey } = useDashboardData();
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevokeApiKey = async (name: string) => {
    if (!userId) return;
    setIsRevoking(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/apikey`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to revoke API key');
      setJustCreatedKey(null);
      await refetchApiKey();
    } catch (err) {
      console.error('Error revoking API key:', err);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleGenerateApiKey = async (name: string) => {
    if (!userId) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/apikey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to generate API key');
      const data = await res.json();
      setJustCreatedKey(data.key);
      await refetchApiKey();
    } catch (err) {
      console.error('Error generating API key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || isLoading) {
    return <LoadingState />;
  }

  return (
    <DashboardLayout>
      <DashboardNav />

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="text-orange-500" size={32} />
            <h1 className="text-4xl font-black">Settings</h1>
          </div>
          <p className="text-zinc-400">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-orange-500" size={20} />
              <h2 className="text-xl font-bold">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  readOnly
                  type="text"
                  defaultValue={userName}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  readOnly
                  type="email"
                  defaultValue={email}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* API Keys */}
          <ApiKeyCard
            apiKeyName={apiKeyName}
            apiKeyPrefix={apiKeyPrefix}
            justCreatedKey={justCreatedKey}
            isGenerating={isGenerating}
            isRevoking={isRevoking}
            onRevoke={handleRevokeApiKey}
            onGenerate={handleGenerateApiKey}
          />

          {/* Billing */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="text-orange-500" size={20} />
              <h2 className="text-xl font-bold">Billing & Credits</h2>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-zinc-400">Current Balance</p>
                <p className="text-2xl font-bold">{credits} Credits</p>
              </div>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-white font-semibold cursor-pointer">
                Buy More Credits
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
