import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, ShieldCheck, Clock, FileCheck } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const PolicyReaderModal = ({ policy, isOpen, onClose }) => {
  const { acknowledgePolicy } = useOnboarding();
  const [agreed, setAgreed] = useState(false);
  const [ackSuccess, setAckSuccess] = useState(false);

  if (!isOpen || !policy) return null;

  const handleAcknowledge = () => {
    acknowledgePolicy(policy.id);
    setAckSuccess(true);
    setTimeout(() => {
      setAckSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  {policy.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {policy.readTime} read
                </span>
              </div>
              <h3 className="font-bold text-base mt-1 text-white">{policy.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-slate-700">
          
          {/* Status Alert Banner */}
          {policy.acknowledged ? (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You have acknowledged this policy on {policy.acknowledgedAt || 'Sep 01, 2026'}.</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">
                Compliant
              </span>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please read through the summary and key stipulations below, then confirm your digital acknowledgement.</span>
            </div>
          )}

          {/* Policy Overview Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Policy Scope & Summary</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              {policy.summary}
            </p>
          </div>

          {/* Key Compliance Points */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Key Operational Mandates</h4>
            <ul className="space-y-2.5">
              {policy.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-nova-sm text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance Clause */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Violations & Redressal</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Non-compliance with NOVA Tech corporate policies may result in disciplinary procedures pursuant to employee agreements, up to and including termination of engagement. Inquiries or grievances can be directed to ethics@novatech.io.
            </p>
          </div>
        </div>

        {/* Footer with Acknowledgment Action */}
        <div className="p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {!policy.acknowledged ? (
            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>I have thoroughly read, understood, and agreed to abide by this policy.</span>
            </label>
          ) : (
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Officially recorded in employee compliance record
            </span>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Close
            </button>

            {!policy.acknowledged && (
              <button
                onClick={handleAcknowledge}
                disabled={!agreed || ackSuccess}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>{ackSuccess ? 'Acknowledging...' : 'Acknowledge Policy'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
