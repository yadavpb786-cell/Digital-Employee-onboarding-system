import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ShieldCheck, Download, Search } from 'lucide-react';

export const PoliciesPage = () => {
  const [policies, setPolicies] = useState([
    { id: 1, title: 'Code of Professional Conduct', category: 'Compliance', readTime: '8 mins', read: true },
    { id: 2, title: 'Remote & Hybrid Work Policy 2026', category: 'Workplace', readTime: '5 mins', read: true },
    { id: 3, title: 'Information Security & Data Protection', category: 'Security', readTime: '12 mins', read: false },
    { id: 4, title: 'Equal Opportunity & Anti-Harassment', category: 'HR', readTime: '6 mins', read: true },
    { id: 5, title: 'Leave, Wellness & Sabbatical Rules', category: 'Benefits', readTime: '7 mins', read: false },
  ]);

  const toggleRead = (id) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, read: !p.read } : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md">
        <h2 className="text-2xl font-extrabold text-slate-900">Company Policies & Handbook</h2>
        <p className="text-xs text-slate-500 mt-1">Review official NOVA Tech employee guidelines and compliance documents.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-nova-md divide-y divide-slate-100">
        {policies.map(p => (
          <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                  <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {p.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Estimated reading time: {p.readTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleRead(p.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  p.read 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {p.read ? '✓ Read & Acknowledged' : 'Acknowledge Policy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
