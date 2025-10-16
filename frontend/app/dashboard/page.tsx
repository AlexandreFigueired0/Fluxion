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
  const { credits, userName, loading, isLoading, userId } = useDashboardData();
  const [apiKey] = useState('');

  const handleRevokeApiKey = () => {
    // TODO: Implement API key revocation
    console.log('Revoke API key');
  };

  const handleGenerateApiKey = (name: string) => {
    // Send request to backend to generate a new API key with a name
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/apikey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    .then(res => {
      if (res.ok) {
        // Optionally refresh the page or update state
        window.location.reload();
      }
    })
    .catch(err => console.error('Error generating API key:', err));
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
            apiKey={apiKey} 
            onRevoke={handleRevokeApiKey}
            onGenerate={handleGenerateApiKey}
          />
        </div>

        <QuickStart apiKey={apiKey} />

      </div>
    </DashboardLayout>
  );
}