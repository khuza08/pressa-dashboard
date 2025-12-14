// services/authService.ts
import { LoginResponse, AdminUser } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Login admin user
 */
export const loginAdmin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies for JWT
      body: JSON.stringify({ email, password }),
    });

    let data;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If response is not JSON, create a generic error response
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Login failed');
    }

    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    // Re-throw as a more descriptive error
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
};

/**
 * Logout admin user
 */
export const logoutAdmin = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Important: include cookies for JWT
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Logout failed');
      }
    } else if (!response.ok) {
      // If not JSON and not ok, throw a generic error
      throw new Error(`Logout failed: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('Logout error:', error);
    // Re-throw as a more descriptive error
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
};

/**
 * Check if admin is authenticated
 * This function makes a request to a protected endpoint to verify the token
 */
export const checkAuthStatus = async (): Promise<AdminUser | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      method: 'GET',
      credentials: 'include', // Include JWT cookie
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (response.ok) {
        // Return the admin data from the response
        // This might vary based on your backend implementation
        return data.admin || {
          id: data.admin_id || 0,
          email: data.admin_email,
          name: data.admin_email?.split('@')[0] || 'Admin User',
          role: data.admin_role || 'admin'
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Auth status check error:', error);
    return null;
  }
};