import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, TOKEN_STORAGE_KEY } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on initial mount / refresh
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        authService.clearSession();
      }
    } catch (err) {
      console.warn('Session restoration failed:', err.message);
      setUser(null);
      setIsAuthenticated(false);
      authService.clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Listen for session expiry event from apiClient
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setError('Your session has expired. Please sign in again.');
    };

    window.addEventListener('nova:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('nova:auth-expired', handleAuthExpired);
  }, []);

  // Login action
  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(username, password);
      const authenticatedUser = data.user || (await authService.getCurrentUser());
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      let message = 'Unable to sign in. Please verify your credentials.';
      if (err.isNetworkError) {
        message = 'Unable to connect to the server. Please try again.';
      } else if (err.status === 401 || err.status === 400) {
        message = err.message || 'Invalid username or password.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      setIsAuthenticated(false);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout action
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  // Role checking helpers
  const systemRole = user?.system_role || user?.systemRole || 'EMPLOYEE';

  const hasRole = useCallback((roleOrRoles) => {
    if (!user) return false;
    const current = user?.system_role || user?.systemRole || 'EMPLOYEE';
    if (Array.isArray(roleOrRoles)) {
      return roleOrRoles.includes(current);
    }
    return current === roleOrRoles;
  }, [user]);

  const isEmployee = hasRole('EMPLOYEE');
  const isHRManager = hasRole('HR_MANAGER');
  const isAdmin = hasRole('ADMIN');
  const isHROrAdmin = hasRole(['HR_MANAGER', 'ADMIN']);

  const value = {
    user,
    systemRole,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    changePassword,
    restoreSession,
    clearError,
    hasRole,
    isEmployee,
    isHRManager,
    isAdmin,
    isHROrAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
