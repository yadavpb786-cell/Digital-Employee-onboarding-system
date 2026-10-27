import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Calendar as CalendarIcon, Clock, MapPin, UserCheck, Plus, CheckCircle2, Info, X } from 'lucide-react';

export const CalendarPage = () => {
  const { events, firstDayTimeline, employee } = useOnboarding();
  const [activeTab, setActiveTab] = useState('firstDay'); // 'firstDay' | 'cohort'
  const [showEventInfoModal, setShowEventInfoModal] = useState(false);

  // Live first-day sessions from Django FirstDaySessionViewSet (/api/v1/first-day/)
  const liveSessions = Array.isArray(firstDayTimeline) ? firstDayTimeline : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Orientation Schedule & Calendar</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Onboarding Calendar</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track your day-one itinerary, orientation workshops, and scheduled meetings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEventInfoModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-nova-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('firstDay')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'firstDay'
              ? 'bg-slate-900 text-white shadow-nova-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>First Day Itinerary ({liveSessions.length} Sessions — Live API)</span>
        </button>

        <button
          onClick={() => setActiveTab('cohort')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'cohort'
              ? 'bg-slate-900 text-white shadow-nova-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>Cohort Overview ({events.length} Events)</span>
        </button>
      </div>

      {/* Tab 1: Live First Day Itinerary */}
      {activeTab === 'firstDay' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">First-Day Orientation Checkpoints</h3>
              <p className="text-xs text-slate-500">
                Live sessions synchronized from your onboarding itinerary endpoint.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Report Date: <strong className="text-slate-900">{employee?.joiningDate || 'Day 1'}</strong> at{' '}
              <strong className="text-slate-900">{employee?.joiningTime || '09:00 AM'} IST</strong>
            </div>
          </div>

          <div className="space-y-3">
            {liveSessions.map((session, idx) => (
              <div
                key={session.id || idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="px-3 py-2 bg-slate-900 text-white font-bold text-center rounded-xl min-w-[85px] shrink-0">
                    <p className="text-[10px] uppercase text-indigo-400 font-bold">Session {session.order || idx + 1}</p>
                    <p className="text-xs font-mono">{session.time || session.timeSlot || 'Scheduled'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{session.title}</h4>
                      {session.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{session.location}</span>
                    </p>
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">
                      Lead Host: {session.host}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 self-start sm:self-center shrink-0">
                  {session.type || session.sessionType || 'Orientation'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Cohort Orientation Calendar */}
      {activeTab === 'cohort' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Cohort Agenda</h3>
              <p className="text-xs text-slate-500">General orientation timeline and milestones across your first week.</p>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Week 1 Schedule
            </span>
          </div>

          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="px-3 py-2 bg-slate-900 text-white font-bold text-center rounded-xl min-w-[70px] shrink-0">
                    <p className="text-[10px] uppercase text-indigo-400">{evt.dayTag}</p>
                    <p className="text-xs">{evt.time}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{evt.location}</p>
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">Host: {evt.host}</p>
                  </div>
                </div>

                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100 self-start sm:self-center shrink-0">
                  {evt.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Session Info Modal */}
      {showEventInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Custom Calendar Scheduling</h3>
              </div>
              <button
                onClick={() => setShowEventInfoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <p>
                Orientation agenda sessions are centrally managed by <strong>People Operations</strong> and synchronized with your enterprise Google / Outlook Calendar.
              </p>
              <p>
                To schedule 1-on-1 alignment sessions with your manager or team, use the <strong>Stage 7: Manager Check-in</strong> milestone or message HR support directly.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEventInfoModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
