import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';
import { useAuth } from '../../context/AuthContext';
import { getDefaultPathForRole } from '../../utils/roleRouting';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Compass,
  CheckCircle2,
  Clock,
  Mail,
  Bell,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit2,
  Power,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  FileText,
  Sliders,
  Calendar,
  Building2,
  X,
  Briefcase,
  AlertTriangle,
  UserPlus,
  Copy,
  Check
} from 'lucide-react';

export const AdminPortalPage = () => {
  const { user, isAdmin, systemRole } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'config' | 'audit'

  // Dashboard Overview state
  const [dashboardData, setDashboardData] = useState(null);
  const [isDashLoading, setIsDashLoading] = useState(true);

  // User Management state
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Modals state
  const [detailUser, setDetailUser] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newSelectedRole, setNewSelectedRole] = useState('');
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Quick Invitation Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    fullName: '',
    email: '',
    jobTitle: 'Software Engineer',
    department: 'Data & Technology',
    joiningDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    manager: 'Arjun Mehta'
  });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [createdInvite, setCreatedInvite] = useState(null);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState(false);

  // Configuration state
  const [configData, setConfigData] = useState(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [stageFormData, setStageFormData] = useState({ title: '', estimated_time: '', description: '', is_active: true });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditCount, setAuditCount] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Global message banner
  const [bannerMessage, setBannerMessage] = useState(null);

  const showBanner = (type, text) => {
    setBannerMessage({ type, text });
    setTimeout(() => {
      setBannerMessage(null);
    }, 6000);
  };

  // 1. Fetch Dashboard Overview
  const fetchDashboard = useCallback(async () => {
    setIsDashLoading(true);
    try {
      const data = await onboardingService.getAdminDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      showBanner('error', err.data?.error || err.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsDashLoading(false);
    }
  }, []);

  // 2. Fetch Users
  const fetchUsers = useCallback(async (page = currentPage) => {
    setIsUsersLoading(true);
    try {
      const params = {
        page,
        page_size: 15,
        search: searchQuery,
        role: roleFilter,
        status: statusFilter
      };
      const res = await onboardingService.getAdminUsers(params);
      setUsers(res.results || []);
      setUserCount(res.count || 0);
      setTotalPages(res.total_pages || res.totalPages || 1);
      setCurrentPage(res.current_page || res.currentPage || page);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      showBanner('error', err.data?.error || err.message || 'Failed to load users.');
    } finally {
      setIsUsersLoading(false);
    }
  }, [currentPage, searchQuery, roleFilter, statusFilter]);

  // 3. Fetch Configuration
  const fetchConfiguration = useCallback(async () => {
    setIsConfigLoading(true);
    try {
      const res = await onboardingService.getAdminConfiguration();
      setConfigData(res);
    } catch (err) {
      console.error('Failed to load configuration:', err);
      showBanner('error', err.data?.error || err.message || 'Failed to load system configuration.');
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  // 4. Fetch Audit Logs
  const fetchAuditLogs = useCallback(async (page = auditPage) => {
    setIsAuditLoading(true);
    try {
      const params = {
        page,
        page_size: 15,
        action: auditActionFilter,
        search: auditSearch
      };
      const res = await onboardingService.getAdminAuditLogs(params);
      setAuditLogs(res.results || []);
      setAuditCount(res.count || 0);
      setAuditTotalPages(res.total_pages || res.totalPages || 1);
      setAuditPage(res.current_page || res.currentPage || page);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      showBanner('error', err.data?.error || err.message || 'Failed to load audit logs.');
    } finally {
      setIsAuditLoading(false);
    }
  }, [auditPage, auditActionFilter, auditSearch]);

  // Load initial data
  useEffect(() => {
    if (isAdmin) {
      fetchDashboard();
    }
  }, [isAdmin, fetchDashboard]);

  // Switch tabs
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'users') {
      fetchUsers(1);
    } else if (activeTab === 'config') {
      fetchConfiguration();
    } else if (activeTab === 'audit') {
      fetchAuditLogs(1);
    } else if (activeTab === 'overview') {
      fetchDashboard();
    }
  }, [activeTab, isAdmin, fetchUsers, fetchConfiguration, fetchAuditLogs, fetchDashboard]);

  // Debounced search for users
  useEffect(() => {
    if (activeTab === 'users') {
      const timer = setTimeout(() => {
        fetchUsers(1);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, roleFilter, statusFilter, activeTab, fetchUsers]);

  // Debounced search for audit logs
  useEffect(() => {
    if (activeTab === 'audit') {
      const timer = setTimeout(() => {
        fetchAuditLogs(1);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [auditSearch, auditActionFilter, activeTab, fetchAuditLogs]);

  // Defense-in-depth: Redirect non-admins to their authorized portal
  if (!isAdmin) {
    return <Navigate to={getDefaultPathForRole(systemRole)} replace />;
  }

  // Handle Role Change
  const handleRoleSubmit = async () => {
    if (!roleModalUser || !newSelectedRole) return;
    setIsActionSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await onboardingService.updateUserRole(roleModalUser.id, newSelectedRole);
      setActionSuccess(res.message || 'System role updated successfully.');
      showBanner('success', `Role for ${roleModalUser.username} updated to ${newSelectedRole}.`);
      setRoleModalUser(null);
      fetchUsers(currentPage);
      fetchDashboard();
    } catch (err) {
      const msg = err.data?.error || err.data?.detail || err.message || 'Role update rejected by server.';
      setActionError(msg);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Account Status Toggle (Activate/Deactivate)
  const handleStatusSubmit = async () => {
    if (!statusModalUser) return;
    setIsActionSubmitting(true);
    setActionError('');
    setActionSuccess('');

    const targetStatus = !statusModalUser.is_active;

    try {
      const res = await onboardingService.updateUserStatus(statusModalUser.id, targetStatus);
      setActionSuccess(res.message || `Account successfully set to ${targetStatus ? 'Active' : 'Inactive'}.`);
      showBanner('success', `Account for ${statusModalUser.username} is now ${targetStatus ? 'Active' : 'Inactive'}.`);
      setStatusModalUser(null);
      fetchUsers(currentPage);
      fetchDashboard();
    } catch (err) {
      const msg = err.data?.error || err.data?.detail || err.message || 'Status change rejected by server.';
      setActionError(msg);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Stage Config Update
  const handleSaveStageConfig = async () => {
    if (!editingStage) return;
    setIsActionSubmitting(true);
    setActionError('');

    try {
      await onboardingService.updateAdminStageConfig(editingStage.stage_id, stageFormData);
      showBanner('success', `Stage '${stageFormData.title || editingStage.title}' updated successfully.`);
      setEditingStage(null);
      fetchConfiguration();
    } catch (err) {
      const msg = err.data?.error || err.data?.detail || err.message || 'Failed to update stage configuration.';
      setActionError(msg);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Quick Invitation Generation
  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    setInviteError('');
    setCreatedInvite(null);
    setCopiedInviteUrl(false);

    const { fullName, email, jobTitle, department, joiningDate, manager } = inviteFormData;

    if (!fullName.trim()) {
      setInviteError('Candidate full name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setInviteError('Please provide a valid email address.');
      return;
    }

    setIsInviting(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        job_title: jobTitle.trim() || 'Software Engineer',
        jobTitle: jobTitle.trim() || 'Software Engineer',
        department: department.trim() || 'Data & Technology',
        joining_date: joiningDate || new Date().toISOString().split('T')[0],
        joiningDate: joiningDate || new Date().toISOString().split('T')[0],
        manager: manager.trim() || 'Arjun Mehta'
      };

      const res = await onboardingService.createInvitation(payload);
      setCreatedInvite(res);
      showBanner('success', `Candidate invitation issued and email dispatched to ${res.email || email}.`);
      fetchUsers(1);
    } catch (err) {
      console.error('Failed to issue invitation:', err);
      const msg = err.data?.error || err.data?.detail || err.message || 'Failed to issue candidate invitation.';
      setInviteError(msg);
    } finally {
      setIsInviting(false);
    }
  };

  // Helper for role badges
  const renderRoleBadge = (role) => {
    const r = (role || 'EMPLOYEE').toUpperCase();
    if (r === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Shield className="w-3 h-3 text-rose-400" />
          ADMIN
        </span>
      );
    }
    if (r === 'HR_MANAGER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Briefcase className="w-3 h-3 text-amber-400" />
          HR MANAGER
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <Users className="w-3 h-3 text-indigo-400" />
        EMPLOYEE
      </span>
    );
  };

  // Helper for audit action badges
  const renderAuditActionBadge = (action) => {
    switch (action) {
      case 'ROLE_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">ROLE CHANGE</span>;
      case 'ACCOUNT_ACTIVATED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVATED</span>;
      case 'ACCOUNT_DEACTIVATED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">DEACTIVATED</span>;
      case 'CONFIG_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">CONFIG CHANGE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Global Banner Notification */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
            bannerMessage.type === 'error'
              ? 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {bannerMessage.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <p className="text-sm font-medium">{bannerMessage.text}</p>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Corporate Admin Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">System Administration Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                ADMIN ACCESS ONLY
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Platform governance, live RBAC role assignment, user activation status, onboarding workflow configuration, and security audit log.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine: Active (SimpleJWT + DRF)</span>
            </div>
            <button
              onClick={() => {
                if (activeTab === 'overview') fetchDashboard();
                if (activeTab === 'users') fetchUsers(currentPage);
                if (activeTab === 'config') fetchConfiguration();
                if (activeTab === 'audit') fetchAuditLogs(auditPage);
              }}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
              title="Refresh Current View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'System Overview', icon: Layers },
            { id: 'users', label: 'User & Role Management', icon: Users, badge: userCount > 0 ? userCount : null },
            { id: 'config', label: 'Onboarding Configuration', icon: Sliders },
            { id: 'audit', label: 'Security Audit Logs', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================================== */}
      {/* TAB 1: SYSTEM OVERVIEW                                                         */}
      {/* ============================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Live Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Users',
                value: dashboardData?.total_users ?? dashboardData?.totalUsers ?? '—',
                desc: 'All platform accounts',
                icon: Users,
                color: 'indigo'
              },
              {
                title: 'Total Employees',
                value: dashboardData?.total_employees ?? dashboardData?.totalEmployees ?? '—',
                desc: 'Active identity records',
                icon: UserCheck,
                color: 'cyan'
              },
              {
                title: 'HR Managers',
                value: dashboardData?.hr_managers ?? dashboardData?.hrManagers ?? '—',
                desc: 'Talent partners',
                icon: Briefcase,
                color: 'amber'
              },
              {
                title: 'System Admins',
                value: dashboardData?.admins_count ?? dashboardData?.admins ?? '—',
                desc: 'Root administrative roles',
                icon: Shield,
                color: 'rose'
              },
              {
                title: 'Active Onboarding',
                value: dashboardData?.active_onboarding ?? dashboardData?.activeOnboarding ?? '—',
                desc: 'New hires in progress',
                icon: Compass,
                color: 'blue'
              },
              {
                title: 'Completed Onboarding',
                value: dashboardData?.completed_onboarding ?? dashboardData?.completedOnboarding ?? '—',
                desc: 'Graduated employees',
                icon: CheckCircle2,
                color: 'emerald'
              },
              {
                title: 'Pending Invitations',
                value: dashboardData?.pending_invitations ?? dashboardData?.pendingInvitations ?? '—',
                desc: 'Awaiting registration',
                icon: Mail,
                color: 'amber'
              },
              {
                title: 'Unread Alerts',
                value: dashboardData?.unread_notifications ?? dashboardData?.unreadNotifications ?? '—',
                desc: 'Platform notifications',
                icon: Bell,
                color: 'purple'
              }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-slate-700 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400">{stat.title}</span>
                    <div className="p-2 rounded-xl bg-slate-800/80 text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {isDashLoading ? <div className="h-7 w-12 bg-slate-800 animate-pulse rounded" /> : stat.value}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{stat.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Quick System Information & Recent Admin Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Info Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                System Platform Health
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Version</span>
                  <span className="text-slate-200 font-medium">v1.4.0 (Phase 3 Step 6C)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Auth Engine</span>
                  <span className="text-slate-200 font-medium">SimpleJWT + DRF RBAC</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Database Engine</span>
                  <span className="text-emerald-400 font-medium">SQLite (Fallback) / PostgreSQL</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Active Accounts</span>
                  <span className="text-slate-200 font-medium">{dashboardData?.active_users ?? '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Inactive Accounts</span>
                  <span className="text-slate-200 font-medium">{dashboardData?.inactive_users ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Recent Audit Log Preview */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Recent Administrative Activity
                </h3>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View All Audit Logs →
                </button>
              </div>

              {isDashLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-slate-800 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : dashboardData?.recent_activity?.length > 0 ? (
                <div className="space-y-2.5">
                  {dashboardData.recent_activity.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {renderAuditActionBadge(log.action)}
                          <span className="font-semibold text-slate-200">{log.admin_username || log.adminUsername || 'System'}</span>
                        </div>
                        <p className="text-slate-400">{log.description}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No administrative actions recorded yet. All high-privilege operations will be logged here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 2: USER & ROLE MANAGEMENT                                                  */}
      {/* ============================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search, Filters & Quick Invite Bar */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, employee ID, role..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Role Filter */}
                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All System Roles</option>
                    <option value="ADMIN">Administrators</option>
                    <option value="HR_MANAGER">HR Managers</option>
                    <option value="EMPLOYEE">Employees</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Accounts</option>
                    <option value="INACTIVE">Inactive Accounts</option>
                  </select>
                </div>
              </div>

              {/* Quick Invite User Action */}
              <button
                onClick={() => {
                  setInviteFormData({
                    fullName: '',
                    email: '',
                    jobTitle: 'Software Engineer',
                    department: 'Data & Technology',
                    joiningDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                    manager: 'Arjun Mehta'
                  });
                  setInviteError('');
                  setCreatedInvite(null);
                  setCopiedInviteUrl(false);
                  setIsInviteModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Employee ID</th>
                    <th className="py-3.5 px-4">Job Title & Dept</th>
                    <th className="py-3.5 px-4">System Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {isUsersLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="py-4 px-4">
                          <div className="h-6 bg-slate-800 rounded w-full" />
                        </td>
                      </tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((u) => {
                      const emp = u.employee || {};
                      const jobTitle = emp.job_title || emp.role || emp.designation || 'Staff';
                      const dept = emp.department || 'General';
                      const empId = emp.employee_id || emp.employeeId || '—';
                      const displayName = emp.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* User info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0 overflow-hidden">
                                {emp.avatar ? (
                                  <img src={emp.avatar} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                  displayName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-semibold text-white truncate">{displayName}</p>
                                <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Employee ID */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                              {empId}
                            </span>
                          </td>

                          {/* Job Title & Department (clearly distinguished from system role) */}
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="text-slate-200 font-medium">{jobTitle}</p>
                              <p className="text-[11px] text-slate-400">{dept}</p>
                            </div>
                          </td>

                          {/* System Role */}
                          <td className="py-3.5 px-4">
                            {renderRoleBadge(u.system_role || u.systemRole)}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {u.is_active ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Details button */}
                              <button
                                onClick={async () => {
                                  try {
                                    const fullDetails = await onboardingService.getAdminUserDetail(u.id);
                                    setDetailUser(fullDetails);
                                  } catch (err) {
                                    setDetailUser(u);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="View User Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Change Role button */}
                              <button
                                onClick={() => {
                                  setRoleModalUser(u);
                                  setNewSelectedRole(u.system_role || u.systemRole || 'EMPLOYEE');
                                  setActionError('');
                                }}
                                className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-700/50 hover:bg-indigo-900/80 text-indigo-300 hover:text-white transition-colors"
                                title="Change System Role"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status button */}
                              <button
                                onClick={() => {
                                  setStatusModalUser(u);
                                  setActionError('');
                                }}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  u.is_active
                                    ? 'bg-rose-950/50 border-rose-800/40 text-rose-300 hover:bg-rose-900/80'
                                    : 'bg-emerald-950/50 border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/80'
                                }`}
                                title={u.is_active ? 'Deactivate User Account' : 'Activate User Account'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="font-semibold text-slate-300">No matching users found</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search criteria or role filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
                <span>
                  Showing Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({userCount} total users)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1 || isUsersLoading}
                    onClick={() => fetchUsers(currentPage - 1)}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages || isUsersLoading}
                    onClick={() => fetchUsers(currentPage + 1)}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 3: ONBOARDING STAGES CONFIGURATION                                         */}
      {/* ============================================================================== */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Onboarding Milestone Workflow Configuration
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Review and safely update stage metadata (estimated completion times, descriptions, and active status). Configuration updates never corrupt employee progress milestones.
            </p>

            {isConfigLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 bg-slate-800 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : configData?.stages?.length > 0 ? (
              <div className="space-y-3">
                {configData.stages.map((stg) => (
                  <div
                    key={stg.id || stg.stage_id}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {stg.stage_number || stg.stageNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{stg.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                            {stg.category}
                          </span>
                          {stg.is_active !== false && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{stg.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {stg.estimated_time || stg.estimatedTime}
                      </span>
                      <button
                        onClick={() => {
                          setEditingStage(stg);
                          setStageFormData({
                            title: stg.title || '',
                            estimated_time: stg.estimated_time || stg.estimatedTime || '',
                            description: stg.description || '',
                            is_active: stg.is_active !== false
                          });
                          setActionError('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3 h-3 text-indigo-400" />
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No stages loaded. Default stages will be auto-populated upon restart.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 4: SECURITY AUDIT LOGS                                                     */}
      {/* ============================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Filter Bar */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit descriptions, administrators, or target IDs..."
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Action Types</option>
                  <option value="ROLE_CHANGE">Role Changes</option>
                  <option value="ACCOUNT_ACTIVATED">Account Activations</option>
                  <option value="ACCOUNT_DEACTIVATED">Account Deactivations</option>
                  <option value="CONFIG_CHANGE">Configuration Changes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Administrator</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Target</th>
                    <th className="py-3.5 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {isAuditLoading ? (
                    [1, 2, 3, 4].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="py-4 px-4">
                          <div className="h-6 bg-slate-800 rounded w-full" />
                        </td>
                      </tr>
                    ))
                  ) : auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {log.created_at || log.createdAt ? new Date(log.created_at || log.createdAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-200">{log.admin_username || log.adminUsername || 'System'}</span>
                        </td>
                        <td className="py-3 px-4">
                          {renderAuditActionBadge(log.action)}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                          {log.target_type || log.targetType} #{log.target_id || log.targetId || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-md">
                          {log.description}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="font-semibold text-slate-300">No audit logs matching query</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {auditTotalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
                <span>
                  Page <strong className="text-white">{auditPage}</strong> of <strong className="text-white">{auditTotalPages}</strong> ({auditCount} total records)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={auditPage <= 1 || isAuditLoading}
                    onClick={() => fetchAuditLogs(auditPage - 1)}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={auditPage >= auditTotalPages || isAuditLoading}
                    onClick={() => fetchAuditLogs(auditPage + 1)}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL: USER DETAILS                                                            */}
      {/* ============================================================================== */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {detailUser.employee?.name || detailUser.username}
                  </h3>
                  <p className="text-xs text-slate-400">{detailUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailUser(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-slate-400">System Role</span>
                <p className="font-semibold text-white">{detailUser.system_role || detailUser.systemRole}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-slate-400">Account Status</span>
                <p className="font-semibold text-white">{detailUser.is_active ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-slate-400">Employee ID</span>
                <p className="font-mono text-slate-200">{detailUser.employee?.employee_id || detailUser.employee?.employeeId || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-slate-400">Job Title</span>
                <p className="font-medium text-slate-200">{detailUser.employee?.job_title || detailUser.employee?.role || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-slate-400">Department</span>
                <p className="font-medium text-slate-200">{detailUser.employee?.department || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-slate-400">Joining Date</span>
                <p className="font-medium text-slate-200">{detailUser.employee?.joining_date || detailUser.employee?.joiningDate || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-slate-400">Manager</span>
                <p className="font-medium text-slate-200">
                  {typeof detailUser.employee?.manager === 'object'
                    ? detailUser.employee.manager.name
                    : detailUser.employee?.manager || '—'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-slate-400">Onboarding Progress</span>
                <p className="font-semibold text-indigo-400">
                  {detailUser.employee?.onboarding_progress ?? detailUser.employee?.onboardingProgress ?? 0}%
                </p>
              </div>
            </div>

            {/* Profile Emergency Info if available */}
            {detailUser.employee?.profile && (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contact & Emergency Details</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p>Phone: <span className="text-white">{detailUser.employee.profile.phone || '—'}</span></p>
                  <p>Blood Group: <span className="text-white">{detailUser.employee.profile.blood_group || detailUser.employee.profile.bloodGroup || '—'}</span></p>
                  <p>Emergency Contact: <span className="text-white">{detailUser.employee.profile.emergency_contact_name || detailUser.employee.profile.emergencyContactName || '—'}</span></p>
                  <p>Emergency Phone: <span className="text-white">{detailUser.employee.profile.emergency_contact_phone || detailUser.employee.profile.emergencyContactPhone || '—'}</span></p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL: ROLE CHANGE                                                             */}
      {/* ============================================================================== */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Change System Authorization Role</h3>
              </div>
              <button onClick={() => setRoleModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Assign a new system role for <strong className="text-white">{roleModalUser.username}</strong> ({roleModalUser.email}).
            </p>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              {[
                { role: 'EMPLOYEE', label: 'Employee', desc: 'Standard access to personal onboarding workflow and tasks.' },
                { role: 'HR_MANAGER', label: 'HR Manager', desc: 'Can manage candidate onboarding, verify documents, and review milestones.' },
                { role: 'ADMIN', label: 'System Administrator', desc: 'Full administrative access: user roles, activation, and configurations.' }
              ].map(opt => (
                <label
                  key={opt.role}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    newSelectedRole === opt.role
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="system_role"
                    value={opt.role}
                    checked={newSelectedRole === opt.role}
                    onChange={(e) => setNewSelectedRole(e.target.value)}
                    className="mt-0.5 text-indigo-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-white">{opt.label}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionSubmitting || newSelectedRole === (roleModalUser.system_role || roleModalUser.systemRole)}
                onClick={handleRoleSubmit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40"
              >
                {isActionSubmitting ? 'Updating...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL: STATUS CHANGE (ACTIVATE / DEACTIVATE)                                    */}
      {/* ============================================================================== */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Power className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {statusModalUser.is_active ? 'Deactivate User Account' : 'Reactivate User Account'}
                </h3>
              </div>
              <button onClick={() => setStatusModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to {statusModalUser.is_active ? 'deactivate' : 'reactivate'} the account for{' '}
              <strong className="text-white">{statusModalUser.username}</strong> ({statusModalUser.email})?
            </p>

            {statusModalUser.is_active && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Deactivating this account will prevent the user from logging in or making API requests. System guardrails prevent deactivating the last active administrator.
                </span>
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionSubmitting}
                onClick={handleStatusSubmit}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg disabled:opacity-40 ${
                  statusModalUser.is_active
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {isActionSubmitting
                  ? 'Processing...'
                  : statusModalUser.is_active
                  ? 'Confirm Deactivation'
                  : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL: STAGE CONFIGURATION EDIT                                                */}
      {/* ============================================================================== */}
      {editingStage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Configure Stage {editingStage.stage_number}</h3>
              <button onClick={() => setEditingStage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                {actionError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Stage Title</label>
                <input
                  type="text"
                  value={stageFormData.title}
                  onChange={(e) => setStageFormData({ ...stageFormData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  value={stageFormData.estimated_time}
                  onChange={(e) => setStageFormData({ ...stageFormData, estimated_time: e.target.value })}
                  placeholder="e.g. 15 mins"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={stageFormData.description}
                  onChange={(e) => setStageFormData({ ...stageFormData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="stage-active-toggle"
                  checked={stageFormData.is_active}
                  onChange={(e) => setStageFormData({ ...stageFormData, is_active: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="stage-active-toggle" className="text-slate-300 cursor-pointer">
                  Stage is Active for new employee workflows
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingStage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionSubmitting}
                onClick={handleSaveStageConfig}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40"
              >
                {isActionSubmitting ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL: INVITE USER / CANDIDATE                                                 */}
      {/* ============================================================================== */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Invite New User / Candidate</h3>
                  <p className="text-[11px] text-slate-400">Generate a secure onboarding invitation and registration link.</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {inviteError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {!createdInvite ? (
              /* Invitation Form */
              <form onSubmit={handleCreateInvitation} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Candidate Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteFormData.fullName}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, fullName: e.target.value })}
                    placeholder="e.g. Sanya Malhotra"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Candidate Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteFormData.email}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                    placeholder="e.g. sanya.malhotra@example.com"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Job Title / Role</label>
                    <input
                      type="text"
                      value={inviteFormData.jobTitle}
                      onChange={(e) => setInviteFormData({ ...inviteFormData, jobTitle: e.target.value })}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Department</label>
                    <input
                      type="text"
                      value={inviteFormData.department}
                      onChange={(e) => setInviteFormData({ ...inviteFormData, department: e.target.value })}
                      placeholder="e.g. Data & Technology"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={inviteFormData.joiningDate}
                      onChange={(e) => setInviteFormData({ ...inviteFormData, joiningDate: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Reporting Manager</label>
                    <input
                      type="text"
                      value={inviteFormData.manager}
                      onChange={(e) => setInviteFormData({ ...inviteFormData, manager: e.target.value })}
                      placeholder="e.g. Arjun Mehta"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  The candidate will be granted standard Employee access to complete onboarding documentation and milestones upon accepting the invitation.
                </p>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isInviting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create & Issue Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success / Result View */
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Invitation Issued & Email Dispatched!</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    An onboarding invitation email has been sent to <strong className="text-white">{createdInvite.email}</strong> ({createdInvite.fullName || createdInvite.full_name}).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-medium">Candidate Registration URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdInvite.invitation_url || createdInvite.invitationUrl || `${window.location.origin}/register?token=${createdInvite.raw_token || createdInvite.rawToken || ''}`}
                      className="w-full bg-slate-950 border border-slate-800 text-indigo-300 px-3 py-2 rounded-xl font-mono text-[11px] focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = createdInvite.invitation_url || createdInvite.invitationUrl || `${window.location.origin}/register?token=${createdInvite.raw_token || createdInvite.rawToken || ''}`;
                        navigator.clipboard?.writeText(url);
                        setCopiedInviteUrl(true);
                        setTimeout(() => setCopiedInviteUrl(false), 3000);
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      title="Copy URL to clipboard"
                    >
                      {copiedInviteUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Generated Employee ID:</span>
                    <span className="font-mono text-slate-200">{createdInvite.employeeId || createdInvite.employee_id || 'Auto-assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validity Window:</span>
                    <span className="text-slate-200 font-medium">48 Hours (Single Use)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Model:</span>
                    <span className="text-emerald-400 font-medium">SHA-256 Hashed (Raw token unpersisted)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedInvite(null);
                      setInviteFormData({
                        fullName: '',
                        email: '',
                        jobTitle: 'Software Engineer',
                        department: 'Data & Technology',
                        joiningDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                        manager: 'Arjun Mehta'
                      });
                      setInviteError('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    Invite Another
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortalPage;
