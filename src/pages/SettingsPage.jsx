import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  User, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Laptop, 
  Clock, 
  Shield, 
  Loader2,
  Check
} from 'lucide-react';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, systemRole, logout, changePassword } = useAuth();
  const { employee } = useOnboarding();

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentRole = systemRole || user?.system_role || employee?.system_role || 'EMPLOYEE';
  const roleDisplayBadge = {
    EMPLOYEE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    HR_MANAGER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  }[currentRole] || 'bg-indigo-50 text-indigo-700 border-indigo-200';

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password cannot be the same as your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password has been changed successfully! Your session remains active.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err) {
      console.error('[SettingsPage] Change password error:', err);
      setPasswordError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('[SettingsPage] Logout error:', err);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Identity & Access Administration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Account Settings</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your corporate credentials, update your password, and manage active authentication sessions.
          </p>
        </div>

        <button 
          type="button"
          onClick={() => navigate('/profile')}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <User className="w-3.5 h-3.5" />
          <span>View Employee Profile &rarr;</span>
        </button>
      </div>

      {/* SECTION A: Account Identity (Read-Only) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Corporate Account Identity</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Read-Only Credentials
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Username / Login ID
            </p>
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.username || employee?.email || 'rahul.kumar'}
            </p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Work Email Address
            </p>
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.email || employee?.email || 'rahul.kumar@novatech.io'}
            </p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Employee ID
            </p>
            <p className="text-xs font-bold text-slate-900">
              {employee?.employee_id || employee?.employeeId || employee?.id || 'EMP-2026-8941'}
            </p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              System Role / Status
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${roleDisplayBadge}`}>
                {currentRole}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: Security — Change Password */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Security &amp; Password Management</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Encrypted SHA-256 / PBKDF2 Hashed
          </span>
        </div>

        {passwordSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-semibold animate-in fade-in duration-150">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-900 font-semibold animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-2xl">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input 
                type={showCurrentPassword ? 'text' : 'password'}
                required
                disabled={isSubmittingPassword}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-3.5 py-2.5 pr-10 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  disabled={isSubmittingPassword}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={isSubmittingPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2.5 pr-10 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Password security recommendation: Use 8 or more characters with a combination of uppercase letters, lowercase letters, numbers, and symbols.
          </p>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmittingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-nova-sm transition-all flex items-center gap-2"
            >
              {isSubmittingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION C: Active Session & Logout */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-nova-md space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Laptop className="w-4 h-4 text-indigo-600" />
            <span>Active Session &amp; Device Access</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Active Connection
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-200/80">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Current Web Browser Session
              </p>
              <p className="text-[11px] text-slate-500">
                Connected via JWT Bearer Authentication &bull; Token Storage: Browser Encrypted Vault
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
