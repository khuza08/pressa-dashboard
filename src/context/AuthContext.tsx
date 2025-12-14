'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginAdmin, logoutAdmin, checkAuthStatus } from '@/services/authService';
import { AdminUser, AuthContextType } from '@/types/auth';

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await checkAuthStatus();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await loginAdmin(email, password);

      // After successful login, check the auth status to get user details
      const userData = await checkAuthStatus();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // If checkAuthStatus fails after login, that's unexpected
        console.warn('Login successful but could not verify user data');
        // We'll still consider the login successful as the token was set
      }

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      // Make sure to throw the error so the UI can display it
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with cleanup even if API call fails
    } finally {
      // Clear user data regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Context value
  const value = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};