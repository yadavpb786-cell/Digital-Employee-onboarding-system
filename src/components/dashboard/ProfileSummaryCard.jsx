import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, ShieldCheck, Mail, Edit3, UserCheck } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { StatusBadge } from '../ui/StatusBadge';

export const ProfileSummaryCard = () => {
  const { employee, progressPercentage, completedCount, totalCount } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-nova-md border border-slate-200/80 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Employee Profile
          </span>
          <button 
            onClick={() => navigate('/profile')}
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar & Info */}
        <div className="text-center mb-5">
          <div className="relative inline-block mb-3">
            <img 
              src={employee.avatar} 
              alt={employee.name} 
              className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50 shadow-nova-md mx-auto" 
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900">{employee.name}</h3>
          <p className="text-xs font-semibold text-indigo-600">{employee.role}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{employee.email}</p>
        </div>

        {/* Details list */}
        <div className="space-y-2.5 text-xs border-t border-b border-slate-100 py-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department
            </span>
            <span className="font-semibold text-slate-800">{employee.department}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joining Date
            </span>
            <span className="font-semibold text-slate-800">Sep 21, 2026</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Onboarding Status
            </span>
            <StatusBadge status={progressPercentage === 100 ? 'completed' : 'in_progress'} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Tasks Done
            </span>
            <span className="font-bold text-indigo-600">{completedCount} / {totalCount}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/profile')}
        className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
      >
        View Full Profile →
      </button>
    </div>
  );
};
