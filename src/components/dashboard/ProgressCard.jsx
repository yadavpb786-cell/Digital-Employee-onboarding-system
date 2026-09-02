import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CircleDot, Clock, ShieldCheck } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const ProgressCard = () => {
  const navigate = useNavigate();
  const { 
    progressPercentage, 
    completedCount, 
    totalCount, 
    completedTasks, 
    currentTasks, 
    pendingTasks 
  } = useOnboarding();

  // SVG Circular Gauge calculations
  const radius = 42;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-nova-md border border-slate-200/80 mb-8 transition-all hover:shadow-nova-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Progress Gauge + Main Heading */}
        <div className="flex items-center gap-5">
          {/* Circular Progress Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#e2e8f0"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#4f46e5"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-900 leading-none">
                {progressPercentage}%
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">
                Done
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">Your Onboarding Progress</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {progressPercentage}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {completedCount} of {totalCount} onboarding steps completed
            </p>
            {/* Progress linear bar for quick mobile view */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: CTA Action */}
        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-2xl shadow-nova-sm transition-all group shrink-0"
        >
          <span>Continue Onboarding</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Breakdown Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
        
        {/* Completed Column */}
        <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Completed ({completedTasks.length})
            </span>
          </div>
          <ul className="space-y-1">
            {completedTasks.slice(0, 3).map(task => (
              <li key={task.id} className="text-xs text-emerald-900 flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{task.title}</span>
              </li>
            ))}
            {completedTasks.length > 3 && (
              <li className="text-[10px] font-semibold text-emerald-700 pt-0.5">
                +{completedTasks.length - 3} more completed
              </li>
            )}
          </ul>
        </div>

        {/* Current Column */}
        <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <CircleDot className="w-4 h-4 text-indigo-600 animate-pulse" />
              Current Step ({currentTasks.length})
            </span>
          </div>
          <ul className="space-y-1">
            {currentTasks.length === 0 ? (
              <li className="text-xs text-indigo-700 italic">No task currently active</li>
            ) : (
              currentTasks.map(task => (
                <li key={task.id} className="text-xs font-medium text-indigo-950 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span className="truncate">{task.title}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Upcoming Column */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Upcoming ({pendingTasks.length})
            </span>
          </div>
          <ul className="space-y-1">
            {pendingTasks.slice(0, 3).map(task => (
              <li key={task.id} className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">{task.title}</span>
              </li>
            ))}
            {pendingTasks.length > 3 && (
              <li className="text-[10px] font-semibold text-slate-500 pt-0.5">
                +{pendingTasks.length - 3} more pending
              </li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};
