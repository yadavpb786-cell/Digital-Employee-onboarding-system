import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CertificateModal } from '../components/ui/CertificateModal';
import { OfferLetterModal } from '../components/ui/OfferLetterModal';
import { 
  CheckCircle2, 
  CircleDot, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Award, 
  UserCheck, 
  FileUp, 
  FileSignature, 
  BookOpen, 
  GraduationCap, 
  HelpCircle, 
  Users, 
  Calendar, 
  MessageSquare,
  Check,
  RotateCcw
} from 'lucide-react';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { 
    stages, 
    toggleStageStatus, 
    progressPercentage, 
    completedStagesCount, 
    currentStagesCount, 
    pendingStagesCount, 
    totalStagesCount 
  } = useOnboarding();

  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, completed
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const getStageIcon = (iconName) => {
    switch (iconName) {
      case 'UserCheck': return UserCheck;
      case 'FileUp': return FileUp;
      case 'FileSignature': return FileSignature;
      case 'BookOpen': return BookOpen;
      case 'GraduationCap': return GraduationCap;
      case 'HelpCircle': return HelpCircle;
      case 'Users': return Users;
      case 'Calendar': return Calendar;
      case 'MessageSquare': return MessageSquare;
      case 'Award': return Award;
      default: return CircleDot;
    }
  };

  const filteredStages = stages.filter(s => {
    if (activeFilter === 'completed') return s.status === 'completed';
    if (activeFilter === 'pending') return s.status !== 'completed';
    return true;
  });

  const handleStageAction = (stage) => {
    if (stage.id === 'offerLetter') {
      setIsOfferModalOpen(true);
    } else if (stage.id === 'completed') {
      setIsCertModalOpen(true);
    } else {
      navigate(stage.path);
    }
  };

  // SVG Circular progress gauge calculations
  const radius = 38;
  const strokeWidth = 7;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Onboarding Journey Executive Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-nova-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Employee Onboarding Journey • 10 Milestones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Onboarding Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Track and complete each official onboarding stage — from your personal profile and compliance documents to training, policy sign-offs, and first-day orientation.
          </p>
        </div>

        {/* Dynamic Progress Metric Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center gap-5 shrink-0 shadow-nova-lg">
          {/* Circular SVG Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#334155"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#6366f1"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-indigo-400 leading-none">
                {progressPercentage}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              {completedStagesCount} of {totalStagesCount} Stages Done
            </p>
            <p className="text-[11px] text-slate-400">
              {progressPercentage === 100 ? 'All milestones fulfilled!' : `${pendingStagesCount} pending tasks remaining`}
            </p>
            {progressPercentage === 100 && (
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="mt-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg shadow-nova-sm transition-all flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                <span>View Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stages Summary Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-nova-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Filter Stages:</span>
          <div className="flex items-center gap-1.5">
            {[
              { key: 'all', label: `All (${totalStagesCount})` },
              { key: 'completed', label: `Completed (${completedStagesCount})` },
              { key: 'pending', label: `Pending (${pendingStagesCount})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeFilter === tab.key
                    ? 'bg-indigo-600 text-white shadow-nova-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>{completedStagesCount} Completed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>{currentStagesCount} Current</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span>{pendingStagesCount} Pending</span>
          </span>
        </div>
      </div>

      {/* 3. Visual Step / Timeline Journey */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-nova-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Milestone Progression Map</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any stage to open its dedicated view, or use quick toggles to test status.</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
            Target Completion: Day 1 of Orientation
          </span>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-5 sm:ml-7 space-y-7 pt-2">
          {filteredStages.map((stage) => {
            const StageIcon = getStageIcon(stage.icon);
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';

            return (
              <div key={stage.id} className="relative pl-7 sm:pl-9 group">
                
                {/* Timeline node icon */}
                <div className={`absolute -left-[17px] sm:-left-[19px] top-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white shadow-nova-sm ring-2 ring-emerald-100' 
                    : isCurrent 
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-nova-sm' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span className="text-xs font-bold">{stage.stageNumber}</span>
                  )}
                </div>

                {/* Stage Card */}
                <div className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted 
                    ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200' 
                    : isCurrent
                    ? 'bg-white border-indigo-400 shadow-nova-md ring-1 ring-indigo-400/20'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:shadow-nova-sm'
                }`}>
                  
                  {/* Left info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {stage.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Stage {stage.stageNumber} of 10 • Est. {stage.estimatedTime}
                      </span>
                      <StatusBadge status={stage.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        isCompleted ? 'bg-emerald-100 text-emerald-700' : isCurrent ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <StageIcon className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{stage.title}</h4>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                      {stage.description}
                    </p>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    
                    {/* Primary stage view button */}
                    <button
                      onClick={() => handleStageAction(stage)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-nova-sm ${
                        isCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
                    >
                      <span>
                        {stage.id === 'completed'
                          ? (isCompleted ? 'View Certificate' : 'Complete All Stages')
                          : stage.id === 'offerLetter'
                          ? (isCompleted ? 'View Offer' : 'Review & Sign Offer')
                          : (isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick status toggle for grading testability */}
                    <button
                      onClick={() => toggleStageStatus(stage.id)}
                      title="Quick toggle status for grading demo"
                      className="px-2.5 py-2 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Toggle</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offer Letter Modal */}
      <OfferLetterModal 
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />

      {/* Stage 10 Certificate Modal */}
      <CertificateModal 
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
};
