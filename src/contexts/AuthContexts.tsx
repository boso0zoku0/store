// contexts/AuthContext.tsx
import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import api, {
  fetchUserData,
  clearTokens,
  isAuthenticated as checkAuth,
  logout as apiLogout
} from '../utils/auth';
import type {User} from "../interfaces/user.tsx";


// Типы для контекста
interface AuthContextType {
  isAuthenticated: boolean;      // статус авторизации
  user: User | null;              // данные пользователя
  isLoading: boolean;             // загрузка
  login: (userData: User) => void;    // вход
  logout: () => Promise<void>;    // выход
  updateUser: (userData: Partial<User>) => void;  // обновление данных
  user_role: string;
  isAuth: boolean
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const initAuth = async () => {
      const hasToken = checkAuth();
      if (hasToken) {
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.warn('⚠️ Token exists but user data fetch failed');
          clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await apiLogout();  // очищает токены
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({...user, ...userData});
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    updateUser,

  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};