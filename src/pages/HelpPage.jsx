import React, { useState } from 'react';
import { HelpCircle, Search, MessageSquare, ChevronDown, Sparkles } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';

export const HelpPage = () => {
  const { user } = useAuth();
  const { employee, setIsHrModalOpen } = useOnboarding();
  const [openFaq, setOpenFaq] = useState(null);

  const firstName = employee?.name
    ? employee.name.trim().split(' ')[0]
    : user?.name
    ? user.name.trim().split(' ')[0]
    : user?.first_name || 'there';

  const hrPartnerName = employee?.hrSupport?.name || 'Priya Sharma';

  const faqs = [
    { q: 'When do I receive my laptop and work credentials?', a: 'Your workstation hardware and 2FA credentials will be assigned during IT Setup on your first day (09:30 AM IST).' },
    { q: 'How do I upload missing payroll and tax documents?', a: 'Navigate to the Documents tab in the left sidebar and click "Upload Custom Document".' },
    { q: 'Can I complete my training modules remotely before day one?', a: 'Yes! All orientation modules in the Training tab are accessible 24/7 on web and mobile.' },
    { q: 'Who is my primary point of contact for onboarding questions?', a: `${hrPartnerName} from People & Culture. Click the "Contact HR" button anytime to message her.` }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-nova-lg">
        <h2 className="text-2xl font-black mb-2">How can we help you, {firstName}?</h2>
        <p className="text-xs text-indigo-200 mb-5">Search our knowledge base or get direct assistance from HR Support.</p>

        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search FAQs, laptop setup, benefits..."
            className="w-full pl-10 pr-4 py-3 text-xs text-slate-900 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-nova-md"
          />
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md">
        <h3 className="text-base font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs text-slate-900 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-indigo-950">Still need help with your onboarding?</h4>
          <p className="text-xs text-indigo-700 mt-0.5">Reach out to {hrPartnerName} and the People Operations team.</p>
        </div>
        <button
          onClick={() => setIsHrModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-nova-sm flex items-center gap-2 transition-all shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message HR Directly</span>
        </button>
      </div>
    </div>
  );
};
