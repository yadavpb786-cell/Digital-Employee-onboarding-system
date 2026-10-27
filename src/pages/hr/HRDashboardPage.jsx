import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Compass,
  CheckCircle2,
  FileText,
  Mail,
  Calendar,
  UserPlus,
  ArrowRight,
  RefreshCw,
  Clock,
  Building2,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const HRDashboardPage = () => {
  const navigate = useNavigate();
  const { isHROrAdmin, systemRole } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await onboardingService.getHRDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.data?.error || err.data?.detail || err.message || 'Failed to load HR dashboard overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!isHROrAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-white">Access Denied (HTTP 403)</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              The HR Portal is restricted to authorized HR Managers and System Administrators.
              Your current role is <strong className="text-rose-400">{systemRole}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: dashboardData?.totalEmployees ?? dashboardData?.total_employees ?? 0,
      icon: Users,
      color: 'indigo',
      desc: 'Active organization staff'
    },
    {
      title: 'Onboarding In Progress',
      value: dashboardData?.onboardingInProgress ?? dashboardData?.onboarding_in_progress ?? 0,
      icon: Compass,
      color: 'amber',
      desc: 'Milestones actively underway'
    },
    {
      title: 'Completed Onboarding',
      value: dashboardData?.completedOnboarding ?? dashboardData?.completed_onboarding ?? 0,
      icon: CheckCircle2,
      color: 'emerald',
      desc: '100% stages finished'
    },
    {
      title: 'Pending Documents',
      value: dashboardData?.pendingDocuments ?? dashboardData?.pending_documents ?? 0,
      icon: FileText,
      color: 'cyan',
      desc: 'Awaiting verification or upload'
    },
    {
      title: 'Pending Invitations',
      value: dashboardData?.pendingInvitations ?? dashboardData?.pending_invitations ?? 0,
      icon: Mail,
      color: 'purple',
      desc: 'Unaccepted candidate invites'
    },
    {
      title: 'Upcoming Joiners',
      value: dashboardData?.upcomingJoiners ?? dashboardData?.upcoming_joiners ?? 0,
      icon: Calendar,
      color: 'rose',
      desc: 'Accepted & pending offers'
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'amber':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          glow: 'from-amber-500/20'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-400',
          glow: 'from-emerald-500/20'
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/20',
          text: 'text-cyan-400',
          glow: 'from-cyan-500/20'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          text: 'text-purple-400',
          glow: 'from-purple-500/20'
        };
      case 'rose':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          text: 'text-rose-400',
          glow: 'from-rose-500/20'
        };
      default:
        return {
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/20',
          text: 'text-indigo-400',
          glow: 'from-indigo-500/20'
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">HR Operations Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                  {systemRole}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Centralized operational metrics and candidate tracking for NOVA Tech onboarding.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboard}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <Link
            to="/invitations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Candidate</span>
          </Link>
          <Link
            to="/hr/employees"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Candidate & Employee Directory</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Operational Count Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const styles = getColorClasses(stat.color);
          return (
            <div
              key={stat.title}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                <div className={`w-9 h-9 rounded-xl ${styles.bg} ${styles.border} border flex items-center justify-center ${styles.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {isLoading ? '...' : stat.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{stat.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Operational Navigation & Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          onClick={() => navigate('/hr/employees')}
          className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 shadow-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">Manage Candidate & Employee Tracking</h3>
          <p className="text-xs text-slate-400 mt-1">
            Search candidates, filter by onboarding status or department, review document submissions, and inspect individual progress stages.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <span>Explore Employee Tracking Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => navigate('/invitations')}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 hover:border-purple-500/60 shadow-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">Candidate Invitation Center</h3>
          <p className="text-xs text-slate-400 mt-1">
            Generate 48-hour cryptographic tokens for new joiners, copy registration links, and track pending invitation acceptances.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-purple-400">
            <span>Issue & Manage Candidate Invitations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Two-Column Operational Activity View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Employees */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Onboarding Activity</h2>
            </div>
            <Link to="/hr/employees" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View All
            </Link>
          </div>

          {isLoading && (
            <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading employees...</span>
            </div>
          )}

          {!isLoading && (() => {
            const recentList = (dashboardData?.recentEmployees || []).filter((emp) => {
              const r = String(emp.systemRole || emp.system_role || 'EMPLOYEE').toUpperCase();
              return r === 'EMPLOYEE' || emp.is_candidate || emp.isCandidate;
            });

            if (recentList.length === 0) {
              return (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No recent employee activity recorded.
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {recentList.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => navigate(`/hr/employees/${emp.id || emp.employeeId}`)}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={emp.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt={emp.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{emp.jobTitle || emp.role} • {emp.department}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-400">{emp.onboardingProgress || emp.onboarding_progress || 0}%</span>
                      <span className="text-[10px] text-slate-500 block">Progress</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
            );
          })()}
        </div>

        {/* Recent Invitations */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Candidate Invitations</h2>
            </div>
            <Link to="/invitations" className="text-xs text-purple-400 hover:text-purple-300 font-medium">
              Manage
            </Link>
          </div>

          {isLoading && (
            <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading invitations...</span>
            </div>
          )}

          {!isLoading && (!dashboardData?.recentInvitations || dashboardData.recentInvitations.length === 0) && (
            <div className="py-8 text-center text-slate-500 text-xs">
              No recent invitations issued.
            </div>
          )}

          {!isLoading && dashboardData?.recentInvitations?.length > 0 && (
            <div className="space-y-3">
              {dashboardData.recentInvitations.map((inv) => {
                const isPending = (inv.status || '').toUpperCase() === 'PENDING';
                const isAccepted = (inv.status || '').toUpperCase() === 'ACCEPTED';
                return (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">{inv.fullName || inv.full_name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isAccepted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{inv.email} • {inv.department}</div>
                    </div>

                    <div className="text-right flex-shrink-0 text-[11px] text-slate-500">
                      <span>Joining: {inv.joiningDate || inv.joining_date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboardPage;
