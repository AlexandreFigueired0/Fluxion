import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      setUserId(session.user.id);
      fetchUserData(session.user.id);
    }
  }, [status, session, router]);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const data: UserData = await response.json();
      setSubscriptionCredits(data.subscription_credits);
      setSubscriptionPlanId(data.subscription_plan_id);
      setSubscriptionPeriodEnd(data.subscription_period_end);
      setPermanentCredits(data.permanent_credits);
      setUserName(data.name);
      setEmail(data.email);
      setUserId(userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

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
