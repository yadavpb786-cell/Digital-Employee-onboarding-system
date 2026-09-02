import React from 'react';
import { Calendar, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const WelcomeHeader = () => {
  const { employee } = useOnboarding();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-nova-lg border border-slate-800 mb-8">
      {/* Background Subtle Tech Grid Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Onboarding Hub</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome to NOVA Tech, {employee.name.split(' ')[0]} 👋
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1.5 font-normal max-w-xl">
            Let's get you ready for your first day.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Joining: Sep 21, 2026</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pre-Onboarding Active</span>
            </div>
          </div>
        </div>

        {/* Quick Manager Card Badge */}
        <div className="shrink-0 bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 flex items-center gap-3">
          <img 
            src={employee.manager.avatar} 
            alt={employee.manager.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/50" 
          />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">Reporting Manager</p>
            <p className="text-xs font-bold text-white">{employee.manager.name}</p>
            <p className="text-[11px] text-slate-400">{employee.manager.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
