import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserData {
  credits: number;
  name: string;
}

export function useDashboardData() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyPrefix, setApiKeyPrefix] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchUserData(session.user.id);
      fetchApiKey(session.user.id);
    }
  }, [status, session, router]);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const data: UserData = await response.json();
      setCredits(data.credits);
      setUserName(data.name);
      setUserId(userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKey = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/apikey`);
      if (!response.ok) throw new Error('Failed to fetch API key');
      
      const data = await response.json();
      setApiKeyName(data.name);
      setApiKeyPrefix(data.key_prefix);
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  }

  return {
    userId,
    credits,
    userName,
    loading,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}
