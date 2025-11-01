import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserData {
  subscription_credits: number;
  permanent_credits: number;
  name: string;
  email: string;
  subscription_plan_id: string;
  subscription_period_end: string;
}

export function useDashboardData() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionCredits, setSubscriptionCredits] = useState(0);
  const [subscriptionPlanId, setSubscriptionPlanId] = useState('');
  const [subscriptionPeriodEnd, setSubscriptionPeriodEnd] = useState('');
  const [permanentCredits, setPermanentCredits] = useState(0);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const lastFetchKeyRef = useRef<string>('');

  const fetchUserData = useCallback(async (id: string, token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      // If fail redirect to login page with error message
      if (!response.ok) {
        router.push('/login?error=failed_to_fetch_user_data');
        return;
      }
      const data: UserData = await response.json();
      setSubscriptionCredits(data.subscription_credits);
      setSubscriptionPlanId(data.subscription_plan_id);
      setSubscriptionPeriodEnd(data.subscription_period_end);
      setPermanentCredits(data.permanent_credits);
      setUserName(data.name);
      setEmail(data.email);
    } catch (error) {
      console.error('Error fetching user data:', error);
      lastFetchKeyRef.current = '';
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const token = session?.accessToken;
    const currentUserId = session?.user?.id;

    if (status !== 'authenticated' || !token || !currentUserId) {
      return;
    }

    setUserId(currentUserId);

    const fetchKey = `${currentUserId}:${token}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    fetchUserData(currentUserId, token);
  }, [router, status, session?.accessToken, session?.user?.id, fetchUserData]);

  return {
    userId,
    email,
    subscriptionCredits,
    permanentCredits,
    subscriptionPlanId,
    subscriptionPeriodEnd,
    userName,
    loading,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}
