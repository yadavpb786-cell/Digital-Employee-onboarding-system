/**
 * NOVA Tech Authentication Service Layer
 * Enterprise JWT authentication service supporting:
 * - Login with username, email, or employee ID
 * - Token storage in localStorage (access + refresh)
 * - Automatic token refresh & rotation
 * - Server-side token blacklisting on logout
 * - Session restoration (/auth/me/)
 * - Dual-mode Mock API adapter strategy (VITE_USE_MOCK_API)
 */

import { apiClient } from './apiClient';
import { mockEmployeeData } from '../data/onboardingData';

export const TOKEN_STORAGE_KEY = 'nova_auth_token';
export const REFRESH_STORAGE_KEY = 'nova_refresh_token';
export const USER_STORAGE_KEY = 'nova_user';

const isMockMode = () => import.meta.env.VITE_USE_MOCK_API === 'true';

export const SYSTEM_ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR_MANAGER: 'HR_MANAGER',
  ADMIN: 'ADMIN',
};

// Mock user templates matching live Django Employee / User structure
const mockUsersByUsername = {
  'rahul.kumar': {
    id: 1,
    username: 'rahul.kumar',
    employee_id: 'EMP-2026-8941',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@novatech.io',
    role: 'Software Engineer',
    system_role: 'EMPLOYEE',
    systemRole: 'EMPLOYEE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  'arjun.mehta': {
    id: 2,
    username: 'arjun.mehta',
    employee_id: 'EMP-2026-0010',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@novatech.io',
    role: 'Engineering Director',
    system_role: 'HR_MANAGER',
    systemRole: 'HR_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  'priya.sharma': {
    id: 3,
    username: 'priya.sharma',
    employee_id: 'EMP-2026-0012',
    name: 'Priya Sharma',
    email: 'priya.sharma@novatech.io',
    role: 'People & Culture Lead',
    system_role: 'ADMIN',
    systemRole: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  }
};

const mockDemoUser = mockUsersByUsername['rahul.kumar'];

// ==============================================================================
// 1. Mock Authentication Adapter
// ==============================================================================
const mockAuthAdapter = {
  async login(username, password) {
    // Artificial latency for realistic UX
    await new Promise((r) => setTimeout(r, 400));

    const normalized = (username || '').trim().toLowerCase();
    let matchedUser = mockDemoUser;

    if (normalized === 'arjun.mehta' || normalized === 'arjun.mehta@novatech.io' || normalized === 'emp-2026-0010') {
      matchedUser = mockUsersByUsername['arjun.mehta'];
    } else if (normalized === 'priya.sharma' || normalized === 'priya.sharma@novatech.io' || normalized === 'emp-2026-0012') {
      matchedUser = mockUsersByUsername['priya.sharma'];
    } else if (
      normalized === 'rahul.kumar' ||
      normalized === 'rahul.kumar@novatech.io' ||
      normalized === 'emp-2026-8941' ||
      normalized === 'demo'
    ) {
      matchedUser = mockUsersByUsername['rahul.kumar'];
    } else if (password !== 'NovaTech@2026') {
      const err = new Error('Invalid username or password.');
      err.status = 401;
      throw err;
    }

    if (password !== 'NovaTech@2026') {
      const err = new Error('Invalid username or password.');
      err.status = 401;
      throw err;
    }

    const mockTokens = {
      access: `mock-jwt-access-token-${matchedUser.username}-2026`,
      refresh: `mock-jwt-refresh-token-${matchedUser.username}-2026`,
      user: { ...matchedUser }
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, mockTokens.access);
    localStorage.setItem(REFRESH_STORAGE_KEY, mockTokens.refresh);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockTokens.user));

    return mockTokens;
  },

  async logout() {
    await new Promise((r) => setTimeout(r, 150));
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return { detail: 'Successfully logged out.' };
  },

  async refreshToken() {
    const refresh = localStorage.getItem(REFRESH_STORAGE_KEY);
    if (!refresh) throw new Error('No refresh token available.');
    const newAccess = 'mock-jwt-refreshed-token-' + Date.now();
    localStorage.setItem(TOKEN_STORAGE_KEY, newAccess);
    return { access: newAccess };
  },

  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback below
      }
    }
    return { ...mockDemoUser };
  },

  async changePassword(currentPassword, newPassword) {
    await new Promise((r) => setTimeout(r, 250));
    if (!currentPassword) {
      const err = new Error('Current password is required.');
      err.status = 400;
      throw err;
    }
    if (!newPassword) {
      const err = new Error('New password is required.');
      err.status = 400;
      throw err;
    }
    if (currentPassword !== 'NovaTech@2026') {
      const err = new Error('Current password is incorrect.');
      err.status = 400;
      throw err;
    }
    if (currentPassword === newPassword) {
      const err = new Error('New password cannot be the same as the current password.');
      err.status = 400;
      throw err;
    }
    if (newPassword.length < 8) {
      const err = new Error('This password is too short. It must contain at least 8 characters.');
      err.status = 400;
      throw err;
    }
    return { success: true, message: 'Password has been changed successfully.' };
  }
};

// ==============================================================================
// 2. Live Django REST API Adapter
// ==============================================================================
const liveAuthAdapter = {
  async login(username, password) {
    const data = await apiClient.post('/auth/login/', {
      username: (username || '').trim(),
      password
    });

    if (data.access) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access);
    }
    if (data.refresh) {
      localStorage.setItem(REFRESH_STORAGE_KEY, data.refresh);
    }
    if (data.user) {
      const normalizedUser = {
        ...data.user,
        system_role: data.user.system_role || data.user.systemRole || 'EMPLOYEE',
        systemRole: data.user.system_role || data.user.systemRole || 'EMPLOYEE'
      };
      data.user = normalizedUser;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    }

    return data;
  },

  async logout() {
    const refresh = localStorage.getItem(REFRESH_STORAGE_KEY);
    try {
      if (refresh) {
        await apiClient.post('/auth/logout/', { refresh });
      }
    } catch (err) {
      console.warn('Backend logout warning:', err.message);
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    return { detail: 'Successfully logged out.' };
  },

  async refreshToken() {
    const refresh = localStorage.getItem(REFRESH_STORAGE_KEY);
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const data = await apiClient.post('/auth/refresh/', { refresh });
    if (data.access) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access);
    }
    if (data.refresh) {
      // Handle token rotation if SimpleJWT rotated the refresh token
      localStorage.setItem(REFRESH_STORAGE_KEY, data.refresh);
    }
    return data;
  },

  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }

    try {
      const data = await apiClient.get('/auth/me/');
      if (data) {
        const normalizedUser = {
          ...data,
          system_role: data.system_role || data.systemRole || 'EMPLOYEE',
          systemRole: data.system_role || data.systemRole || 'EMPLOYEE'
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
        return normalizedUser;
      }
      return data;
    } catch (err) {
      if (err.status === 401) {
        // Try refreshing token once
        try {
          await this.refreshToken();
          const retryData = await apiClient.get('/auth/me/');
          if (retryData) {
            const normalizedUser = {
              ...retryData,
              system_role: retryData.system_role || retryData.systemRole || 'EMPLOYEE',
              systemRole: retryData.system_role || retryData.systemRole || 'EMPLOYEE'
            };
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
            return normalizedUser;
          }
          return retryData;
        } catch (refreshErr) {
          // Token expired and cannot be refreshed
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(REFRESH_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          return null;
        }
      }
      throw err;
    }
  },

  async changePassword(currentPassword, newPassword) {
    const data = await apiClient.post('/auth/change-password/', {
      current_password: currentPassword,
      new_password: newPassword
    });

    if (data?.access) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access);
    }
    if (data?.refresh) {
      localStorage.setItem(REFRESH_STORAGE_KEY, data.refresh);
    }
    return data;
  }
};

// ==============================================================================
// 3. Unified Authentication Service Interface
// ==============================================================================
export const authService = {
  getAdapter() {
    return isMockMode() ? mockAuthAdapter : liveAuthAdapter;
  },

  async login(username, password) {
    return this.getAdapter().login(username, password);
  },

  async logout() {
    return this.getAdapter().logout();
  },

  async refreshToken() {
    return this.getAdapter().refreshToken();
  },

  async getCurrentUser() {
    return this.getAdapter().getCurrentUser();
  },

  async changePassword(currentPassword, newPassword) {
    return this.getAdapter().changePassword(currentPassword, newPassword);
  },

  getStoredTokens() {
    return {
      access: localStorage.getItem(TOKEN_STORAGE_KEY),
      refresh: localStorage.getItem(REFRESH_STORAGE_KEY)
    };
  },

  getStoredUser() {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};
