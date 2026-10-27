import React from 'react';
import { X, Award, Download, CheckCircle2, Shield, Calendar, User, Sparkles } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { NovaLogo } from '../brand/NovaLogo';

export const CertificateModal = ({ isOpen, onClose }) => {
  const { employee } = useOnboarding();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm">NOVA Tech Onboarding Completion Certificate</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Canvas */}
        <div className="p-8 sm:p-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 relative">
          
          {/* Certificate Border Frame */}
          <div className="border-4 border-double border-indigo-900/30 rounded-2xl p-6 sm:p-8 text-center relative bg-white shadow-nova-sm">
            
            {/* Top Logo */}
            <div className="flex justify-center mb-4">
              <NovaLogo showText={true} />
            </div>

            <p className="text-[10px] uppercase font-extrabold tracking-[0.25em] text-indigo-700 mb-2">
              Certificate of Digital Onboarding Completion
            </p>

            <h3 className="text-xs text-slate-500 font-medium">This is officially presented to</h3>

            <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 my-3 tracking-wide text-indigo-950">
              {employee.name}
            </h2>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
              for successfully executing all mandatory onboarding milestones, identity verification, legal acknowledgements, training modules, and cultural alignment as a <strong>{employee.role}</strong> in the <strong>{employee.department}</strong> division at NOVA Tech.
            </p>

            {/* Badges / Seal Row */}
            <div className="flex items-center justify-center gap-6 my-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mt-1">Verified Pass</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border-2 border-indigo-300 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mt-1">ISO 27001 Aligned</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200/80 text-left">
              <div>
                <p className="font-serif italic text-base text-slate-800 font-semibold">Arjun Mehta</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engineering Director</p>
                <p className="text-[9px] text-slate-400">NOVA Tech Division Head</p>
              </div>

              <div className="text-right">
                <p className="font-serif italic text-base text-slate-800 font-semibold">Priya Sharma</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">People & Culture Lead</p>
                <p className="text-[9px] text-slate-400">Credentials ID: NOVA-{employee.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Issue Date: {employee.joiningDate}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Downloading PDF Certificate for " + employee.name)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
