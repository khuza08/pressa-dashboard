'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (code) {
        try {
          // Complete the OAuth flow by exchanging the code for user data
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/v1/auth/google/callback?code=${code}`);
          
          if (response.ok) {
            const result = await response.json();
            console.log('Google login successful:', result);
            
            // Login the user in the frontend
            if (result.user && result.token) {
              login(result.user, result.token);
              // Redirect to dashboard or home page
              router.push('/'); // or wherever you want to redirect after login
            } else {
              console.error('Invalid response format from backend');
              router.push('/signin'); // redirect back to sign in
            }
          } else {
            console.error('Google login failed');
            router.push('/signin'); // redirect back to sign in
          }
        } catch (error) {
          console.error('Error during Google callback:', error);
          router.push('/signin'); // redirect back to sign in
        }
      } else {
        // If there's no code, it might be an error
        const error = searchParams.get('error');
        if (error) {
          console.error('Google OAuth error:', error);
        }
        router.push('/signin'); // redirect back to sign in
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Completing Google authentication...</p>
      </div>
    </div>
  );
}