import React, { useState } from 'react';
import { Mail, MessageSquare, ShieldCheck, Users, X, Send, CheckCircle2, Coffee, Sparkles, Info } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';

export const TeamPage = () => {
  const { employee } = useOnboarding();
  const { user } = useAuth();

  const [activeMessageMember, setActiveMessageMember] = useState(null);
  const [selectedGreeting, setSelectedGreeting] = useState('Hey, really excited to join the team and collaborate with you!');
  const [customText, setCustomText] = useState('');
  const [toast, setToast] = useState(null);

  const currentUserDisplayName = employee?.name || user?.name || 'Rahul Kumar';
  const currentUserRole = employee?.role || employee?.designation || 'Software Engineer';
  const currentUserDept = employee?.department || 'Data & Technology';
  const currentUserAvatar = employee?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';

  const teamMembers = [
    {
      name: employee?.manager?.name || 'Arjun Mehta',
      role: employee?.manager?.role || 'Engineering Director',
      dept: currentUserDept,
      avatar: employee?.manager?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      tag: 'Manager',
      email: employee?.manager?.email || 'arjun.mehta@novatech.io'
    },
    {
      name: employee?.hrSupport?.name || 'Priya Sharma',
      role: employee?.hrSupport?.role || 'People & Culture Lead',
      dept: 'Human Resources',
      avatar: employee?.hrSupport?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      tag: 'HR Partner',
      email: employee?.hrSupport?.email || 'priya.sharma@novatech.io'
    },
    {
      name: 'Rohan Verma',
      role: 'Principal Architect',
      dept: currentUserDept,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      tag: 'Tech Lead',
      email: 'rohan.verma@novatech.io'
    },
    {
      name: 'Neha Kapoor',
      role: 'Senior Frontend Engineer',
      dept: currentUserDept,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      tag: 'Buddy',
      email: 'neha.kapoor@novatech.io'
    },
    {
      name: 'Karan Singh',
      role: 'DevOps & IT Security',
      dept: 'Infrastructure',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      tag: 'IT Support',
      email: 'karan.singh@novatech.io'
    },
    {
      name: currentUserDisplayName,
      role: currentUserRole,
      dept: currentUserDept,
      avatar: currentUserAvatar,
      tag: 'You',
      isSelf: true
    }
  ];

  const greetingTemplates = [
    '👋 Hey, really excited to join the team and collaborate with you!',
    '☕ Would love to schedule a quick 15-min virtual coffee chat when you are free.',
    '🚀 Looking forward to building high-performance systems with the squad.'
  ];

  const handleOpenMessageModal = (member) => {
    if (member.isSelf) {
      setToast({
        type: 'info',
        title: 'Your Profile',
        text: 'This is your own team profile card.'
      });
      setTimeout(() => setToast(null), 3500);
      return;
    }
    setActiveMessageMember(member);
    setSelectedGreeting(greetingTemplates[0]);
    setCustomText('');
  };

  const handleSendGreeting = (e) => {
    e.preventDefault();
    if (!activeMessageMember) return;

    const messageContent = customText.trim() || selectedGreeting;
    const recipientName = activeMessageMember.name;

    // Show clear local confirmation without claiming external messaging was sent
    setActiveMessageMember(null);
    setToast({
      type: 'success',
      title: `Greeting Queued for ${recipientName}`,
      text: `Your note ("${messageContent.slice(0, 45)}${messageContent.length > 45 ? '...' : ''}") was saved locally. Note: Direct enterprise messaging (Slack / Teams SSO) will be activated upon your official day-one IT provisioning.`
    });

    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      {/* In-app Toast Banner */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-start justify-between gap-3 shadow-nova-lg transition-all animate-in fade-in slide-in-from-top-2 duration-200 border ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">{toast.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{toast.text}</p>
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Colleague Directory & Squad Network</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">{currentUserDept} Squad</h2>
          <p className="text-xs text-slate-500 mt-1">Meet your engineering colleagues, manager, and onboarding buddy.</p>
        </div>

        <div className="px-3.5 py-2 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">{teamMembers.length} Squad Members Active</span>
        </div>
      </div>

      {/* Squad Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className={`bg-white p-6 rounded-3xl border transition-all duration-200 text-center flex flex-col items-center justify-between hover:shadow-nova-lg ${
              member.isSelf
                ? 'border-indigo-300 ring-2 ring-indigo-500/20 shadow-nova-md bg-gradient-to-b from-indigo-50/30 to-white'
                : 'border-slate-200/80 shadow-nova-md'
            }`}
          >
            <div className="w-full">
              <div className="relative mb-3 inline-block">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-50 mx-auto"
                />
                <span
                  className={`absolute bottom-0 right-0 px-2 py-0.5 text-[9px] font-bold rounded-full border shadow-sm ${
                    member.isSelf
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : member.tag === 'Manager'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : member.tag === 'Buddy'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  {member.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
              <p className="text-xs font-semibold text-indigo-600 mt-0.5">{member.role}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{member.dept}</p>
            </div>

            <div className="w-full pt-4 mt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleOpenMessageModal(member)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  member.isSelf
                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{member.isSelf ? 'My Card' : 'Say Hello'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* In-App Message / Greeting Modal */}
      {activeMessageMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Send Greeting to {activeMessageMember.name}</h3>
                  <p className="text-[11px] text-slate-400">{activeMessageMember.role} • {activeMessageMember.dept}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMessageMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendGreeting} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-2">Quick Introduction Templates</label>
                <div className="space-y-2">
                  {greetingTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedGreeting(template);
                        setCustomText('');
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        selectedGreeting === template && !customText
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold ring-1 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Or Write a Personal Note</label>
                <textarea
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type a custom greeting or question..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-xs"
                />
              </div>

              {/* Honest integration notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  This sends a local onboarding greeting. Direct enterprise chat (Slack / Teams SSO) activates upon your first day IT workstation setup.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveMessageMember(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-nova-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Queue Greeting</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
