// admin_dashboard/src/components/LoginGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginGuard({ children }: { children: React.ReactNode }) {
  const { loading, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authenticated) {
      // Redirect to dashboard if already logged in
      router.replace('/');
    }
  }, [loading, authenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
    );
  }

  if (authenticated) {
    return null; // Will be redirected by useEffect
  }

  return <>{children}</>;
}