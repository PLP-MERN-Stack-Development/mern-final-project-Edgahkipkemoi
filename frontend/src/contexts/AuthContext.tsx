import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { AuthUser, LoginCredentials, RegisterData } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const queryClient = useQueryClient();

  // Query to get current user
  const { data: userData, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await authAPI.getMe();
        return (response.data as any).user;
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user state when query data changes
  useEffect(() => {
    setUser(userData || null);
  }, [userData]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { accessToken, user: loggedInUser } = response.data as any;
        
        // Store token in localStorage as fallback
        localStorage.setItem('accessToken', accessToken);
        
        // Update user state
        setUser(loggedInUser);
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        
        toast.success('Login successful!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      
      if (response.success) {
        const { accessToken, user: registeredUser } = response.data as any;
        
        // Store token in localStorage as fallback
        localStorage.setItem('accessToken', accessToken);
        
        // Update user state
        setUser(registeredUser);
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        
        toast.success('Registration successful! Welcome to FitTrack!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state and storage
      setUser(null);
      localStorage.removeItem('accessToken');
      
      // Clear all queries
      queryClient.clear();
      
      toast.success('Logged out successfully');
    }
  };

  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout all API call failed:', error);
    } finally {
      // Clear local state and storage
      setUser(null);
      localStorage.removeItem('accessToken');
      
      // Clear all queries
      queryClient.clear();
      
      toast.success('Logged out from all devices');
    }
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    // Update the query cache
    queryClient.setQueryData(['auth', 'me'], { user: updatedUser });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutAll,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};