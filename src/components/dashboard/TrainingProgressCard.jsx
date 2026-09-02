import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, HeartHandshake, ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { StatusBadge } from '../ui/StatusBadge';

export const TrainingProgressCard = () => {
  const { trainings } = useOnboarding();
  const navigate = useNavigate();

  const getModuleIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return Sparkles;
      case 'HeartHandshake': return HeartHandshake;
      case 'ShieldAlert': return ShieldAlert;
      default: return Sparkles;
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Your Training</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Assigned onboarding courses to build your foundation at NOVA Tech.
          </p>
        </div>
        <button
          onClick={() => navigate('/training')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          <span>View All Modules</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trainings.map((module) => {
          const ModuleIcon = getModuleIcon(module.icon);
          const isCompleted = module.progress === 100;
          const isInProgress = module.progress > 0 && module.progress < 100;

          return (
            <div
              key={module.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-nova-sm hover:shadow-nova-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`p-2 rounded-xl ${
                    isCompleted ? 'bg-emerald-50 text-emerald-600' : isInProgress ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ModuleIcon className="w-5 h-5" />
                  </div>
                  <StatusBadge status={module.status} size="sm" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{module.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {module.description}
                </p>
              </div>

              <div>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{module.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer details & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {module.duration}
                  </span>

                  <button
                    onClick={() => navigate('/training')}
                    className={`inline-flex items-center gap-1 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors ${
                      isCompleted
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : isInProgress
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-nova-sm'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
