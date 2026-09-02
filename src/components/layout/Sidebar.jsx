import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  CheckSquare, 
  FileText, 
  GraduationCap, 
  Calendar as CalendarIcon, 
  Building2, 
  Users, 
  BookOpen, 
  Megaphone, 
  HelpCircle, 
  MessageSquare, 
  Settings, 
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';
import { NovaLogo } from '../brand/NovaLogo';
import { useOnboarding } from '../../context/OnboardingContext';

export const Sidebar = () => {
  const location = useLocation();
  const { 
    employee, 
    setIsHrModalOpen, 
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen,
    completedCount,
    totalCount
  } = useOnboarding();

  const mainNav = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'My Onboarding', path: '/onboarding', icon: Compass, badge: `${completedCount}/${totalCount}` },
    { title: 'Tasks', path: '/tasks', icon: CheckSquare },
    { title: 'Documents', path: '/documents', icon: FileText },
    { title: 'Training', path: '/training', icon: GraduationCap },
    { title: 'Calendar', path: '/calendar', icon: CalendarIcon },
  ];

  const companyNav = [
    { title: 'Company', path: '/company', icon: Building2 },
    { title: 'Team Directory', path: '/team', icon: Users },
    { title: 'Policies', path: '/policies', icon: BookOpen },
    { title: 'Announcements', path: '/announcements', icon: Megaphone },
  ];

  const supportNav = [
    { title: 'Help Center', path: '/help', icon: HelpCircle },
    { 
      title: 'Contact HR', 
      icon: MessageSquare, 
      isAction: true,
      onClick: () => {
        setIsHrModalOpen(true);
        setIsMobileSidebarOpen(false);
      } 
    },
  ];

  const renderNavGroup = (label, items) => (
    <div className="mb-6">
      <div className="px-3 mb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
        {label}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          if (item.isAction) {
            return (
              <button
                key={item.title}
                onClick={item.onClick}
                className="w-full group flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                  <span>{item.title}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
              </button>
            );
          }

          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.title}
              to={item.path}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={({ isActive: isLinkActive }) => {
                const active = isLinkActive || isActive;
                return `group flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all duration-150 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-nova-glow font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`;
              }}
            >
              {({ isActive: isLinkActive }) => {
                const active = isLinkActive || isActive;
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with Brand */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <NovaLogo showText={true} textClass="text-white" />
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {renderNavGroup('MAIN', mainNav)}
          {renderNavGroup('COMPANY', companyNav)}
          {renderNavGroup('SUPPORT', supportNav)}
        </div>

        {/* Bottom Sidebar Settings & User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-3">
          {/* Settings link */}
          <NavLink
            to="/settings"
            onClick={() => setIsMobileSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </NavLink>

          {/* User profile compact card */}
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img 
                src={employee.avatar} 
                alt={employee.name} 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0" 
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{employee.name}</p>
                <p className="text-[10px] text-indigo-300 truncate">{employee.role}</p>
              </div>
            </div>

            <button 
              onClick={() => alert("Sign out simulated.")}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
