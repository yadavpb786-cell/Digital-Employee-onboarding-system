import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Calendar as CalendarIcon, Clock, MapPin, UserCheck, Plus } from 'lucide-react';

export const CalendarPage = () => {
  const { events } = useOnboarding();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Onboarding Schedule</h2>
          <p className="text-xs text-slate-500 mt-1">September 2026 Orientation & Team Events</p>
        </div>

        <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-nova-sm flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Custom Event</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-4">
        <h3 className="text-base font-bold text-slate-900">Upcoming Agenda Sessions</h3>

        <div className="space-y-3">
          {events.map((evt) => (
            <div key={evt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="px-3 py-2 bg-slate-900 text-white font-bold text-center rounded-xl min-w-[70px]">
                  <p className="text-[10px] uppercase text-indigo-400">{evt.dayTag}</p>
                  <p className="text-xs">{evt.time}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{evt.location}</p>
                  <p className="text-[11px] text-indigo-600 font-medium mt-1">Host: {evt.host}</p>
                </div>
              </div>

              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 self-start sm:self-center">
                {evt.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
