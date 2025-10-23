'use client';

import { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import {
  DashboardLayout,
  DashboardNav,
  DashboardHeader,
  CreditsCard,
  ApiKeyCard,
  QuickStart,
  LoadingState,
} from './components';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { credits, userName, loading, isLoading, userId, apiKeyName, apiKeyPrefix, refetchApiKey } = useDashboardData();
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevokeApiKey = async (name: string) => {
    if (!userId) {
      console.warn('Attempted to revoke API key before userId was available');
      return;
    }
    setIsRevoking(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/apikey`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
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
    if (!userId) {
      console.warn('Attempted to generate API key before userId was available');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/apikey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      <div className="max-w-6xl mx-auto px-8 py-12">
        <DashboardHeader userName={userName} />

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <CreditsCard credits={credits} />
        </div>


      </div>
    </DashboardLayout>
  );
}