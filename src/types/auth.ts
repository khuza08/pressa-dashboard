// types/auth.ts

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminResponse {
  message: string;
  success: boolean;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface LoginResponse extends AdminResponse {
  user?: AdminUser;
}

export interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}