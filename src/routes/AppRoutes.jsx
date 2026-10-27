import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { getDefaultPathForRole } from '../utils/roleRouting';

// Eagerly loaded critical authentication & primary dashboard pages
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OnboardingPage } from '../pages/OnboardingPage';

// Route-based lazy loading for HR, Admin, secondary, and heavier pages
const RegisterPage = lazy(() => import('../pages/RegisterPage').then(m => ({ default: m.RegisterPage || m.default })));
const TasksPage = lazy(() => import('../pages/TasksPage').then(m => ({ default: m.TasksPage || m.default })));
const DocumentsPage = lazy(() => import('../pages/DocumentsPage').then(m => ({ default: m.DocumentsPage || m.default })));
const TrainingPage = lazy(() => import('../pages/TrainingPage').then(m => ({ default: m.TrainingPage || m.default })));
const CalendarPage = lazy(() => import('../pages/CalendarPage').then(m => ({ default: m.CalendarPage || m.default })));
const CompanyPage = lazy(() => import('../pages/CompanyPage').then(m => ({ default: m.CompanyPage || m.default })));
const TeamPage = lazy(() => import('../pages/TeamPage').then(m => ({ default: m.TeamPage || m.default })));
const PoliciesPage = lazy(() => import('../pages/PoliciesPage').then(m => ({ default: m.PoliciesPage || m.default })));
const AnnouncementsPage = lazy(() => import('../pages/AnnouncementsPage').then(m => ({ default: m.AnnouncementsPage || m.default })));
const HelpPage = lazy(() => import('../pages/HelpPage').then(m => ({ default: m.HelpPage || m.default })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage || m.default })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage || m.default })));
const OfferLetterPage = lazy(() => import('../pages/OfferLetterPage').then(m => ({ default: m.OfferLetterPage || m.default })));
const QuizPage = lazy(() => import('../pages/QuizPage').then(m => ({ default: m.QuizPage || m.default })));
const FirstDayPlanPage = lazy(() => import('../pages/FirstDayPlanPage').then(m => ({ default: m.FirstDayPlanPage || m.default })));
const FeedbackPage = lazy(() => import('../pages/FeedbackPage').then(m => ({ default: m.FeedbackPage || m.default })));
const InvitationsPage = lazy(() => import('../pages/InvitationsPage').then(m => ({ default: m.InvitationsPage || m.default })));
const HRDashboardPage = lazy(() => import('../pages/hr/HRDashboardPage').then(m => ({ default: m.HRDashboardPage || m.default })));
const HREmployeesPage = lazy(() => import('../pages/hr/HREmployeesPage').then(m => ({ default: m.HREmployeesPage || m.default })));
const HREmployeeDetailPage = lazy(() => import('../pages/hr/HREmployeeDetailPage').then(m => ({ default: m.HREmployeeDetailPage || m.default })));
const HRAnalyticsPage = lazy(() => import('../pages/hr/HRAnalyticsPage').then(m => ({ default: m.HRAnalyticsPage || m.default })));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage').then(m => ({ default: m.NotificationsPage || m.default })));
const AdminPortalPage = lazy(() => import('../pages/admin/AdminPortalPage').then(m => ({ default: m.AdminPortalPage || m.default })));

/**
 * Sleek loading fallback for lazy-loaded route chunks
 */
const PageFallback = () => (
  <div className="flex flex-col items-center justify-center p-16 min-h-[350px] space-y-3">
    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Loading View...</span>
  </div>
);

/**
 * Dynamically redirects authenticated users to their authorized role homepage,
 * or unauthenticated users to the login screen.
 */
const RoleHomeRedirect = () => {
  const { systemRole, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultPathForRole(systemRole)} replace />;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes wrapped in ProtectedRoute and MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dynamic Role-Based Landing at root '/' */}
          <Route path="/" element={<RoleHomeRedirect />} />

          {/* Employee Only Routes (Phase 1 & Phase 2 Candidate Onboarding) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offer-letter"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <OfferLetterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <PoliciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <TrainingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/first-day"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <FirstDayPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />

          {/* Shared / General Authenticated Routes */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Protected HR & Admin Routes */}
          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute allowedRoles={['HR_MANAGER', 'ADMIN']}>
                <HRDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute allowedRoles={['HR_MANAGER', 'ADMIN']}>
                <HREmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees/:id"
            element={
              <ProtectedRoute allowedRoles={['HR_MANAGER', 'ADMIN']}>
                <HREmployeeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/analytics"
            element={
              <ProtectedRoute allowedRoles={['HR_MANAGER', 'ADMIN']}>
                <HRAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invitations"
            element={
              <ProtectedRoute allowedRoles={['HR_MANAGER', 'ADMIN']}>
                <InvitationsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Only Route */}
          <Route
            path="/admin/portal"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPortalPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all fallback route */}
        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
