import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle2, 
  Heart, 
  Sparkles, 
  Award,
  ThumbsUp,
  Smile,
  RotateCcw
} from 'lucide-react';

export const FeedbackPage = () => {
  const { feedback, submitFeedback } = useOnboarding();
  
  const [ratings, setRatings] = useState(feedback.ratings || {
    journey: 5,
    documentation: 5,
    support: 5,
    training: 5
  });
  const [npsScore, setNpsScore] = useState(feedback.npsScore || 9);
  const [comments, setComments] = useState(feedback.comments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      submitFeedback({ ratings, npsScore, comments });
      setIsSubmitting(false);
    }, 600);
  };

  const ratingCategories = [
    { key: 'journey', label: 'Overall Onboarding Experience', desc: 'Clarity of the 10 milestones and dashboard guidance' },
    { key: 'documentation', label: 'Document Submission & Verification', desc: 'Ease of uploading identity and payroll records' },
    { key: 'support', label: 'HR & IT Support Responsiveness', desc: 'Helpfulness and communication from Priya & team' },
    { key: 'training', label: 'Learning & Policy Modules', desc: 'Quality and engagement of the training curriculum' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-3xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Continuous Improvement • Stage 9</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Onboarding Feedback</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Help us refine the digital onboarding journey for upcoming engineering cohorts at NOVA Tech.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {feedback.isSubmitted ? (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Submitted
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200">
              Your Voice Matters
            </span>
          )}
        </div>
      </div>

      {/* Submitted State Display */}
      {feedback.isSubmitted ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-nova-md text-center space-y-6">
          
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Feedback Received
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your responses have been recorded on {feedback.submittedAt || 'Today'}. This feedback enables our People Operations team to continuously elevate new hire orientation.
            </p>
          </div>

          {/* Submitted Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-lg mx-auto">
            {ratingCategories.map(cat => (
              <div key={cat.key} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 truncate">{cat.label.split(' ')[0]}</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-black text-slate-900">{ratings[cat.key]}/5</span>
                </div>
              </div>
            ))}
          </div>

          {/* Submitted comment preview */}
          {feedback.comments && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-lg mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Your Written Feedback:</p>
              <p className="text-xs text-slate-700 italic">"{feedback.comments}"</p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => submitFeedback({ ...feedback, isSubmitted: false })}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Edit / Resubmit Feedback</span>
            </button>
          </div>
        </div>

      ) : (

        /* Active Feedback Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-nova-md space-y-8">
          
          {/* Section 1: Multi-dimension 5-Star Ratings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Experience Ratings (1 to 5 Stars)
            </h4>

            <div className="space-y-4">
              {ratingCategories.map((cat) => {
                const currentVal = ratings[cat.key] || 5;

                return (
                  <div 
                    key={cat.key} 
                    className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{cat.label}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(cat.key, star)}
                          className={`p-1.5 rounded-lg transition-transform active:scale-95 ${
                            star <= currentVal
                              ? 'text-amber-500'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5 w-6 text-right">
                        {currentVal}/5
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: NPS Recommendation Score (1 to 10) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Recommendation Score (NPS)
              </h4>
              <span className="text-xs font-bold text-indigo-600">Selected: {npsScore}/10</span>
            </div>

            <p className="text-xs text-slate-600">
              How likely are you to recommend NOVA Tech to a peer or fellow software engineer?
            </p>

            <div className="grid grid-cols-10 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setNpsScore(score)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    score === npsScore
                      ? 'bg-indigo-600 text-white shadow-nova-sm scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>1 - Not Likely</span>
              <span>10 - Extremely Likely</span>
            </div>
          </div>

          {/* Section 3: Comments & Suggestions */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Comments & Suggestions
            </h4>
            <textarea
              rows="4"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What worked exceptionally well during your onboarding? Are there any tools or documentation you would recommend improving?"
              className="w-full px-4 py-3 text-xs text-slate-800 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Submitting marks Stage 9 as complete and finalizes your onboarding journey.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
