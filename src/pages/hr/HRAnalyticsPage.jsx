import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  GraduationCap,
  ShieldCheck,
  Calendar,
  HeartHandshake,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Award,
  Layers,
  Sparkles,
  ArrowUpRight,
  Smile,
  Check,
  X
} from 'lucide-react';

export const HRAnalyticsPage = () => {
  const { isHROrAdmin, systemRole } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await onboardingService.getHRAnalytics();
      setAnalytics(data);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error fetching HR analytics:', err);
      setError(err.data?.error || err.data?.detail || err.message || 'Failed to load HR analytics data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!isHROrAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-white">Access Denied (HTTP 403)</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              HR Analytics & Reporting is restricted to authorized HR Managers and System Administrators.
              Your current role is <strong className="text-rose-400">{systemRole}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const onboarding = analytics?.onboarding || {};
  const documents = analytics?.documents || {};
  const training = analytics?.training || {};
  const policies = analytics?.policies || {};
  const firstDay = analytics?.firstDay || {};
  const feedback = analytics?.feedback || {};
  const candidates = analytics?.candidates || {};
  const monthlyOnboarding = analytics?.monthlyOnboarding || [];
  const stageDistribution = analytics?.stageDistribution || [];

  // Calculation helpers
  const totalEmployees = overview.totalEmployees ?? 0;
  const activeEmployees = overview.activeEmployees ?? 0;
  const inProgressEmployees = overview.onboardingInProgress ?? 0;
  const completedEmployees = overview.completedOnboarding ?? 0;
  const upcomingJoiners = overview.upcomingJoiners ?? 0;
  const avgOnboardingPct = Math.round(onboarding.averageCompletion ?? overview.averageOnboardingProgress ?? 0);

  const docTotal = documents.totalDocuments ?? 0;
  const docVerified = documents.verifiedDocuments ?? 0;
  const docPending = documents.pendingDocuments ?? 0;
  const docRejected = documents.rejectedDocuments ?? 0;
  const docNotUploaded = documents.notUploadedDocuments ?? 0;
  const docUploaded = documents.uploadedDocuments ?? (docTotal - docNotUploaded);
  const docVerifiedPct = docTotal > 0 ? Math.round((docVerified / docTotal) * 100) : 0;

  const trainingTotal = training.totalAssigned ?? 0;
  const trainingCompleted = training.completed ?? 0;
  const trainingInProgress = training.inProgress ?? 0;
  const trainingPending = training.pending ?? 0;
  const trainingAvgPct = Math.round(training.averageCompletion ?? 0);

  const policyTotal = policies.totalPolicies ?? 0;
  const policyAck = policies.acknowledged ?? 0;
  const policyPending = policies.pending ?? 0;
  const policyAckPct = policyTotal > 0 ? Math.round((policyAck / policyTotal) * 100) : 0;

  const sessionTotal = firstDay.totalSessions ?? 0;
  const sessionConfirmed = firstDay.confirmedSessions ?? 0;
  const sessionPending = firstDay.pendingSessions ?? 0;
  const sessionPct = sessionTotal > 0 ? Math.round((sessionConfirmed / sessionTotal) * 100) : 0;

  const inviteTotal = candidates.totalInvitations ?? 0;
  const invitePending = candidates.pendingInvitations ?? 0;
  const inviteAccepted = candidates.acceptedInvitations ?? 0;
  const inviteExpired = candidates.expiredInvitations ?? 0;
  const inviteCancelled = candidates.cancelledInvitations ?? 0;
  const inviteConvPct = inviteTotal > 0 ? Math.round((inviteAccepted / inviteTotal) * 100) : 0;

  // Max count in monthly chart for scale
  const maxMonthlyVal = Math.max(1, ...monthlyOnboarding.map(m => Math.max(m.joined || 0, m.completed || 0)));

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> HR Intelligence
            </span>
            {lastRefreshed && (
              <span className="text-xs text-slate-500">Updated at {lastRefreshed}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            HR Analytics
          </h1>
          <p className="text-slate-400 text-sm">
            Track onboarding performance, employee progress, and HR operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh Data
          </button>
          <Link
            to="/hr/employees"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Users className="w-4 h-4" />
            View Directory
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg transition-colors border border-rose-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !analytics && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-800/40 border border-slate-800" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-2xl bg-slate-800/40 border border-slate-800" />
            <div className="h-80 rounded-2xl bg-slate-800/40 border border-slate-800" />
          </div>
        </div>
      )}

      {/* Main Analytics Content */}
      {analytics && (
        <>
          {/* 2. Overview Operational Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Total Employees */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Staff</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{totalEmployees}</div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {activeEmployees} active accounts
              </p>
            </div>

            {/* In Progress */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400">{inProgressEmployees}</div>
              <p className="text-[11px] text-slate-400 mt-1">Active onboarding</p>
            </div>

            {/* Completed */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400">{completedEmployees}</div>
              <p className="text-[11px] text-slate-400 mt-1">100% finished</p>
            </div>

            {/* Average Onboarding Progress */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Progress</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-cyan-400">{avgOnboardingPct}%</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, avgOnboardingPct))}%` }}
                />
              </div>
            </div>

            {/* Pending Documents */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Docs</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-400">{docPending}</div>
              <p className="text-[11px] text-slate-400 mt-1">Require review</p>
            </div>

            {/* Upcoming Joiners */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Upcoming</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400">{upcomingJoiners}</div>
              <p className="text-[11px] text-slate-400 mt-1">Pending joiners</p>
            </div>
          </div>

          {/* 3. Onboarding Trend & Stage Distribution Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Activity Bar Chart */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Monthly Onboarding Activity
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      New employees joined vs completed onboarding in recent months
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                      Joined
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
                      Completed
                    </div>
                  </div>
                </div>

                {monthlyOnboarding.length === 0 ? (
                  <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs text-center border border-dashed border-slate-800 rounded-xl">
                    <Calendar className="w-8 h-8 text-slate-600 mb-2" />
                    No monthly onboarding historical records logged yet.
                  </div>
                ) : (
                  <div className="pt-6 pb-2">
                    {/* SVG Chart */}
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[400px]">
                        <div className="h-52 flex items-end gap-6 sm:gap-8 px-4 border-b border-slate-800">
                          {monthlyOnboarding.map((item, idx) => {
                            const joinedH = Math.round(((item.joined || 0) / maxMonthlyVal) * 160);
                            const completedH = Math.round(((item.completed || 0) / maxMonthlyVal) * 160);

                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                <div className="w-full flex items-end justify-center gap-1.5 h-[160px]">
                                  {/* Joined Bar */}
                                  <div className="relative flex flex-col items-center">
                                    <div
                                      style={{ height: `${Math.max(4, joinedH)}px` }}
                                      className="w-5 sm:w-6 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                                    />
                                    <span className="text-[10px] text-indigo-300 font-bold mt-1 opacity-80 group-hover:opacity-100">
                                      {item.joined || 0}
                                    </span>
                                  </div>

                                  {/* Completed Bar */}
                                  <div className="relative flex flex-col items-center">
                                    <div
                                      style={{ height: `${Math.max(4, completedH)}px` }}
                                      className="w-5 sm:w-6 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                                    />
                                    <span className="text-[10px] text-emerald-300 font-bold mt-1 opacity-80 group-hover:opacity-100">
                                      {item.completed || 0}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">
                                  {item.month}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Calculated from employee registration and milestone progress timestamps</span>
                <span className="font-semibold text-slate-300">Peak Volume: {maxMonthlyVal}</span>
              </div>
            </div>

            {/* Stage Distribution Breakdown */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      Stage Distribution
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Employee progress across the 10 onboarding milestones
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {stageDistribution.length} Stages
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {stageDistribution.map((stg, i) => {
                    const totalStg = (stg.completed || 0) + (stg.pending || 0);
                    const compPct = totalStg > 0 ? Math.round(((stg.completed || 0) / totalStg) * 100) : 0;

                    return (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                            {stg.stageNumber ? `${stg.stageNumber}. ` : ''}{stg.stage}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            <strong className="text-emerald-400">{stg.completed || 0}</strong> done / <span className="text-slate-400">{stg.pending || 0} pending</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${compPct}%` }}
                            className="bg-emerald-400 h-full rounded-l-full transition-all duration-500"
                            title={`${compPct}% completed`}
                          />
                          <div
                            style={{ width: `${100 - compPct}%` }}
                            className="bg-slate-700 h-full transition-all duration-500"
                            title={`${100 - compPct}% pending`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Completed Stages: <strong className="text-emerald-400">{onboarding.completedStages ?? 0}</strong></span>
                <span>Pending Stages: <strong className="text-amber-400">{onboarding.pendingStages ?? 0}</strong></span>
              </div>
            </div>
          </div>

          {/* 4. Document & Training Compliance Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Verification Analytics */}
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Document Compliance</h2>
                      <p className="text-xs text-slate-400">Verification & review status across records</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-purple-400">{docVerifiedPct}%</div>
                    <span className="text-[11px] text-slate-400 font-medium">Verified Rate</span>
                  </div>
                </div>

                {/* Multi-segment Progress Bar */}
                <div className="mt-4 mb-6">
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                    {docTotal > 0 ? (
                      <>
                        <div
                          style={{ width: `${(docVerified / docTotal) * 100}%` }}
                          className="bg-emerald-400 h-full transition-all duration-500"
                          title={`Verified: ${docVerified}`}
                        />
                        <div
                          style={{ width: `${(docPending / docTotal) * 100}%` }}
                          className="bg-amber-400 h-full transition-all duration-500"
                          title={`Pending: ${docPending}`}
                        />
                        <div
                          style={{ width: `${(docRejected / docTotal) * 100}%` }}
                          className="bg-rose-400 h-full transition-all duration-500"
                          title={`Rejected: ${docRejected}`}
                        />
                        <div
                          style={{ width: `${(docNotUploaded / docTotal) * 100}%` }}
                          className="bg-slate-700 h-full transition-all duration-500"
                          title={`Not Uploaded: ${docNotUploaded}`}
                        />
                      </>
                    ) : (
                      <div className="w-full bg-slate-700 h-full" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Verified ({docVerified})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending ({docPending})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400" /> Rejected ({docRejected})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-600" /> Not Uploaded ({docNotUploaded})
                    </span>
                  </div>
                </div>

                {/* Detail Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Required</span>
                    <div className="text-lg font-bold text-white mt-1">{docTotal}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Uploaded</span>
                    <div className="text-lg font-bold text-indigo-400 mt-1">{docUploaded}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Verified</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">{docVerified}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending</span>
                    <div className="text-lg font-bold text-amber-400 mt-1">{docPending}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">Manage employee files directly in directory</span>
                <Link to="/hr/employees" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                  View Employee Documents <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Training Curriculum Analytics */}
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Training & Learning</h2>
                      <p className="text-xs text-slate-400">Assigned modules and completion velocity</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-amber-400">{trainingAvgPct}%</div>
                    <span className="text-[11px] text-slate-400 font-medium">Avg Completion</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 mb-6">
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                    {trainingTotal > 0 ? (
                      <>
                        <div
                          style={{ width: `${(trainingCompleted / trainingTotal) * 100}%` }}
                          className="bg-emerald-400 h-full transition-all duration-500"
                          title={`Completed: ${trainingCompleted}`}
                        />
                        <div
                          style={{ width: `${(trainingInProgress / trainingTotal) * 100}%` }}
                          className="bg-indigo-400 h-full transition-all duration-500"
                          title={`In Progress: ${trainingInProgress}`}
                        />
                        <div
                          style={{ width: `${(trainingPending / trainingTotal) * 100}%` }}
                          className="bg-slate-700 h-full transition-all duration-500"
                          title={`Not Started: ${trainingPending}`}
                        />
                      </>
                    ) : (
                      <div className="w-full bg-slate-700 h-full" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed ({trainingCompleted})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" /> In Progress ({trainingInProgress})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-600" /> Not Started ({trainingPending})
                    </span>
                  </div>
                </div>

                {/* Detail Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Modules</span>
                    <div className="text-lg font-bold text-white mt-1">{trainingTotal}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Completed</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">{trainingCompleted}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">In Progress</span>
                    <div className="text-lg font-bold text-indigo-400 mt-1">{trainingInProgress}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Not Started</span>
                    <div className="text-lg font-bold text-slate-400 mt-1">{trainingPending}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">Covers architecture, engineering & culture</span>
                <span className="text-amber-400 font-semibold">{trainingCompleted} of {trainingTotal} Finished</span>
              </div>
            </div>
          </div>

          {/* 5. Policy Acknowledgements & First Day Readiness */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Policies */}
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Policy Governance</h2>
                    <p className="text-xs text-slate-400">Compliance acknowledgement tracking</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-teal-400">{policyAckPct}%</div>
                  <span className="text-[11px] text-slate-400 font-medium">Signed Rate</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${policyAckPct}%` }}
                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Policies</span>
                    <div className="text-base font-bold text-white mt-1">{policyTotal}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Acknowledged</span>
                    <div className="text-base font-bold text-teal-400 mt-1">{policyAck}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending</span>
                    <div className="text-base font-bold text-amber-400 mt-1">{policyPending}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* First Day Readiness */}
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">First Day Preparation</h2>
                    <p className="text-xs text-slate-400">Orientation session completion and attendance</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-rose-400">{sessionPct}%</div>
                  <span className="text-[11px] text-slate-400 font-medium">Ready</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${sessionPct}%` }}
                    className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Sessions</span>
                    <div className="text-base font-bold text-white mt-1">{sessionTotal}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Confirmed</span>
                    <div className="text-base font-bold text-rose-400 mt-1">{sessionConfirmed}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending</span>
                    <div className="text-base font-bold text-amber-400 mt-1">{sessionPending}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Candidate Pipeline & Feedback Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Pipeline */}
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Candidate Pipeline</h2>
                      <p className="text-xs text-slate-400">Invitations and conversion status</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-400">{inviteConvPct}%</div>
                    <span className="text-[11px] text-slate-400 font-medium">Acceptance Rate</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending</span>
                    <div className="text-lg font-bold text-amber-400 mt-1">{invitePending}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Accepted</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">{inviteAccepted}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Expired</span>
                    <div className="text-lg font-bold text-slate-400 mt-1">{inviteExpired}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Cancelled</span>
                    <div className="text-lg font-bold text-rose-400 mt-1">{inviteCancelled}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Issued: <strong className="text-white">{inviteTotal}</strong></span>
                <Link to="/invitations" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                  Manage Candidate Invitations <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Employee Feedback & NPS */}
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Smile className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Experience & NPS</h2>
                      <p className="text-xs text-slate-400">New joiner satisfaction and NPS rating</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {feedback.totalSubmissions ?? 0} Responses
                  </span>
                </div>

                {(feedback.totalSubmissions ?? 0) === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center my-2">
                    <Smile className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-300">No feedback submissions received yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      New employees submit onboarding NPS ratings after milestone completion.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg NPS Score</span>
                      <div className="text-3xl font-black text-emerald-400 mt-2">
                        {feedback.averageNps ?? 0}
                        <span className="text-xs font-normal text-slate-500"> / 10</span>
                      </div>
                      <span className="text-[11px] text-emerald-300 mt-1 inline-block">
                        {(feedback.averageNps ?? 0) >= 9 ? 'Promoter Grade' : 'Satisfied'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Rating</span>
                      <div className="text-3xl font-black text-amber-400 mt-2">
                        {feedback.averageRating ?? 0}
                        <span className="text-xs font-normal text-slate-500"> / 5.0</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 inline-block">
                        Journey & Support
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Calculated from live submission records</span>
                <span className="font-semibold text-slate-300">Anonymous & Verified</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
