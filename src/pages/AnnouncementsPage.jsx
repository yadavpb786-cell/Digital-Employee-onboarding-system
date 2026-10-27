import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Megaphone, Calendar, Tag, Bell, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { formatTimeAgo } from '../utils/timeAgo';

export const AnnouncementsPage = () => {
  const { announcements, notifications } = useOnboarding();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'bulletins' | 'activity'

  // Extract relevant notifications for activity stream
  const liveSystemNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>People & Culture Communication Channel</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Company Announcements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official news broadcasts, orientation updates, and corporate milestone bulletins from HR leadership.
          </p>
        </div>

        <div className="px-3.5 py-2 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">HR Broadcast Hub Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-nova-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Updates
        </button>
        <button
          onClick={() => setActiveTab('bulletins')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'bulletins'
              ? 'bg-slate-900 text-white shadow-nova-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Executive Bulletins ({announcements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'bg-slate-900 text-white shadow-nova-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Notifications ({liveSystemNotifications.length} — Live API)</span>
        </button>
      </div>

      {/* Executive Bulletins */}
      {(activeTab === 'all' || activeTab === 'bulletins') && (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-2 hover:border-indigo-200 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md">
                  {ann.category}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {ann.date}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.preview}</p>
            </div>
          ))}
        </div>
      )}

      {/* Live System Broadcast Notifications */}
      {(activeTab === 'all' || activeTab === 'activity') && liveSystemNotifications.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Automated Platform Dispatches (Live API)</h3>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Synchronized via /api/v1/notifications/</span>
          </div>

          <div className="space-y-2.5">
            {liveSystemNotifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {notif.notification_type || notif.notificationType || 'ANNOUNCEMENT'}
                    </span>
                    <span className="font-semibold text-slate-900">{notif.title}</span>
                  </div>
                  <p className="text-slate-600 text-xs">{notif.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                  {notif.created_at ? formatTimeAgo(notif.created_at) : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
