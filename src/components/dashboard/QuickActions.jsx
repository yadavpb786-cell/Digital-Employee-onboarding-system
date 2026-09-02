import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  UploadCloud, 
  PlayCircle, 
  FileText, 
  Users, 
  MessageSquare,
  ChevronRight 
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const QuickActions = () => {
  const navigate = useNavigate();
  const { setIsHrModalOpen } = useOnboarding();

  const actions = [
    {
      title: 'Complete Profile',
      description: 'Update your personal information & contact details.',
      icon: User,
      color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300',
      path: '/settings'
    },
    {
      title: 'Upload Documents',
      description: 'Submit required onboarding & tax compliance documents.',
      icon: UploadCloud,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300',
      path: '/documents'
    },
    {
      title: 'Start Training',
      description: 'Continue your assigned orientation modules.',
      icon: PlayCircle,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300',
      path: '/training'
    },
    {
      title: 'View Policies',
      description: 'Read NOVA Tech company guidelines & code of conduct.',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300',
      path: '/policies'
    },
    {
      title: 'Meet Your Team',
      description: 'Explore your new squad, org chart, & teammates.',
      icon: Users,
      color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300',
      path: '/team'
    },
    {
      title: 'Contact HR',
      description: 'Get help from Priya Sharma & People Operations.',
      icon: MessageSquare,
      color: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300',
      isAction: true,
      onClick: () => setIsHrModalOpen(true)
    }
  ];

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Shortcuts to manage your onboarding tasks & documents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              onClick={() => action.isAction ? action.onClick() : navigate(action.path)}
              className={`group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-nova-sm hover:shadow-nova-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-2 text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <span>Access Now</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
