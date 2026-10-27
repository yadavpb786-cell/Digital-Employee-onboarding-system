import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
  Shield,
  X
} from 'lucide-react';

export const HREmployeesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isHROrAdmin, systemRole } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'EMPLOYEE');
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('department') || 'ALL');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        search: debouncedSearch,
        status: statusFilter,
        role: roleFilter || 'EMPLOYEE',
        department: departmentFilter,
        page: 1,
        page_size: 50
      };
      const res = await onboardingService.getHREmployees(params);
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && Array.isArray(res.results)) {
        list = res.results;
      }

      // Ensure Candidates & Employees list and progress view strictly includes only users whose actual role is EMPLOYEE
      const filtered = list.filter((emp) => {
        const sysRole = String(emp.systemRole || emp.system_role || 'EMPLOYEE').toUpperCase();
        return sysRole === 'EMPLOYEE' || emp.is_candidate || emp.isCandidate;
      });

      setEmployees(filtered);
      setTotalCount(filtered.length);
    } catch (err) {
      setError(err.data?.error || err.data?.detail || err.message || 'Failed to retrieve employee directory.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, roleFilter, departmentFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setRoleFilter('EMPLOYEE');
    setDepartmentFilter('ALL');
  };

  const getStatusBadge = (status, invitationStatus) => {
    const s = String(status || '').toUpperCase();
    const inv = String(invitationStatus || '').toUpperCase();

    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          <span>Completed</span>
        </span>
      );
    }
    if (s === 'INVITED' || inv === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Clock className="w-3 h-3" />
          <span>Invitation Pending</span>
        </span>
      );
    }
    if (inv === 'ACCEPTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Clock className="w-3 h-3" />
          <span>Onboarding (Accepted)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <Clock className="w-3 h-3" />
        <span>Onboarding</span>
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const r = String(role || '').toUpperCase();
    if (r === 'ADMIN') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase">
          Admin
        </span>
      );
    }
    if (r === 'HR_MANAGER') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
          HR Manager
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
        Employee
      </span>
    );
  };

  if (!isHROrAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-white">Access Denied (HTTP 403)</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              You must be an HR Manager or Administrator to view the candidate directory.
              Your current role is <strong className="text-rose-400">{systemRole}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Candidate & Employee Directory</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Track onboarding progress, verify compliance status, and manage employee records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmployees}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, ID, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Status: All Records</option>
              <option value="ONBOARDING">Status: Onboarding in Progress</option>
              <option value="COMPLETED">Status: Completed Onboarding</option>
              <option value="INVITED">Status: Invited Candidates</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="EMPLOYEE">System Role: Employees Only</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Department: All</option>
              <option value="Data & Technology">Data & Technology</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Cloud Platform & DevOps">Cloud Platform & DevOps</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Operations">Finance & Operations</option>
            </select>
          </div>
        </div>

        {/* Results stats & active filter clear */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div>
            Showing <strong className="text-white">{employees.length}</strong> of{' '}
            <strong className="text-white">{totalCount}</strong> records
          </div>
          {(searchTerm || statusFilter !== 'ALL' || roleFilter !== 'ALL' || departmentFilter !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Table / List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {isLoading && (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Loading candidate and employee records...</span>
          </div>
        )}

        {!isLoading && employees.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-xs px-4">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300 text-sm">No employees match your search criteria</p>
            <p className="text-slate-500 mt-1">Try adjusting your search query or filter options above.</p>
          </div>
        )}

        {!isLoading && employees.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Employee</th>
                  <th className="py-3.5 px-4">Role & Dept</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {employees.map((emp) => {
                  const progressPct = emp.onboardingProgress ?? emp.onboarding_progress ?? 0;
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => navigate(`/hr/employees/${emp.id || emp.employeeId}`)}
                      className="hover:bg-slate-800/50 cursor-pointer transition group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                            alt={emp.name}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-white group-hover:text-indigo-300 transition block truncate">
                              {emp.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 block truncate">
                              {emp.employeeId || emp.employee_id} • {emp.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{emp.jobTitle || emp.job_title || emp.role}</div>
                        <div className="text-[11px] text-slate-400">{emp.department}</div>
                      </td>

                      {/* System Role */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(emp.systemRole || emp.system_role)}
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {emp.joiningDate || emp.joining_date}
                      </td>

                      {/* Onboarding Progress */}
                      <td className="py-3.5 px-4">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">Completion</span>
                            <span className="font-bold text-white">{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                progressPct >= 100
                                  ? 'bg-emerald-500'
                                  : progressPct > 0
                                  ? 'bg-indigo-500'
                                  : 'bg-slate-700'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="truncate block max-w-[140px]">
                          {emp.currentStage || emp.current_stage || 'N/A'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(emp.status, emp.invitation_status || emp.invitationStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/hr/employees/${emp.id || emp.employeeId}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white text-xs font-medium transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Progress</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HREmployeesPage;
