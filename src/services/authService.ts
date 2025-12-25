// services/authService.ts
import { LoginResponse, AdminUser } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Login admin user
 */
export const loginAdmin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/admin/logout`, {
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
    // Add a small delay to ensure cookie is set before checking
    await new Promise(resolve => setTimeout(resolve, 300));

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
        // The backend /api/admin/dashboard returns: { message: "...", admin: email }
        if (data.message && typeof data.admin === 'string') {
          // Format: { message: "Welcome...", admin: "email@domain.com" }
          return {
            id: 0, // We don't get ID from this endpoint, will get on later calls if needed
            email: data.admin,
            name: data.admin?.split('@')[0] || 'Admin User',
            role: 'admin' // Default role, will be updated later if needed
          };
        } else if (data.id && data.email) {
          // Alternative format if the backend changes
          return {
            id: data.id || 0,
            email: data.email,
            name: data.name || data.email?.split('@')[0] || 'Admin User',
            role: data.role || 'admin'
          };
        } else {
          // Fallback - try to get from any admin field
          return {
            id: data.admin_id || data.id || 0,
            email: data.admin_email || data.email || data.admin,
            name: data.admin_email?.split('@')[0] || data.name || data.admin?.split('@')[0] || 'Admin User',
            role: data.admin_role || data.role || 'admin'
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Auth status check error:', error);
    return null;
  }
};