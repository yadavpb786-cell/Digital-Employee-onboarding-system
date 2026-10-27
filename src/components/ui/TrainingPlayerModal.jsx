import React, { useState } from 'react';
import { X, Play, CheckCircle2, ChevronRight, ChevronLeft, Clock, BookOpen, Sparkles, Award } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const TrainingPlayerModal = ({ course, isOpen, onClose }) => {
  const { updateTrainingProgress, completeTrainingModule } = useOnboarding();
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);

  if (!isOpen || !course) return null;

  const lessons = course.lessons && course.lessons.length > 0 ? course.lessons : [
    { id: '1', title: 'Module Introduction & Key Principles', duration: '5 mins', completed: true },
    { id: '2', title: 'Operational Guidelines & Walkthrough', duration: '10 mins', completed: false },
    { id: '3', title: 'Case Studies & Best Practice Scenarios', duration: '10 mins', completed: false },
    { id: '4', title: 'Module Summary & Knowledge Check', duration: '5 mins', completed: false }
  ];

  const currentLesson = lessons[currentLessonIdx];

  const handleNextLesson = () => {
    const nextIdx = currentLessonIdx + 1;
    if (nextIdx < lessons.length) {
      setCurrentLessonIdx(nextIdx);
      const calculatedProgress = Math.round(((nextIdx + 1) / lessons.length) * 100);
      updateTrainingProgress(course.id, Math.max(course.progress, calculatedProgress));
    } else {
      completeTrainingModule(course.id);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIdx > 0) {
      setCurrentLessonIdx(currentLessonIdx - 1);
    }
  };

  const isLastLesson = currentLessonIdx === lessons.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              {course.category} • Lesson {currentLessonIdx + 1} of {lessons.length}
            </span>
            <h3 className="font-bold text-base mt-1 text-white">{course.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Layout (Content + Lesson Sidebar) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar">
            
            {/* Mock Video / Visual Screen */}
            <div className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-white relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 bg-indigo-500/10 blur-2xl"></div>
              
              <div className="relative z-10 text-center p-4">
                <div className="w-14 h-14 bg-indigo-600/90 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-nova-glow group-hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{currentLesson.title}</h4>
                <p className="text-xs text-indigo-300">Interactive Interactive Learning Slide • {currentLesson.duration}</p>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400">
                <span>HD 1080p • Enterprise LMS</span>
                <span className="text-indigo-400 font-semibold">NOVA Academy 2026</span>
              </div>
            </div>

            {/* Lesson Text Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900">{currentLesson.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Welcome to this session of the <strong>{course.title}</strong> module. As a new team member at NOVA Tech, mastering these workflows ensures security, cross-functional synergy, and alignment with our standard operating procedures.
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl space-y-2">
              <h5 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Key Session Takeaways
              </h5>
              <ul className="text-xs text-indigo-900 space-y-1 list-disc list-inside">
                <li>Follow corporate security principles when accessing internal tools and clusters.</li>
                <li>Reach out to your buddy Neha Kapoor or manager Arjun Mehta for domain-specific questions.</li>
                <li>Complete all module checkpoints before your first sprint planning on Monday.</li>
              </ul>
            </div>
          </div>

          {/* Lesson Navigation Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200/80 p-4 overflow-y-auto shrink-0 flex flex-col justify-between">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Course Curriculum
              </h5>
              <div className="space-y-1.5">
                {lessons.map((lesson, idx) => {
                  const isActive = idx === currentLessonIdx;
                  const isDone = idx < currentLessonIdx || course.progress === 100;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIdx(idx)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                        isActive 
                          ? 'bg-indigo-600 text-white font-semibold shadow-nova-sm' 
                          : isDone 
                          ? 'bg-emerald-50 text-emerald-800 font-medium' 
                          : 'hover:bg-slate-200/70 text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                        ) : (
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                            isActive ? 'border-white text-white' : 'border-slate-400 text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] leading-tight">{lesson.title}</p>
                        <p className={`text-[10px] mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {lesson.duration}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Course Progress status indicator */}
            <div className="pt-4 border-t border-slate-200 mt-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Course Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrevLesson}
            disabled={currentLessonIdx === 0}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                completeTrainingModule(course.id);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              Mark All Complete
            </button>

            <button
              onClick={handleNextLesson}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-1.5"
            >
              {isLastLesson ? (
                <>
                  <Award className="w-4 h-4" />
                  <span>Finish Module</span>
                </>
              ) : (
                <>
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
