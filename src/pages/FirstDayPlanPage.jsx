import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  Circle, 
  Building2, 
  Sparkles, 
  ExternalLink,
  Users,
  Laptop,
  Coffee,
  Check
} from 'lucide-react';

export const FirstDayPlanPage = () => {
  const { 
    employee, 
    firstDayTimeline, 
    toggleTimelineItem, 
    firstDayPlanConfirmed, 
    confirmFirstDayPlan 
  } = useOnboarding();

  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  const handleConfirmSchedule = () => {
    confirmFirstDayPlan();
    setConfirmedSuccess(true);
    setTimeout(() => setConfirmedSuccess(false), 3000);
  };

  const completedCount = firstDayTimeline.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Orientation Itinerary • Stage 8</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">First Day Action Plan</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hour-by-hour scheduled sessions, physical locations, meeting hosts, and setup checkpoints for your first day.
          </p>
        </div>

        {/* Date & Location Capsule */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-nova-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              Report Date & Time
            </span>
            <p className="text-sm font-bold text-white">{employee.joiningDate}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> {employee.joiningTime} IST
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Success Alert */}
      {confirmedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-semibold animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>First Day Plan reviewed and confirmed! Stage 8 marked as completed.</span>
        </div>
      )}

      {/* Quick Location & Host Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-nova-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Reporting Location</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{employee.location}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-nova-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Reporting Manager</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{employee.manager.name}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-nova-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">HR Partner</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{employee.hrSupport.name}</p>
          </div>
        </div>
      </div>

      {/* Detailed First-Day Sessions Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-nova-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Day 1 Scheduled Timeline (8 Sessions)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any session to toggle completion status.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {completedCount} of {firstDayTimeline.length} Sessions Complete
          </span>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-6 pt-2">
          {firstDayTimeline.map((item, idx) => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in-progress';

            return (
              <div key={item.id} className="relative pl-6 sm:pl-8 group">
                
                {/* Timeline node */}
                <div 
                  onClick={() => toggleTimelineItem(item.id)}
                  className={`absolute -left-[13px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center cursor-pointer transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white shadow-nova-sm' 
                      : isInProgress 
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Session Card */}
                <div 
                  className={`p-5 rounded-2xl border transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200' 
                      : isInProgress 
                      ? 'bg-white border-indigo-400 shadow-nova-md ring-1 ring-indigo-400/20' 
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:shadow-nova-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleTimelineItem(item.id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                        isCompleted 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : isInProgress 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : isInProgress ? '● In Progress' : 'Mark Done'}
                    </button>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-indigo-600" /> Host: {item.host}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Venue: {item.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmation Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Confirming the itinerary registers your Day 1 readiness with People Operations.
          </p>

          <button
            onClick={handleConfirmSchedule}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl shadow-nova-sm transition-all flex items-center gap-2 ${
              firstDayPlanConfirmed
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{firstDayPlanConfirmed ? 'Plan Confirmed (Re-confirm)' : 'Acknowledge & Confirm First Day Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
