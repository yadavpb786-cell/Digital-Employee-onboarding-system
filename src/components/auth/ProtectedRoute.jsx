import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultPathForRole } from '../../utils/roleRouting';
import { Sparkles } from 'lucide-react';

export const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  allowedRoles = null, 
  fallbackPath = null 
}) => {
  const { isAuthenticated, isLoading, user, systemRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-sm font-medium text-slate-300">Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the current location so user can be redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role authorization guard
  const currentRole = systemRole || user?.system_role || user?.systemRole || 'EMPLOYEE';
  const rolesToCheck = [];
  if (requiredRole) rolesToCheck.push(requiredRole);
  if (Array.isArray(allowedRoles)) rolesToCheck.push(...allowedRoles);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(currentRole)) {
    // Redirect unauthorized roles safely to their specific role landing page or custom fallback
    const targetFallback = fallbackPath || getDefaultPathForRole(currentRole);
    return <Navigate to={targetFallback} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
