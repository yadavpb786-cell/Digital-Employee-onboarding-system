import React from 'react';
import { Mail, MessageSquare, ShieldCheck, Users } from 'lucide-react';

export const TeamPage = () => {
  const teamMembers = [
    { name: 'Arjun Mehta', role: 'Engineering Director', dept: 'Data & Technology', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', tag: 'Manager' },
    { name: 'Priya Sharma', role: 'People & Culture Lead', dept: 'Human Resources', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', tag: 'HR Partner' },
    { name: 'Rohan Verma', role: 'Principal Architect', dept: 'Data & Technology', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', tag: 'Tech Lead' },
    { name: 'Neha Kapoor', role: 'Senior Frontend Engineer', dept: 'Data & Technology', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', tag: 'Buddy' },
    { name: 'Karan Singh', role: 'DevOps & IT Security', dept: 'Infrastructure', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', tag: 'IT Support' },
    { name: 'Rahul Kumar', role: 'Software Engineer', dept: 'Data & Technology', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', tag: 'You' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md">
        <h2 className="text-2xl font-extrabold text-slate-900">Data & Technology Squad</h2>
        <p className="text-xs text-slate-500 mt-1">Meet your engineering colleagues and onboarding buddies.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md text-center flex flex-col items-center justify-between">
            <div>
              <div className="relative mb-3">
                <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-50 mx-auto" />
                <span className="absolute bottom-0 right-1/4 px-1.5 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded">
                  {member.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
              <p className="text-xs font-semibold text-indigo-600 mt-0.5">{member.role}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{member.dept}</p>
            </div>

            <div className="w-full pt-4 mt-4 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => alert(`Saying hello to ${member.name}`)}
                className="flex-1 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
