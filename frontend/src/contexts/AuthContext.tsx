"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, getAuthToken, removeAuthToken } from '../lib/api';

interface User {
  id: number;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            removeAuthToken();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          removeAuthToken();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { loginUser } = await import('../lib/api');
    await loginUser(email, password);
    const userData = await getCurrentUser();
    if (userData) {
      setUser(userData);
    }
  };

  const register = async (email: string, password: string) => {
    const { registerUser } = await import('../lib/api');
    await registerUser(email, password);
    const userData = await getCurrentUser();
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
