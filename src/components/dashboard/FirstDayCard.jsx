import React from 'react';
import { Calendar, Clock, MapPin, Building2, User, ExternalLink } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const FirstDayCard = () => {
  const { employee, setIsFirstDayModalOpen } = useOnboarding();

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-nova-lg border border-indigo-800/50 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Decorative SVG pattern */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
            Day One Info
          </span>
          <span className="text-xs text-indigo-200 font-medium">In 19 Days</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-4">Your First Day</h3>

        <div className="space-y-3.5 text-xs text-slate-200">
          <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Date</p>
              <p className="font-bold text-white">{employee.joiningDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Report Time</p>
              <p className="font-bold text-white">{employee.joiningTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Location</p>
              <p className="font-bold text-white">{employee.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{employee.department}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{employee.manager.name}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsFirstDayModalOpen(true)}
        className="w-full mt-6 py-2.5 px-4 text-xs font-bold text-slate-900 bg-white hover:bg-indigo-50 active:bg-indigo-100 rounded-xl shadow-nova-sm transition-all flex items-center justify-center gap-2"
      >
        <span>View First Day Plan</span>
        <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
      </button>
    </div>
  );
};
