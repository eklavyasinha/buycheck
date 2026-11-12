import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../services/api.js';

interface User {
  id: string;
  name: string;
  email: string;
  preferences?: {
    theme?: 'dark' | 'light';
    defaultCurrency?: string;
    strictMode?: boolean;
  };
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  startGuestMode: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('buycheck_token'));
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem('buycheck_is_guest') === 'true');
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('buycheck_token');
      const guestFlag = localStorage.getItem('buycheck_is_guest') === 'true';

      if (storedToken || guestFlag) {
        const data = await AuthAPI.getMe();
        if (data.user) {
          setUser(data.user);
          setIsGuest(Boolean(data.user.isGuest));
        }
      }
    } catch (err) {
      console.warn('Session refresh check:', err);
      // If error occurs, keep guest mode if set
      if (localStorage.getItem('buycheck_is_guest') === 'true') {
        setUser({
          id: 'guest-demo-user-id',
          name: 'Guest Explorer',
          email: 'guest@buycheck.local',
          isGuest: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('buycheck_token', newToken);
    localStorage.removeItem('buycheck_is_guest');
    setToken(newToken);
    setUser(newUser);
    setIsGuest(false);
  };

  const logout = () => {
    localStorage.removeItem('buycheck_token');
    localStorage.removeItem('buycheck_is_guest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const startGuestMode = async () => {
    setLoading(true);
    try {
      const data = await AuthAPI.startGuestSession();
      localStorage.setItem('buycheck_token', data.token);
      localStorage.setItem('buycheck_is_guest', 'true');
      setToken(data.token);
      setUser(data.user);
      setIsGuest(true);
    } catch {
      // Offline fallback
      localStorage.setItem('buycheck_is_guest', 'true');
      setUser({
        id: 'guest-demo-user-id',
        name: 'Guest Explorer',
        email: 'guest@buycheck.local',
        isGuest: true,
      });
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isGuest,
        login,
        logout,
        startGuestMode,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
