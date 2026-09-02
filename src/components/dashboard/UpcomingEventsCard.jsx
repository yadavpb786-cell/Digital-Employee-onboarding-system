import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowRight, UserCheck } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const UpcomingEventsCard = () => {
  const { events } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-nova-md border border-slate-200/80 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Schedule</h3>
              <p className="text-[11px] text-slate-400">Orientation & team sync sessions</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/calendar')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => navigate('/calendar')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                {/* Day Tag Badge */}
                <div className={`px-2.5 py-1.5 rounded-xl text-center min-w-[64px] ${
                  evt.dayTag === 'Today' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200/80 text-slate-700 font-semibold'
                }`}>
                  <p className="text-[10px] uppercase tracking-wider leading-none">{evt.dayTag}</p>
                  <p className="text-xs mt-0.5 leading-none">{evt.time}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-indigo-500" /> {evt.host}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {evt.location.split('&')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-200/70 text-slate-700 shrink-0">
                {evt.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <button
          onClick={() => navigate('/calendar')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          + Sync with Google Calendar / Outlook
        </button>
      </div>
    </div>
  );
};
