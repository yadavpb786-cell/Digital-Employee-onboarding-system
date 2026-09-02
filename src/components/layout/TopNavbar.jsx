import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, Menu, ChevronRight, Sparkles } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { UserDropdown } from '../ui/UserDropdown';

export const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    employee, 
    unreadNotificationCount, 
    setIsMobileSidebarOpen, 
    setIsHrModalOpen,
    searchQuery,
    setSearchQuery
  } = useOnboarding();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // Generate dynamic title & breadcrumb based on route
  const getPageInfo = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return { title: 'Dashboard', category: 'Overview' };
      case '/onboarding':
        return { title: 'My Onboarding Journey', category: 'Onboarding' };
      case '/tasks':
        return { title: 'Onboarding Tasks', category: 'Action Required' };
      case '/documents':
        return { title: 'Document Center', category: 'Compliance' };
      case '/training':
        return { title: 'Training Modules', category: 'Learning' };
      case '/calendar':
        return { title: 'Schedule & Events', category: 'Calendar' };
      case '/company':
        return { title: 'Company Overview', category: 'NOVA Tech' };
      case '/team':
        return { title: 'Team Directory', category: 'People' };
      case '/policies':
        return { title: 'Company Policies', category: 'Handbook' };
      case '/announcements':
        return { title: 'Announcements Feed', category: 'Updates' };
      case '/help':
        return { title: 'Help & Knowledge Center', category: 'Support' };
      case '/settings':
        return { title: 'Account Settings', category: 'Profile' };
      default:
        return { title: 'Dashboard', category: 'Overview' };
    }
  };

  const { title, category } = getPageInfo();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left side: Mobile Toggle + Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {/* Small Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>NOVA Tech</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-indigo-600 font-semibold">{category}</span>
          </div>
          {/* Page Title */}
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right side: Search, Notifications, Help, User Avatar & Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search tasks, documents, team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/80 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* HR Quick Action */}
        <button 
          onClick={() => setIsHrModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200/70 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ask HR</span>
        </button>

        {/* Notification Bell Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsUserOpen(false);
            }}
            className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          <NotificationDropdown 
            isOpen={isNotifOpen} 
            onClose={() => setIsNotifOpen(false)} 
          />
        </div>

        {/* Help Center Icon */}
        <button 
          onClick={() => navigate('/help')}
          className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          title="Help Center"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* User Badge & Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsUserOpen(!isUserOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img 
              src={employee.avatar} 
              alt={employee.name} 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-600/30"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{employee.name}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-none">New Employee</p>
            </div>
          </button>

          <UserDropdown 
            isOpen={isUserOpen} 
            onClose={() => setIsUserOpen(false)} 
          />
        </div>
      </div>
    </header>
  );
};
