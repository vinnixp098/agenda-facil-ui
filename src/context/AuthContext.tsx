import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { IAuthUser } from '../types';

interface AuthContextType {
  user: IAuthUser | null;
  login: (user: IAuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IAuthUser | null>(() => {
    const stored = localStorage.getItem('lumien_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('lumien_user', JSON.stringify(user));
      localStorage.setItem('lumien_token', user.token);
    } else {
      localStorage.removeItem('lumien_user');
      localStorage.removeItem('lumien_token');
    }
  }, [user]);

  function login(u: IAuthUser) { setUser(u); }
  function logout() { setUser(null); }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
