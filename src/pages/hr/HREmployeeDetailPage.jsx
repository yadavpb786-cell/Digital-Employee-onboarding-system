import React, { useState, useEffect, Component } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  UserCheck,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  GraduationCap,
  BookOpen,
  Award,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Compass,
  XCircle,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';

class DetailErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("HREmployeeDetailPage error boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <button
            onClick={() => this.props.onBack ? this.props.onBack() : (window.location.href = '/hr/employees')}
            className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Employees</span>
          </button>
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-white">Display Error in Employee Details</h2>
                <p className="text-xs text-rose-200/90 mt-1">
                  An unexpected render exception was caught. Your session remains safe.
                </p>
                <p className="text-[11px] font-mono text-rose-300/80 mt-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  {this.state.error?.message || 'Unknown render error'}
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-3 border-t border-rose-500/20">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => this.props.onBack ? this.props.onBack() : (window.location.href = '/hr/employees')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                <span>Back to Employees</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const HREmployeeDetailInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isHROrAdmin, systemRole } = useAuth();

  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('documents');

  // Verification Modal State
  const [verifyModalDoc, setVerifyModalDoc] = useState(null);
  const [verifyAction, setVerifyAction] = useState('Verified');
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccessMsg, setVerifySuccessMsg] = useState('');

  const handleOpenVerifyModal = (doc, action) => {
    setVerifyModalDoc(doc);
    setVerifyAction(action);
    setVerifyRemarks(
      action === 'Verified'
        ? 'Verified & approved by HR Operations.'
        : 'Document copy is blurry or incomplete. Please re-upload a clear copy.'
    );
    setVerifyError('');
  };

  const handleCloseVerifyModal = () => {
    if (isVerifying) return;
    setVerifyModalDoc(null);
    setVerifyRemarks('');
    setVerifyError('');
  };

  const handleConfirmVerification = async () => {
    if (!verifyModalDoc) return;
    setIsVerifying(true);
    setVerifyError('');
    try {
      await onboardingService.verifyDocument(verifyModalDoc.id, verifyAction, verifyRemarks);
      setVerifySuccessMsg(
        `Successfully marked "${verifyModalDoc.name}" as ${verifyAction === 'Verified' ? 'Approved' : 'Rejected'}.`
      );
      setVerifyModalDoc(null);
      await fetchDetail();
      setTimeout(() => setVerifySuccessMsg(''), 5000);
    } catch (err) {
      setVerifyError(
        err.data?.error || err.data?.detail || err.message || 'Failed to update document verification status.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchDetail = async () => {
    if (!id || id === 'undefined' || id === 'null' || String(id).trim() === '') {
      setError('Please provide a valid employee ID to inspect onboarding progress.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await onboardingService.getHREmployee(id);
      if (!data) {
        setError('No employee records found for this identifier.');
      } else {
        setEmployeeData(data);
      }
    } catch (err) {
      setError(err.data?.error || err.data?.detail || err.message || 'Failed to load employee details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (!isHROrAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <button
          onClick={() => navigate('/hr/dashboard')}
          className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-white">Access Denied (HTTP 403)</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              You must be an HR Manager or Administrator to inspect employee onboarding files.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <button
          onClick={() => navigate('/hr/employees')}
          className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </button>
        <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm font-medium text-slate-200">Retrieving aggregated employee onboarding file...</span>
          <span className="text-xs text-slate-500">Checking milestones, submitted documents, and training curricula</span>
        </div>
      </div>
    );
  }

  if (error || !employeeData) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <button
          onClick={() => navigate('/hr/employees')}
          className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </button>
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white">Employee Record Not Found</h2>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {error || `Unable to locate an onboarding record for employee ID "${id}".`}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Verify that the employee exists in the active directory and has an initialized onboarding profile.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-3 border-t border-rose-500/20">
            <button
              onClick={fetchDetail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => navigate('/hr/employees')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <span>Back to Employees</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const identity = employeeData?.identity || {};
  const onboarding_progress = employeeData?.onboarding_progress || {};
  const documents = Array.isArray(employeeData?.documents) ? employeeData.documents : [];
  const training = Array.isArray(employeeData?.training) ? employeeData.training : [];
  const offer_letter = employeeData?.offer_letter || employeeData?.offerLetter || {};
  const policies = Array.isArray(employeeData?.policies) ? employeeData.policies : [];
  const first_day = Array.isArray(employeeData?.first_day)
    ? employeeData.first_day
    : (Array.isArray(employeeData?.firstDay) ? employeeData.firstDay : []);
  const feedback = employeeData?.feedback || {};
  const is_candidate = Boolean(employeeData?.is_candidate || employeeData?.isCandidate);

  const progressPct = onboarding_progress.overall_percentage ?? onboarding_progress.overallPercentage ?? 0;
  const currentStage = onboarding_progress.current_stage ?? onboarding_progress.currentStage ?? 'N/A';
  const stages = Array.isArray(onboarding_progress.stages) ? onboarding_progress.stages : [];
  const completedStagesCount = onboarding_progress.completed_stages_count ??
    onboarding_progress.completedStagesCount ??
    (Array.isArray(onboarding_progress.completed_stages) ? onboarding_progress.completed_stages.length : 0);
  const totalStagesCount = onboarding_progress.total_stages_count ??
    onboarding_progress.totalStagesCount ??
    (stages.length || 10);

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </span>
      );
    }
    if (s === 'INVITED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Clock className="w-3.5 h-3.5" />
          <span>Invited Candidate</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <Clock className="w-3.5 h-3.5" />
        <span>Onboarding in Progress</span>
      </span>
    );
  };

  const tabs = [
    { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
    { id: 'stages', label: `Onboarding Stages (${completedStagesCount}/${totalStagesCount})`, icon: Compass },
    { id: 'training', label: `Training (${training.length})`, icon: GraduationCap },
    { id: 'policies', label: `Policies (${policies.length})`, icon: BookOpen },
    { id: 'first_day', label: 'First Day & Offer', icon: Calendar },
    { id: 'feedback', label: 'Feedback & NPS', icon: MessageSquare },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hr/employees')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Employees</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/hr/employees" className="hover:text-indigo-400 transition hidden sm:inline">
              Candidates & Employees
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <span className="text-white font-medium">{identity.name || identity.full_name || 'Employee Profile'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDetail}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Header Card: Employee Identity & Progress Hero */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={identity.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
              alt={identity.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30 flex-shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {identity.name || identity.full_name}
                </h1>
                {getStatusBadge(onboarding_progress.status || identity.status)}
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-indigo-500/30 uppercase">
                  {identity.system_role || identity.systemRole}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {identity.job_title || identity.jobTitle} • {identity.department}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 font-mono">
                <span>ID: {identity.employee_id || identity.employeeId}</span>
                <span>•</span>
                <span>{identity.email}</span>
                {identity.joining_date && (
                  <>
                    <span>•</span>
                    <span>Joined: {identity.joining_date}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress Indicator Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center gap-5 min-w-[240px]">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{progressPct}%</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Overall</div>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="text-[11px] text-slate-400">
                Current: <strong className="text-white">{currentStage}</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    progressPct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500">
                {completedStagesCount} of {totalStagesCount} onboarding stages completed
              </div>
            </div>
          </div>
        </div>

        {/* Section A: Detailed Identity & Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Reporting Manager</span>
            <span className="font-semibold text-white">
              {typeof identity.manager === 'object' ? identity.manager?.name : identity.manager || 'Arjun Mehta'}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {typeof identity.manager === 'object' ? identity.manager?.email : 'arjun.mehta@novatech.io'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Contact Phone</span>
            <span className="font-semibold text-white font-mono">
              {identity.profile?.phone || '+91 98765 43210'}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {identity.profile?.city || 'Chandigarh'}, {identity.profile?.state || 'Punjab'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Location & Mode</span>
            <span className="font-semibold text-white truncate block">
              {identity.location || 'NOVA Tech – Chandigarh Office'}
            </span>
            <span className="text-[11px] text-indigo-400 block truncate">
              {identity.work_mode || 'Hybrid (3 Days Office / 2 Days Remote)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Emergency Contact</span>
            <span className="font-semibold text-white">
              {identity.profile?.emergencyContact?.name || identity.profile?.emergency_contact?.name || 'Sunita Kumar'}
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              {identity.profile?.emergencyContact?.phone || identity.profile?.emergency_contact?.phone || '+91 98765 11223'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}

      {/* TAB 1: Documents & Compliance */}
      {activeTab === 'documents' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Required Compliance Documents</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official employee submissions and verification statuses.
              </p>
            </div>
          </div>

          {verifySuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-medium">{verifySuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setVerifySuccessMsg('')}
                className="text-emerald-400 hover:text-white p-0.5 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {documents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No compliance documents on file for this candidate yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Upload Status</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Date & Size</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {documents.map((doc) => {
                    const statusUpper = String(doc.verification_status || doc.verificationStatus || '').toUpperCase();
                    const isVerified = statusUpper === 'VERIFIED';
                    const isRejected = statusUpper === 'REJECTED';
                    const isPending = statusUpper === 'PENDING VERIFICATION';
                    const downloadUrl = doc.download_url || doc.downloadUrl || doc.file_url || doc.fileUrl;
                    const isUploaded = (doc.upload_status || doc.uploadStatus) !== 'Not Uploaded' || Boolean(downloadUrl);

                    return (
                      <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{doc.name}</div>
                          {doc.remarks && <div className="text-[11px] text-slate-400 mt-0.5">{doc.remarks}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {doc.document_type || doc.documentType}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                            {doc.upload_status || doc.uploadStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              isVerified
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : isRejected
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : isPending
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {doc.verification_status || doc.verificationStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {doc.date_str || doc.dateStr || 'N/A'} • {doc.size_str || doc.sizeStr || '1.5 MB'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {downloadUrl ? (
                              <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition"
                                title="Download document file"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                            ) : null}

                            {isHROrAdmin && isUploaded && (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenVerifyModal(doc, 'Verified')}
                                  disabled={isVerifying}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                    isVerified
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 opacity-80'
                                      : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50'
                                  }`}
                                  title="Approve document"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isVerified ? 'Approved' : 'Approve'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenVerifyModal(doc, 'Rejected')}
                                  disabled={isVerifying}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                    isRejected
                                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 opacity-80'
                                      : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/30 hover:border-rose-500/50'
                                  }`}
                                  title="Reject document"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>{isRejected ? 'Rejected' : 'Reject'}</span>
                                </button>
                              </div>
                            )}

                            {!downloadUrl && !isUploaded && (
                              <span className="text-[11px] text-slate-500 italic">Not Uploaded</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Onboarding Stages */}
      {activeTab === 'stages' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Onboarding Stages & Milestones</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed progression across all {totalStagesCount} standardized onboarding modules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stages.map((st) => {
              const isComp = st.is_completed || st.isCompleted;
              return (
                <div
                  key={st.id || st.stage_id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
                    isComp
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isComp
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {st.stage_number || st.stageNumber}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{st.title}</div>
                      <div className="text-[11px] text-slate-400">{st.category} • {st.estimated_time || st.estimatedTime}</div>
                    </div>
                  </div>

                  <div>
                    {isComp ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Training Curriculum */}
      {activeTab === 'training' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Learning & Training Curriculum</h2>
            <p className="text-xs text-slate-400 mt-0.5">Assigned orientation courses and progress metrics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {training.map((tm) => (
              <div
                key={tm.id || tm.module_id}
                className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{tm.title}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      tm.progress >= 100
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : tm.progress > 0
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {tm.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{tm.description}</div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Duration: {tm.duration}</span>
                    <span className="font-bold text-white">{tm.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        tm.progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${tm.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Policies & Governance */}
      {activeTab === 'policies' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Company Policy Acknowledgements</h2>
            <p className="text-xs text-slate-400 mt-0.5">Corporate compliance and digital sign-offs.</p>
          </div>

          <div className="space-y-3">
            {policies.map((p) => {
              const ack = p.acknowledged;
              return (
                <div
                  key={p.id || p.policy_id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{p.title}</div>
                    <div className="text-[11px] text-slate-400">{p.category} • Read time: {p.read_time || p.readTime}</div>
                  </div>
                  <div>
                    {ack ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: First Day & Offer */}
      {activeTab === 'first_day' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offer Letter Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Offer Letter Status</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Acceptance Status:</span>
                <span
                  className={`font-semibold px-2.5 py-0.5 rounded-full text-[10px] ${
                    offer_letter.is_accepted || offer_letter.isAccepted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {offer_letter.is_accepted || offer_letter.isAccepted ? 'Accepted & Signed' : 'Pending Acceptance'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Digital Signature:</span>
                <span className="font-semibold text-white font-mono">{offer_letter.signature || 'None'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Reference Number:</span>
                <span className="font-mono text-slate-300">{offer_letter.ref_no || offer_letter.refNo || 'NOVA/OFFER/2026/0894'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Signed Timestamp:</span>
                <span className="text-slate-300">{offer_letter.accepted_at || offer_letter.acceptedAt || 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* First Day Orientation */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Day 1 Schedule Orientation</h2>
            </div>
            <div className="space-y-3">
              {first_day.map((session) => (
                <div
                  key={session.id || session.session_id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">{session.title}</div>
                    <div className="text-[11px] text-slate-400">{session.time_slot || session.timeSlot} • Host: {session.host}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 uppercase">
                    {session.status || 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Feedback & NPS */}
      {activeTab === 'feedback' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Onboarding Experience & Feedback</h2>
            <p className="text-xs text-slate-400 mt-0.5">Candidate survey responses and satisfaction metrics.</p>
          </div>

          {feedback.is_submitted || feedback.isSubmitted ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Net Promoter Score (NPS)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Submitted on: {feedback.submitted_at || feedback.submittedAt}</div>
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {feedback.nps_score ?? feedback.npsScore ?? 10}/10
                </div>
              </div>

              {feedback.comments && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Employee Comments</div>
                  <p className="text-slate-200 italic leading-relaxed">"{feedback.comments}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Candidate has not submitted the final onboarding feedback survey yet.
            </div>
          )}
        </div>
      )}

      {/* Verification Confirmation Modal */}
      {verifyModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-0"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b ${
                verifyAction === 'Verified'
                  ? 'bg-emerald-950/30 border-emerald-500/20'
                  : 'bg-rose-950/30 border-rose-500/20'
              } flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    verifyAction === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {verifyAction === 'Verified' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {verifyAction === 'Verified' ? 'Approve Document' : 'Reject Document'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {verifyAction === 'Verified'
                      ? 'Confirm document compliance for this employee.'
                      : 'Flag document issues and request candidate re-upload.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseVerifyModal}
                disabled={isVerifying}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Document Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white text-sm">{verifyModalDoc.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Category: {verifyModalDoc.document_type || verifyModalDoc.documentType} • Employee: {identity.name || identity.full_name}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      verifyAction === 'Verified'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    Action: {verifyAction === 'Verified' ? 'Approve' : 'Reject'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Current: {verifyModalDoc.verification_status || verifyModalDoc.verificationStatus || 'Pending'}</span>
                  <span>•</span>
                  <span>{verifyModalDoc.date_str || verifyModalDoc.dateStr || 'Recent upload'}</span>
                </div>
              </div>

              {/* Error Banner */}
              {verifyError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span>{verifyError}</span>
                </div>
              )}

              {/* Remarks Field */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold text-xs">
                  {verifyAction === 'Verified'
                    ? 'Verification Remarks (Optional)'
                    : 'Rejection Reason / Remarks (Required for Candidate)'}
                </label>
                <textarea
                  rows={3}
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                  placeholder={
                    verifyAction === 'Verified'
                      ? 'Add any verification notes (e.g., Verified against original ID)...'
                      : 'Specify why this document is rejected so the employee knows what to fix...'
                  }
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  disabled={isVerifying}
                />
                <p className="text-[11px] text-slate-500">
                  These remarks will be visible to the employee on their Document Management page.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseVerifyModal}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                disabled={isVerifying}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition ${
                  verifyAction === 'Verified'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                } ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {verifyAction === 'Verified' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{verifyAction === 'Verified' ? 'Confirm Approval' : 'Confirm Rejection'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const HREmployeeDetailPage = () => {
  const navigate = useNavigate();
  return (
    <DetailErrorBoundary onBack={() => navigate('/hr/employees')}>
      <HREmployeeDetailInner />
    </DetailErrorBoundary>
  );
};

export default HREmployeeDetailPage;
