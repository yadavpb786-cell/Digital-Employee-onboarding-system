import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CheckCircle2, Clock, CircleDot, ArrowRight, ShieldCheck, FileCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OnboardingPage = () => {
  const { tasks, progressPercentage, completedCount, totalCount, toggleTaskStatus } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Onboarding Map</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">My Onboarding Journey</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Track and complete all required milestones prior to your first official week at NOVA Tech.
          </p>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center gap-5 shrink-0 shadow-nova-lg">
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-400">{progressPercentage}%</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Complete</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-800"></div>
          <div>
            <p className="text-xs font-bold text-white">{completedCount} of {totalCount} Steps</p>
            <p className="text-[11px] text-slate-400">Completed so far</p>
          </div>
        </div>
      </div>

      {/* Timeline Steps List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-nova-md">
        <h3 className="text-base font-bold text-slate-900 mb-6">Onboarding Milestones Checklist</h3>

        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
          {tasks.map((task, idx) => {
            const isCompleted = task.status === 'completed';
            const isCurrent = task.status === 'current';

            return (
              <div key={task.id} className="relative pl-8 group">
                {/* Node indicator */}
                <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-emerald-500 text-white shadow-nova-sm' : isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                </div>

                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 hover:bg-white hover:shadow-nova-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {task.category}
                      </span>
                      <StatusBadge status={task.status} size="sm" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{task.title}</h4>
                    <p className="text-xs text-slate-500">{task.description}</p>
                    <p className="text-[11px] text-slate-400 pt-1">Target completion: {task.dueDate}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-nova-sm'
                      }`}
                    >
                      {isCompleted ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    
                    <button
                      onClick={() => navigate(task.actionPath)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Open page"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
