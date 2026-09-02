import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, HelpCircle, Heart, Mail } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const HRSupportCard = () => {
  const { employee, setIsHrModalOpen } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 rounded-3xl p-6 shadow-nova-md border border-indigo-100/80 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 mb-3">
          <Heart className="w-4 h-4 fill-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider">People Operations</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Need Help?</h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Your HR team is here to help you during your onboarding journey.
        </p>

        {/* HR Lead Profile Card */}
        <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-nova-sm mb-4">
          <img 
            src={employee.hrSupport.avatar} 
            alt={employee.hrSupport.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0" 
          />
          <div>
            <h4 className="text-xs font-bold text-slate-900">{employee.hrSupport.name}</h4>
            <p className="text-[11px] text-indigo-600 font-medium">{employee.hrSupport.role}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> {employee.hrSupport.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setIsHrModalOpen(true)}
          className="w-full py-2.5 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-nova-sm transition-all flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Message HR</span>
        </button>

        <button
          onClick={() => navigate('/help')}
          className="w-full py-2.5 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Help Center</span>
        </button>
      </div>
    </div>
  );
};
