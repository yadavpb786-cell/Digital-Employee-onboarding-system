import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getValidRedirectPath } from '../utils/roleRouting';
import { NovaLogo } from '../components/brand/NovaLogo';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading, error: authError, clearError, systemRole } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const initialEmail = searchParams.get('email') || location.state?.email || '';

  const [username, setUsername] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Destination to return after login (if requested and authorized)
  const requestedDestination = location.state?.from?.pathname || null;

  // If already authenticated and not loading, redirect to authorized landing page
  if (isAuthenticated && !isAuthLoading) {
    const destination = getValidRedirectPath(requestedDestination, systemRole);
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError?.();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setLocalError('Please enter your username, email, or employee ID.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(trimmedUsername, password);
    setIsSubmitting(false);

    if (result.success) {
      const userRole = result.user?.system_role || result.user?.systemRole || systemRole || 'EMPLOYEE';
      const targetDestination = getValidRedirectPath(requestedDestination, userRole);
      navigate(targetDestination, { replace: true });
    }
  };

  const handleFillDemo = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
    setLocalError('');
    clearError?.();
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-8">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3">
            <NovaLogo className="h-11 w-11" showText={true} textClass="text-white text-2xl" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Digital Employee Onboarding Platform
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-[11px] text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Secure Enterprise Authentication</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white tracking-tight">Sign In to Your Workspace</h1>
            <p className="text-xs text-slate-400 mt-1">
              Access your personalized onboarding journey, documents, and tasks.
            </p>
          </div>

          {/* Error Alert Box */}
          {displayError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-rose-300">Authentication Failed</p>
                <p className="text-[11px] text-rose-400/90 mt-0.5">{displayError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username, Email, or Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setLocalError(''); }}
                  placeholder="e.g. rahul.kumar or rahul.kumar@novatech.io"
                  disabled={isSubmitting}
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLocalError(''); }}
                  placeholder="Enter your account password"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Demo Credentials
              </span>
              <span className="text-[10px] text-slate-500">1-Click Auto Fill</span>
            </div>

            <div className="space-y-2">
              {[
                {
                  name: 'Rahul Kumar',
                  user: 'rahul.kumar',
                  pass: 'NovaTech@2026',
                  role: 'EMPLOYEE',
                  title: 'Software Engineer',
                  initials: 'RK',
                  badgeClass: 'bg-emerald-950/70 border-emerald-800/50 text-emerald-400'
                },
                {
                  name: 'Arjun Mehta',
                  user: 'arjun.mehta',
                  pass: 'NovaTech@2026',
                  role: 'HR_MANAGER',
                  title: 'Engineering Director',
                  initials: 'AM',
                  badgeClass: 'bg-blue-950/70 border-blue-800/50 text-blue-400'
                },
                {
                  name: 'Priya Sharma',
                  user: 'priya.sharma',
                  pass: 'NovaTech@2026',
                  role: 'ADMIN',
                  title: 'People & Culture Lead',
                  initials: 'PS',
                  badgeClass: 'bg-purple-950/70 border-purple-800/50 text-purple-400'
                }
              ].map((acc) => (
                <button
                  key={acc.user}
                  type="button"
                  onClick={() => handleFillDemo(acc.user, acc.pass)}
                  className="w-full p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                        {acc.initials}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white group-hover:text-indigo-300 transition-colors">
                          {acc.name} <span className="text-[10px] font-mono text-slate-400">({acc.user})</span>
                        </p>
                        <p className="text-[10px] text-slate-400">{acc.title}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${acc.badgeClass}`}>
                      {acc.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 NOVA Tech Corporation. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
