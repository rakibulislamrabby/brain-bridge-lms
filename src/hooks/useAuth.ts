import { useMutation } from '@tanstack/react-query';
import { RegisterRequest, LoginRequest, AuthResponse, AuthError } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || 'http://192.168.1.108:8000/api/';

// API functions
const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Registration failed');
  }

  return result;
};

const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Login failed');
  }

  return result;
};

// Custom hooks
export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      // Store token in localStorage if available (client-side only)
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Also set cookie for middleware
        document.cookie = `token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store token in localStorage if available (client-side only)
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set cookie for middleware with proper attributes
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        document.cookie = `token=${data.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        
        console.log('Token stored and cookie set:', data.access_token);
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

// Utility functions
export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Also clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};
