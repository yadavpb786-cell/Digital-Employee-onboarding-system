import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  UserCheck, 
  FileUp, 
  ShieldCheck, 
  FileSignature, 
  BookOpen, 
  GraduationCap, 
  Users, 
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { StatusBadge } from '../ui/StatusBadge';

export const OnboardingChecklist = () => {
  const { tasks, toggleTaskStatus } = useOnboarding();
  const navigate = useNavigate();

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'UserCheck': return UserCheck;
      case 'FileUp': return FileUp;
      case 'ShieldCheck': return ShieldCheck;
      case 'FileSignature': return FileSignature;
      case 'BookOpen': return BookOpen;
      case 'GraduationCap': return GraduationCap;
      case 'Users': return Users;
      case 'CheckSquare': return CheckSquare;
      default: return CheckSquare;
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Getting Started</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Complete your onboarding tasks to finalize your NOVA Tech profile.
          </p>
        </div>
        <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 hidden sm:inline-block">
          Interactive Checklist (Click to Toggle Status)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {tasks.map((task) => {
          const TaskIcon = getIcon(task.icon);
          const isCompleted = task.status === 'completed';
          const isCurrent = task.status === 'current';

          return (
            <div
              key={task.id}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
                isCompleted
                  ? 'bg-slate-50/70 border-slate-200/70 opacity-95'
                  : isCurrent
                  ? 'bg-white border-indigo-500 shadow-nova-md ring-1 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-nova-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Status Toggle Button / Checkbox */}
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  title="Click to toggle status"
                  className={`mt-0.5 p-1 rounded-lg transition-transform active:scale-95 shrink-0 ${
                    isCompleted
                      ? 'text-emerald-600 hover:text-emerald-700'
                      : isCurrent
                      ? 'text-indigo-600 hover:text-indigo-700'
                      : 'text-slate-300 hover:text-indigo-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                  ) : isCurrent ? (
                    <div className="relative">
                      <Circle className="w-5 h-5 text-indigo-600 stroke-[2.5]" />
                      <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
                    </div>
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        isCompleted ? 'bg-emerald-50 text-emerald-600' : isCurrent ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <TaskIcon className="w-4 h-4" />
                      </div>
                      <h4 className={`text-sm font-bold truncate ${
                        isCompleted ? 'text-slate-700 line-through' : 'text-slate-900'
                      }`}>
                        {task.title}
                      </h4>
                    </div>

                    <StatusBadge status={task.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Footer metadata & Action button */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Est. {task.estimatedTime}</span>

                    <button
                      onClick={() => navigate(task.actionPath)}
                      className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                        isCurrent
                          ? 'text-indigo-600 hover:text-indigo-800'
                          : 'text-slate-600 hover:text-indigo-600'
                      }`}
                    >
                      <span>{isCompleted ? 'Review' : isCurrent ? 'Continue Task' : 'Start Task'}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
