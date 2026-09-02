import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { GraduationCap, Play, CheckCircle2, Clock, BookOpen, Sparkles } from 'lucide-react';

export const TrainingPage = () => {
  const { trainings } = useOnboarding();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>NOVA Academy</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Training Modules</h2>
          <p className="text-xs text-slate-500 mt-1">Complete mandatory security, technical, and culture courses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trainings.map(course => (
          <div key={course.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                  {course.category}
                </span>
                <StatusBadge status={course.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{course.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{course.description}</p>
            </div>

            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Course Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {course.duration}
                </span>
                <button 
                  onClick={() => alert(`Starting video module for: ${course.title}`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-nova-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{course.progress === 100 ? 'Replay' : 'Continue'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
