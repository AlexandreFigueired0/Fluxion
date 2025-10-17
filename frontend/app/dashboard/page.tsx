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

export default function DashboardPage() {
  const { credits, userName, loading, isLoading, userId, apiKeyName, apiKeyPrefix, refetchApiKey } = useDashboardData();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRevokeApiKey = () => {
    // TODO: Implement API key revocation
    console.log('Revoke API key');
  };

  const handleGenerateApiKey = async (name: string) => {
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
          <ApiKeyCard 
            apiKeyName={apiKeyName}
            apiKeyPrefix={apiKeyPrefix}
            justCreatedKey={justCreatedKey}
            isGenerating={isGenerating}
            onRevoke={handleRevokeApiKey}
            onGenerate={handleGenerateApiKey}
          />
        </div>

        <QuickStart apiKey={apiKeyPrefix} />

      </div>
    </DashboardLayout>
  );
}