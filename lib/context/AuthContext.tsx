'use client';

import { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import apiClient from '../services/api';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (mobileNumber: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('userSession');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (mobileNumber: string, password: string, role: string) => {
      try {
        const response = await apiClient.post('/auth/login', {
          mobileNumber,
          password,
          role,
        });

        const { user: userData, tokens } = response.data.data;

        setUser(userData);
        localStorage.setItem('userSession', JSON.stringify(userData));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('userRole', userData.role);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed. Please try again.';
        throw new Error(message);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('userSession');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');

    // Optionally call logout endpoint to invalidate token on server
    // apiClient.post('/auth/logout').catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
