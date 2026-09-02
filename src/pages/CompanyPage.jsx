import React from 'react';
import { Building2, Globe, Shield, Sparkles, Target, Heart } from 'lucide-react';
import { NovaLogo } from '../components/brand/NovaLogo';

export const CompanyPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-nova-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <NovaLogo showText={true} textClass="text-white" className="h-10 w-auto mb-4" />
          <h2 className="text-3xl font-black text-white mt-2">Empowering Digital Workforce Operations</h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            NOVA Tech builds modern enterprise SaaS solutions for workforce management, employee onboarding, and global HR compliance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Our Mission</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            To streamline employee lifecycles and empower global engineering talent through intuitive technology.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Global Presence</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Headquartered in Chandigarh with engineering hubs in San Francisco, London, and Singapore.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Core Culture</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Transparency, engineering autonomy, continuous learning, and human-first workplace environment.
          </p>
        </div>
      </div>
    </div>
  );
};
