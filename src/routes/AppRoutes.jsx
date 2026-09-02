import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { TasksPage } from '../pages/TasksPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { TrainingPage } from '../pages/TrainingPage';
import { CalendarPage } from '../pages/CalendarPage';
import { CompanyPage } from '../pages/CompanyPage';
import { TeamPage } from '../pages/TeamPage';
import { PoliciesPage } from '../pages/PoliciesPage';
import { AnnouncementsPage } from '../pages/AnnouncementsPage';
import { HelpPage } from '../pages/HelpPage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};
