import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { HRMessageModal, FirstDayPlanModal } from '../ui/Modal';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Fixed Vertical Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <HRMessageModal />
      <FirstDayPlanModal />
    </div>
  );
};
