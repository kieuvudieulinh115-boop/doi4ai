import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthState, LoginCredentials, RegisterData } from '../types';
import { authService } from './authService';

interface AuthContextType {
  user: AuthUser | null;
  authState: AuthState;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginAsGuest: (role?: 'student' | 'teacher') => void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; className?: string }) => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_STUDENT_USER: AuthUser = {
  id: 'student-demo',
  name: 'Nguyễn Văn An (Học sinh)',
  email: 'hocsinh@thcs.edu.vn',
  role: 'student',
  className: 'Lớp 7A1',
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Real token check: if token exists, verify with backend; otherwise strictly 'unauthenticated'
  const [authState, setAuthState] = useState<AuthState>(() => {
    return authService.getToken() ? 'loading' : 'unauthenticated';
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshSession = useCallback(async () => {
    const existingToken = authService.getToken();
    if (!existingToken) {
      setUser(null);
      setAuthState('unauthenticated');
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setAuthState('authenticated');
      } else {
        authService.clearToken();
        setUser(null);
        setAuthState('unauthenticated');
      }
    } catch {
      authService.clearToken();
      setUser(null);
      setAuthState('unauthenticated');
    }
  }, []);

  // Initial session check on mount
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      setAuthState('authenticated');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại.');
      throw err;
    }
  };

  const loginAsGuest = (role: 'student' | 'teacher' = 'student') => {
    setError(null);
    const guestUser: AuthUser = role === 'teacher' ? {
      id: 'teacher-demo',
      name: 'Cô Hoàng Mai (Giáo viên)',
      email: 'giaovien@thcs.edu.vn',
      role: 'teacher',
      className: 'Tổ Ngữ Văn THCS',
      createdAt: new Date().toISOString()
    } : {
      id: 'student-demo',
      name: 'Nguyễn Văn An (Học sinh)',
      email: 'hocsinh@thcs.edu.vn',
      role: 'student',
      className: 'Lớp 7A1',
      createdAt: new Date().toISOString()
    };

    setUser(guestUser);
    setAuthState('authenticated');
  };

  const register = async (data: RegisterData) => {
    setError(null);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      setAuthState('authenticated');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại.');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setAuthState('unauthenticated');
    }
  };

  const updateProfile = async (updates: { name?: string; className?: string }) => {
    try {
      const updated = await authService.updateProfile(updates);
      setUser(updated);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật thông tin.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authState,
        error,
        login,
        loginAsGuest,
        register,
        logout,
        updateProfile,
        clearError,
        refreshSession,
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
