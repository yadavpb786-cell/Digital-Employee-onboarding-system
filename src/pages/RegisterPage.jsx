import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { NovaLogo } from '../components/brand/NovaLogo';
import { onboardingService } from '../services/onboardingService';
import { TOKEN_STORAGE_KEY, REFRESH_STORAGE_KEY, USER_STORAGE_KEY } from '../services/authService';
import {
  Lock,
  Mail,
  User,
  Briefcase,
  Building2,
  Calendar,
  UserCheck,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registeredAccount, setRegisteredAccount] = useState(null);

  // Fetch invitation preview on mount if token exists
  useEffect(() => {
    if (!token) {
      setIsLoadingPreview(false);
      setPreviewError('Missing invitation token. Please use the complete registration link provided by HR Operations.');
      return;
    }

    let isMounted = true;
    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      setPreviewError('');
      try {
        const data = await onboardingService.getInvitationPreview(token);
        if (isMounted) {
          setPreviewData(data);
        }
      } catch (err) {
        if (isMounted) {
          const msg = err.data?.error || err.data?.detail || err.message || 'Invalid or expired invitation token.';
          setPreviewError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    fetchPreview();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!password) {
      setSubmitError('Please enter a password.');
      return;
    }

    if (password.length < 8) {
      setSubmitError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onboardingService.acceptInvitation({
        token,
        password,
        confirm_password: confirmPassword,
        confirmPassword,
        phone: phone.trim() || undefined
      });

      // If tokens returned, store in session for seamless onboarding access
      if (response?.access) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.access);
        if (response.refresh) {
          localStorage.setItem(REFRESH_STORAGE_KEY, response.refresh);
        }
        if (response.user) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        }
      }

      setRegisteredAccount(response);
    } catch (err) {
      const msg = err.data?.error || err.data?.detail || err.message || 'Failed to complete registration. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden selection:bg-indigo-500 selection:text-white py-12 px-4 sm:px-6">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3">
            <NovaLogo className="h-11 w-11" showText={true} textClass="text-white text-2xl" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Digital Employee Onboarding Platform
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-xs text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Candidate Registration & Invitation Portal</span>
          </div>
        </div>

        {/* State 1: Loading Preview */}
        {isLoadingPreview && (
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-white">Validating Invitation Link</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto">
              Please wait while we verify your cryptographic token and retrieve your onboarding offer details...
            </p>
          </div>
        )}

        {/* State 2: Preview Error / Invalid / Expired */}
        {!isLoadingPreview && previewError && !registeredAccount && (
          <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex-shrink-0 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Unable to Load Invitation</h2>
                <p className="text-xs sm:text-sm text-red-300/90 mt-2 leading-relaxed">
                  {previewError}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Successfully Registered */}
        {registeredAccount && (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center ring-1 ring-emerald-500/20">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Registration Successful!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Your NOVA Tech employee account has been created. You can now sign in using your credentials to begin your onboarding journey.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Account Name:</span>
                <span className="font-semibold text-white">{registeredAccount.name || previewData?.full_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Username / Email:</span>
                <span className="font-semibold text-indigo-300">{registeredAccount.username || registeredAccount.email}</span>
              </div>
              {registeredAccount.employee_id && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Assigned Employee ID:</span>
                  <span className="font-semibold text-emerald-400">{registeredAccount.employee_id}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-400">
                <span>Assigned Role:</span>
                <span className="font-semibold text-slate-200">EMPLOYEE</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  if (registeredAccount.access) {
                    window.location.href = '/onboarding';
                  } else {
                    navigate('/login?email=' + encodeURIComponent(registeredAccount.email || ''));
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Onboarding Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/login?email=' + encodeURIComponent(registeredAccount.email || ''))}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* State 4: Form Setup (Preview Valid & Not Yet Registered) */}
        {!isLoadingPreview && !previewError && !registeredAccount && previewData && (
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Create Your Employee Account</h1>
              <p className="text-xs text-slate-400 mt-1">
                Your invitation details have been verified by NOVA Tech HR Operations. Set up your secure password to complete activation.
              </p>
            </div>

            {/* Read-only Invitation Controlled Details */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Invitation Verified Details</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                  Read Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Candidate Name</span>
                    <span className="font-semibold text-slate-100">{previewData.full_name || previewData.fullName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Work Email</span>
                    <span className="font-semibold text-slate-100">{previewData.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <Briefcase className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Designation / Role</span>
                    <span className="font-semibold text-slate-100">{previewData.job_title || previewData.jobTitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <Building2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Department</span>
                    <span className="font-semibold text-slate-100">{previewData.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Joining Date</span>
                    <span className="font-semibold text-slate-100">{previewData.joining_date || previewData.joiningDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <UserCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Reporting Manager</span>
                    <span className="font-semibold text-slate-100">{previewData.manager}</span>
                  </div>
                </div>
              </div>

              {previewData.expires_at && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-amber-400/90">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Invitation expires on: {new Date(previewData.expires_at || previewData.expiresAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="flex-1">{submitError}</span>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password (min. 8 characters)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Optional Phone */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Contact Phone Number <span className="text-slate-500">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password Guidelines Note */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-400" />
                <span>
                  Password must be at least 8 characters long, cannot be entirely numeric, and should avoid common easily guessed words.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Employee Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500">
              Already have an active account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
                Sign in here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
