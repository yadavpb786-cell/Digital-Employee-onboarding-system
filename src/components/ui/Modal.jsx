import React from 'react';
import { X, Send, Clock, MapPin, Calendar, CheckCircle2, User } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const HRMessageModal = () => {
  const { isHrModalOpen, setIsHrModalOpen, employee } = useOnboarding();
  const [message, setMessage] = React.useState('');
  const [sentSuccess, setSentSuccess] = React.useState(false);

  if (!isHrModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setMessage('');
      setIsHrModalOpen(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={employee.hrSupport.avatar} 
              alt={employee.hrSupport.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500" 
            />
            <div>
              <h3 className="font-semibold text-base">Contact HR Support</h3>
              <p className="text-xs text-indigo-300">{employee.hrSupport.name} • {employee.hrSupport.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHrModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {sentSuccess ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Message Sent!</h4>
            <p className="text-xs text-slate-600 mt-1">
              Priya Sharma from People & Culture will respond to your registered email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5">
            <div className="mb-4 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-900 font-medium">
                💬 Need help with documents, IT setup, or onboarding schedule?
              </p>
              <p className="text-[11px] text-indigo-600 mt-0.5">
                {employee.hrSupport.availability}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Message
              </label>
              <textarea 
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi Priya, I have a quick question regarding..."
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
                required
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHrModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-nova-sm flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const FirstDayPlanModal = () => {
  const { isFirstDayModalOpen, setIsFirstDayModalOpen, employee, firstDayPlan } = useOnboarding();

  if (!isFirstDayModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
              Onboarding Schedule
            </span>
            <h3 className="font-bold text-lg mt-1">First Day Action Plan</h3>
            <p className="text-xs text-slate-300">
              {employee.joiningDate} • {employee.joiningTime}
            </p>
          </div>
          <button 
            onClick={() => setIsFirstDayModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location banner */}
        <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-medium">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>{employee.location}</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-900 font-medium">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Manager: {employee.manager.name}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-5 overflow-y-auto space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Day 1 Hourly Breakdown
          </h4>

          <div className="relative border-l-2 border-indigo-200 ml-3 space-y-6">
            {firstDayPlan.map((item, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Timeline node */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                </div>
                <h5 className="text-sm font-semibold text-slate-900">{item.activity}</h5>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsFirstDayModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-nova-sm transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
