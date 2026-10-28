import React, { useState, useEffect } from 'react';
import { onboardingService } from '../services/onboardingService';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  Mail,
  User,
  Briefcase,
  Building2,
  Calendar,
  UserCheck,
  Link as LinkIcon,
  Copy,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const InvitationsPage = () => {
  const { isHROrAdmin, systemRole } = useAuth();

  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Create form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [department, setDepartment] = useState('Data & Technology');
  const [joiningDate, setJoiningDate] = useState('2026-10-19');
  const [manager, setManager] = useState('Arjun Mehta');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newlyCreatedInvite, setNewlyCreatedInvite] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [resendingId, setResendingId] = useState(null);
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');

  const fetchInvitations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await onboardingService.getInvitations();
      setInvitations(data);
    } catch (err) {
      setError(err.data?.error || err.data?.detail || err.message || 'Failed to load invitations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    setFormError('');
    setNewlyCreatedInvite(null);

    if (!fullName.trim() || !email.trim()) {
      setFormError('Candidate full name and email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        job_title: jobTitle.trim(),
        jobTitle: jobTitle.trim(),
        department: department.trim(),
        joining_date: joiningDate,
        joiningDate: joiningDate,
        manager: manager.trim()
      };

      const res = await onboardingService.createInvitation(payload);
      if (res && res.email_sent === false) {
        setFormError(res.error || res.detail || 'Invitation email delivery failed via SMTP.');
        return;
      }
      setNewlyCreatedInvite(res);

      // Reset form
      setFullName('');
      setEmail('');

      // Refresh list
      await fetchInvitations();
    } catch (err) {
      setFormError(err.data?.error || err.data?.detail || err.message || 'Failed to generate candidate invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this candidate invitation?')) {
      return;
    }

    try {
      await onboardingService.cancelInvitation(id);
      await fetchInvitations();
    } catch (err) {
      alert(err.data?.error || err.data?.detail || err.message || 'Failed to cancel invitation.');
    }
  };

  const handleResendInvitation = async (id) => {
    setResendingId(id);
    setResendSuccessMsg('');
    try {
      const res = await onboardingService.resendInvitation(id);
      if (res && res.email_sent === false) {
        alert(res.error || res.detail || 'Failed to resend invitation email via SMTP.');
        return;
      }
      setResendSuccessMsg(`Invitation email successfully resent to ${res.email || 'candidate'}.`);
      await fetchInvitations();
      setTimeout(() => setResendSuccessMsg(''), 6000);
    } catch (err) {
      alert(err.data?.error || err.data?.detail || err.message || 'Failed to resend invitation email.');
    } finally {
      setResendingId(null);
    }
  };

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const getStatusBadge = (status, isExpired) => {
    const s = String(status || '').toUpperCase();
    if (s === 'ACCEPTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          <span>ACCEPTED</span>
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
          <Ban className="w-3 h-3" />
          <span>CANCELLED</span>
        </span>
      );
    }
    if (s === 'EXPIRED' || isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3" />
          <span>EXPIRED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3 h-3" />
        <span>PENDING</span>
      </span>
    );
  };

  if (!isHROrAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-rose-400 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-white">Access Denied (HTTP 403)</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Only authorized HR Managers and System Administrators can issue candidate invitations.
              Your current role is <strong className="text-rose-400">{systemRole}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Candidate Invitations</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Issue cryptographically secure registration invitations to onboarding candidates.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInvitations}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Generated Invitation Alert Banner (Dev/Demo Mode) */}
      {newlyCreatedInvite && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 shadow-xl space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5 text-indigo-300 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Invitation Issued & Email Dispatched!</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              Valid for 48 Hours
            </span>
          </div>

          <p className="text-xs text-slate-300">
            A secure registration email was sent to <strong className="text-white">{newlyCreatedInvite.email}</strong> for <strong className="text-white">{newlyCreatedInvite.full_name || newlyCreatedInvite.fullName}</strong>.
            The candidate can click &ldquo;Start Onboarding&rdquo; in their email to activate their account and set their password.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
            <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 truncate">
              {newlyCreatedInvite.invitation_url || newlyCreatedInvite.invitationUrl}
            </div>
            <button
              onClick={() => handleCopyLink(newlyCreatedInvite.invitation_url || newlyCreatedInvite.invitationUrl)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              {copiedToken ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Registration URL</span>
                </>
              )}
            </button>
            <a
              href={newlyCreatedInvite.invitation_url || newlyCreatedInvite.invitationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <span>Test Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Main Grid: Form on Left/Top, List on Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Invitation Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Invite New Candidate</h2>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Candidate Full Name <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanya Malhotra"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Candidate Email <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="candidate@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Job Title / Designation</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Data & Technology">Data & Technology</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Cloud Platform & DevOps">Cloud Platform & DevOps</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Operations">Finance & Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Joining Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reporting Manager</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Arjun Mehta"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Invitation...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>Issue Candidate Invitation</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Invitations List */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Issued Invitations ({invitations.length})
              </h2>
              <span className="text-[11px] text-slate-400">Tokens valid for 48 hours</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {resendSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{resendSuccessMsg}</span>
              </div>
            )}

            {isLoading && (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading invitations...</span>
              </div>
            )}

            {!isLoading && invitations.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No candidate invitations issued yet. Use the form to generate the first invitation.
              </div>
            )}

            {!isLoading && invitations.length > 0 && (
              <div className="space-y-3">
                {invitations.map((inv) => {
                  const statusUpper = (inv.status || '').toUpperCase();
                  const isPending = statusUpper === 'PENDING';
                  const isAccepted = statusUpper === 'ACCEPTED';
                  const isCancelled = statusUpper === 'CANCELLED';
                  return (
                    <div
                      key={inv.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-white text-xs sm:text-sm">
                            {inv.full_name || inv.fullName}
                          </span>
                          {getStatusBadge(inv.status, inv.is_expired || inv.isExpired)}
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>{inv.email}</span>
                          <span>•</span>
                          <span className="text-slate-300">{inv.job_title || inv.jobTitle}</span>
                          <span>•</span>
                          <span className="text-indigo-400">{inv.department}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                          <span>Joining: {inv.joining_date || inv.joiningDate}</span>
                          <span>•</span>
                          <span>Manager: {inv.manager}</span>
                          {inv.created_at && (
                            <>
                              <span>•</span>
                              <span>Issued: {new Date(inv.created_at || inv.createdAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {(!isAccepted && !isCancelled) && (
                          <button
                            onClick={() => handleResendInvitation(inv.id)}
                            disabled={resendingId === inv.id}
                            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                            title="Resend email invitation to candidate"
                          >
                            <Mail className={`w-3.5 h-3.5 ${resendingId === inv.id ? 'animate-spin' : ''}`} />
                            <span>{resendingId === inv.id ? 'Sending...' : 'Resend Email'}</span>
                          </button>
                        )}
                        {isPending && (
                          <button
                            onClick={() => handleCancelInvitation(inv.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition flex items-center gap-1.5"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsPage;
