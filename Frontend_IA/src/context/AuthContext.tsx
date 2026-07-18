import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { authApi } from '../api/services';
import type { AuthResponse } from '../api/services';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      if (import.meta.env.DEV) console.log('Attempting login with username:', username);
      const response = await authApi.login({ username, password });
      const authData = response.data.data ?? response.data;
      if (import.meta.env.DEV) console.log('Login successful:', authData);
      if (!authData || !authData.token) {
        throw new Error('Réponse d’authentification invalide');
      }
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      setUser(authData);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Login error:', error.response?.status, error.response?.data ?? error.message);
      } else {
        console.error('Login error:', error);
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
