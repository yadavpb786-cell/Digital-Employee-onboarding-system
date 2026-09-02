import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Calendar, ArrowRight, Tag } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const AnnouncementsFeed = () => {
  const { announcements } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-nova-md border border-slate-200/80 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Latest from NOVA Tech</h3>
              <p className="text-[11px] text-slate-400">Company news & orientation announcements</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/announcements')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {announcements.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate('/announcements')}
              className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                  <Tag className="w-2.5 h-2.5" /> {item.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> {item.date}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {item.preview}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <button
          onClick={() => navigate('/announcements')}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          Subscribe to company broadcasts →
        </button>
      </div>
    </div>
  );
};
