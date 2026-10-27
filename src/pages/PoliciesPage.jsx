import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PolicyReaderModal } from '../components/ui/PolicyReaderModal';
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Clock, 
  AlertCircle, 
  FileCheck,
  Search,
  Sparkles
} from 'lucide-react';

export const PoliciesPage = () => {
  const { policies, acknowledgePolicy } = useOnboarding();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, acknowledged, pending

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'acknowledged') return matchesSearch && p.acknowledged;
    if (filter === 'pending') return matchesSearch && !p.acknowledged;
    return matchesSearch;
  });

  const ackCount = policies.filter(p => p.acknowledged).length;
  const totalCount = policies.length;
  const compliancePercentage = Math.round((ackCount / totalCount) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Corporate Governance • Stage 4</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Company Policies & Handbook</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review official NOVA Tech employee guidelines, workplace conduct, and compliance standards.
          </p>
        </div>

        {/* Compliance Progress Indicator */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-nova-sm">
          <div>
            <span className="text-xl font-extrabold text-indigo-400 leading-none">
              {ackCount}/{totalCount}
            </span>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Acknowledged</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-800"></div>
          <div className="text-xs">
            <p className="font-bold">{compliancePercentage}% Compliant</p>
            <p className="text-[11px] text-slate-400">
              {ackCount === totalCount ? 'All policies signed' : `${totalCount - ackCount} pending review`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-nova-sm">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies by keyword or category..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: `All (${totalCount})` },
            { key: 'acknowledged', label: `Acknowledged (${ackCount})` },
            { key: 'pending', label: `Action Required (${totalCount - ackCount})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white shadow-nova-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.map((p) => {
          const isAck = p.acknowledged;

          return (
            <div 
              key={p.id}
              className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                isAck 
                  ? 'bg-white border-slate-200/80 shadow-nova-sm' 
                  : 'bg-white border-indigo-200 shadow-nova-md ring-1 ring-indigo-200/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-600">
                    {p.category}
                  </span>
                  
                  {isAck ? (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Acknowledged
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      Requires Review
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                
                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                  {p.summary}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {p.readTime}
                  </span>
                  {isAck && (
                    <span>• Signed on {p.acknowledgedAt || 'Sep 01, 2026'}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setSelectedPolicy(p)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Full Policy</span>
                </button>

                {!isAck ? (
                  <button
                    onClick={() => acknowledgePolicy(p.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPolicy(p)}
                    className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Signed</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Reader Modal */}
      <PolicyReaderModal 
        policy={selectedPolicy}
        isOpen={Boolean(selectedPolicy)}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
};
