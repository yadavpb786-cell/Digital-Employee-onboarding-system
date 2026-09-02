import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Megaphone, Calendar, Tag } from 'lucide-react';

export const AnnouncementsPage = () => {
  const { announcements } = useOnboarding();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md">
        <h2 className="text-2xl font-extrabold text-slate-900">Company Announcements</h2>
        <p className="text-xs text-slate-500 mt-1">Official news broadcasts and orientation updates from HR leadership.</p>
      </div>

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md">
                {ann.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">{ann.date}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{ann.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
