'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div className="flex justify-center items-center h-screen">Redirecting to login...</div> 
}) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/(full-width-pages)/auth'); // Redirect to login page
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return fallback;
  }

  return <>{children}</>;
};

export default ProtectedRoute;