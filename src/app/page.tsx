'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, onboardingComplete } = useApp();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/onboarding');
    } else if (!onboardingComplete) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  }, [isAuthenticated, onboardingComplete, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-xl font-semibold">Loading DreamPath...</div>
    </div>
  );
}
