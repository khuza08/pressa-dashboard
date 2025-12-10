'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string; // Path to redirect to if not authenticated (default: '/signin')
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/signin' 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user is not authenticated and not loading, redirect to sign-in
    // Check if current path is NOT a public route
    const publicRoutes = ['/signin', '/signup', '/reset-password', '/forgot-password'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push(fallbackPath);
    }
  }, [isAuthenticated, loading, router, pathname, fallbackPath]);

  // Show nothing while checking authentication status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated and trying to access protected route, don't render children
  if (!isAuthenticated && pathname !== '/signin') {
    // The redirect happens in useEffect, but we return null to prevent rendering
    return null;
  }

  // If authenticated or on sign-in page, render children
  return <>{children}</>;
};

export default ProtectedRoute;