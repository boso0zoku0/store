// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
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
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация при загрузке приложения
  useEffect(() => {
    const initAuth = async () => {
      const hasToken = checkAuth();

      if (hasToken) {
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Токен есть, но пользователь не получен → токен невалидный
          clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Вход
  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Выход
  const logout = async () => {
    await apiLogout();  // очищает токены
    setUser(null);
    setIsAuthenticated(false);
  };

  // Обновление данных пользователя (после редактирования профиля)
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};