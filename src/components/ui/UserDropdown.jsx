import React, { useRef, useEffect } from 'react';
import { User, Settings, LogOut, Shield, Building2, ExternalLink } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useNavigate } from 'react-router-dom';

export const UserDropdown = ({ isOpen, onClose }) => {
  const { employee } = useOnboarding();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-nova-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Employee Header */}
      <div className="p-4 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <img 
            src={employee.avatar} 
            alt={employee.name} 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50"
          />
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate">{employee.name}</h4>
            <p className="text-xs text-indigo-300 truncate">{employee.role}</p>
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 rounded mt-1 border border-indigo-500/30">
              Employee Portal
            </span>
          </div>
        </div>
      </div>

      {/* Role Switcher Demo notice for future modules */}
      <div className="px-3 py-2 bg-indigo-50/60 border-b border-slate-100">
        <p className="text-[10px] font-medium text-slate-500 flex items-center justify-between">
          <span>Active Role: <strong className="text-indigo-700">EMPLOYEE</strong></span>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded">SaaS Architecture</span>
        </p>
      </div>

      {/* Action items */}
      <div className="p-1.5 divide-y divide-slate-100">
        <div className="py-1">
          <button 
            onClick={() => { navigate('/settings'); onClose(); }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2.5 transition-colors"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Profile & Account</span>
          </button>
          <button 
            onClick={() => { navigate('/settings'); onClose(); }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2.5 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Future Portal preview section */}
        <div className="py-1">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Future Portals
          </div>
          <div className="px-3 py-1.5 text-xs text-slate-400 flex items-center justify-between opacity-60">
            <span className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> HR Manager Portal
            </span>
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">Phase 2</span>
          </div>
          <div className="px-3 py-1.5 text-xs text-slate-400 flex items-center justify-between opacity-60">
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> System Admin Portal
            </span>
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">Phase 2</span>
          </div>
        </div>

        <div className="pt-1">
          <button 
            onClick={() => { alert("Logout simulated for demo mode"); onClose(); }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
