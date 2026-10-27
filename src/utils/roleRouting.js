/**
 * Role-Based Routing and Access Control Utilities
 * NOVA Tech Digital Employee Onboarding System
 */

export const SYSTEM_ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR_MANAGER: 'HR_MANAGER',
  ADMIN: 'ADMIN'
};

/**
 * Returns the default home destination for a given system role.
 */
export const getDefaultPathForRole = (role) => {
  switch (role) {
    case SYSTEM_ROLES.ADMIN:
      return '/admin/portal';
    case SYSTEM_ROLES.HR_MANAGER:
      return '/hr/dashboard';
    case SYSTEM_ROLES.EMPLOYEE:
    default:
      return '/dashboard';
  }
};

/**
 * Validates whether a specific pathname is authorized for the given system role.
 */
export const isPathAllowedForRole = (pathname, role) => {
  if (!pathname || typeof pathname !== 'string') return false;

  const cleanPath = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const userRole = role || SYSTEM_ROLES.EMPLOYEE;

  // 1. Administration portal routes: ADMIN only
  if (cleanPath === '/admin/portal' || cleanPath.startsWith('/admin/')) {
    return userRole === SYSTEM_ROLES.ADMIN;
  }

  // 2. HR Management routes: HR_MANAGER and ADMIN
  if (
    cleanPath === '/hr/dashboard' ||
    cleanPath === '/hr/employees' ||
    cleanPath.startsWith('/hr/employees/') ||
    cleanPath === '/hr/analytics' ||
    cleanPath === '/invitations'
  ) {
    return userRole === SYSTEM_ROLES.HR_MANAGER || userRole === SYSTEM_ROLES.ADMIN;
  }

  // 3. Employee-specific onboarding routes: EMPLOYEE only
  const employeeOnlyRoutes = [
    '/dashboard',
    '/onboarding',
    '/profile',
    '/tasks',
    '/documents',
    '/offer-letter',
    '/policies',
    '/training',
    '/quiz',
    '/first-day',
    '/feedback'
  ];

  if (employeeOnlyRoutes.includes(cleanPath)) {
    return userRole === SYSTEM_ROLES.EMPLOYEE;
  }

  // 4. Universal authenticated routes allowed for all roles:
  const sharedRoutes = [
    '/settings',
    '/notifications',
    '/calendar',
    '/company',
    '/team',
    '/announcements',
    '/help'
  ];

  if (sharedRoutes.includes(cleanPath)) {
    return true;
  }

  return false;
};

/**
 * Computes a safe, validated redirect path based on requested destination and role.
 * If targetPath is unauthorized or invalid, falls back to role's default landing path.
 */
export const getValidRedirectPath = (targetPath, role) => {
  if (
    targetPath &&
    targetPath !== '/login' &&
    targetPath !== '/register' &&
    targetPath !== '/' &&
    isPathAllowedForRole(targetPath, role)
  ) {
    return targetPath;
  }
  return getDefaultPathForRole(role);
};
