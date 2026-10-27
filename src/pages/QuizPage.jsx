import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const QuizPage = () => {
  const { quizState, submitQuiz, resetQuiz } = useOnboarding();
  const [selectedAnswers, setSelectedAnswers] = useState(quizState.userAnswers || {});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const questions = quizState.questions;
  const currentQ = questions[currentQuestionIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (questionId, optionIdx) => {
    if (quizState.isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuiz(selectedAnswers);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    resetQuiz();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-3xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Assessment • Stage 6</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Onboarding Quiz</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Test your understanding of NOVA Tech workplace policies, core hours, security mandates, and values.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
            Passing Score: 70%
          </span>
        </div>
      </div>

      {/* Quiz State Machine: (A) Result Screen vs (B) Active Quiz Questions */}
      {quizState.isSubmitted ? (
        
        /* Result Screen */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-nova-md text-center space-y-6">
          
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner ${
            quizState.isPassed 
              ? 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50' 
              : 'bg-rose-100 text-rose-600 ring-8 ring-rose-50'
          }`}>
            {quizState.isPassed ? (
              <Award className="w-10 h-10" />
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>

          <div className="space-y-1">
            <span className={`text-[11px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full ${
              quizState.isPassed 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {quizState.isPassed ? 'Assessment Passed' : 'Assessment Failed'}
            </span>

            <h3 className="text-2xl font-black text-slate-900 mt-2">
              {quizState.isPassed ? 'Congratulations! You Passed the Onboarding Quiz' : 'Keep Going! Review and Try Again'}
            </h3>

            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {quizState.isPassed 
                ? 'You have demonstrated a solid understanding of NOVA Tech compliance, culture, and security protocols.'
                : 'You scored below the 70% threshold. Please review your answers and retake the assessment.'}
            </p>
          </div>

          {/* Score summary cards */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {quizState.score} / {totalQuestions}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Percentage</p>
              <p className={`text-2xl font-extrabold mt-1 ${
                quizState.isPassed ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {quizState.percentage}%
              </p>
            </div>
          </div>

          {/* Answer Review Section */}
          <div className="text-left space-y-4 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Answer Review</h4>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userChoice = quizState.userAnswers[q.id];
                const isCorrect = userChoice === q.correctAnswer;

                return (
                  <div 
                    key={q.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-900">
                        {idx + 1}. {q.question}
                      </p>
                      {isCorrect ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          Correct
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 shrink-0">
                          Incorrect
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Your answer: <strong>{q.options[userChoice] || 'Not answered'}</strong>
                    </p>

                    {!isCorrect && (
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Correct answer: {q.options[q.correctAnswer]}
                      </p>
                    )}

                    <p className="text-[10px] text-slate-500 italic bg-white/70 p-2 rounded-lg border border-slate-200/60">
                      Explanation: {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Controls */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRetake}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>

      ) : (

        /* Active Quiz Questions Layout */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-nova-md space-y-6">
          
          {/* Progress bar and counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Question {currentQuestionIdx + 1} of {totalQuestions}</span>
              <span className="text-indigo-600">{answeredCount} of {totalQuestions} Answered</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-100">
              {currentQ.category}
            </span>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>

            {/* Multiple-choice options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((optionText, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(currentQ.id, idx)}
                    className={`p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-150 flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-nova-sm font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSelected ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{optionText}</span>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-white bg-white text-indigo-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Navigator Numbers */}
          <div className="flex items-center justify-center gap-2">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIdx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    isCurrent 
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                      : isAnswered 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={answeredCount < totalQuestions}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Submit Quiz ({answeredCount}/{totalQuestions})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
