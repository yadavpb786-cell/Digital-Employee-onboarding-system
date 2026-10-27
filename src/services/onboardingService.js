/**
 * NOVA Tech Onboarding Service Layer
 * Enterprise service layer with Mock/Live Adapter Strategy Pattern:
 * 
 *       onboardingService
 *              ↓
 *          mode check (VITE_USE_MOCK_API)
 *           ↙       ↘
 *      Mock API   Live API
 *                   ↓
 *              Django REST API (apiClient)
 * 
 * Provides 100% API compatibility with both live Django backend
 * and standalone offline mock mode.
 */

import { apiClient } from './apiClient';
import {
  mockEmployeeData,
  initialDocumentsData,
  initialPoliciesData,
  initialOfferLetterData,
  initialQuizData,
  initialFirstDayTimeline,
  initialFeedbackData,
  onboardingStagesList,
  mockTrainingModules
} from '../data/onboardingData';

const isMockMode = () => import.meta.env.VITE_USE_MOCK_API === 'true';

// ==============================================================================
// 1. In-Memory Mock Store (for VITE_USE_MOCK_API=true)
// ==============================================================================
const createMockStore = () => ({
  employee: { ...mockEmployeeData },
  documents: [...initialDocumentsData],
  offerLetter: { ...initialOfferLetterData },
  policies: [...initialPoliciesData],
  trainings: [...mockTrainingModules],
  quiz: [...initialQuizData],
  firstDay: [...initialFirstDayTimeline],
  feedback: { ...initialFeedbackData },
  stages: [...onboardingStagesList],
  quizSubmissions: [],
  invitations: [],
  notifications: [
    {
      id: 1,
      type: 'DOCUMENT_VERIFIED',
      notificationType: 'DOCUMENT_VERIFIED',
      title: 'Identity Document Verified',
      message: 'Your PAN card verification has been approved by the HR Compliance team.',
      actionUrl: '/documents',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      readAt: null
    },
    {
      id: 2,
      type: 'TRAINING_ASSIGNED',
      notificationType: 'TRAINING_ASSIGNED',
      title: 'New Training Assigned',
      message: 'Architecture & Engineering Standards module is now available.',
      actionUrl: '/training',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      readAt: null
    },
    {
      id: 3,
      type: 'FIRST_DAY_REMINDER',
      notificationType: 'FIRST_DAY_REMINDER',
      title: 'First-Day Orientation Preparation',
      message: 'Review your Day 1 schedule and confirm your orientation plan.',
      actionUrl: '/first-day',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      readAt: new Date().toISOString()
    }
  ]
});

let mockStore = createMockStore();

export const resetMockStore = () => {
  mockStore = createMockStore();
};

// ==============================================================================
// 2. Mock Adapter Strategy
// ==============================================================================
const mockAdapter = {
  async getCurrentEmployee() {
    return { ...mockStore.employee };
  },

  async getProfile() {
    return {
      name: mockStore.employee.name,
      email: mockStore.employee.email,
      phone: mockStore.employee.phone,
      dateOfBirth: mockStore.employee.dateOfBirth,
      bloodGroup: mockStore.employee.bloodGroup || 'O+',
      address: mockStore.employee.address,
      city: mockStore.employee.city,
      state: mockStore.employee.state,
      pincode: mockStore.employee.pincode,
      designation: mockStore.employee.designation || mockStore.employee.role,
      department: mockStore.employee.department,
      emergencyContact: mockStore.employee.emergencyContact,
      isCompleted: true
    };
  },

  async updateProfile(data) {
    mockStore.employee = {
      ...mockStore.employee,
      ...data,
      emergencyContact: data.emergencyContact || mockStore.employee.emergencyContact
    };
    return { success: true, employee: { ...mockStore.employee } };
  },

  async getDocuments() {
    return [...mockStore.documents];
  },

  async uploadDocument(data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const file = isFormData ? data.get('file') : data?.file;
    const rawName = isFormData ? data.get('name') : data?.name;
    const name = rawName || (file && file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'Uploaded Document');
    const type = (isFormData ? data.get('document_type') : (data?.type || data?.document_type)) || 'Identification';
    const sizeStr = file && file.size
      ? (file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`)
      : (data?.size || data?.size_str || '1.8 MB');

    let fakeUrl = null;
    if (file && typeof URL !== 'undefined' && URL.createObjectURL) {
      try {
        fakeUrl = URL.createObjectURL(file);
      } catch (e) {
        fakeUrl = null;
      }
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      name,
      type,
      document_type: type,
      uploadStatus: 'Uploaded',
      upload_status: 'Uploaded',
      verificationStatus: 'Pending Verification',
      verification_status: 'Pending Verification',
      date: 'Just now',
      date_str: 'Just now',
      size: sizeStr,
      size_str: sizeStr,
      file_url: fakeUrl,
      fileUrl: fakeUrl,
      remarks: data?.remarks || 'Submitted by employee. Awaiting verification by HR Ops.',
      required: data?.required !== undefined ? data.required : true,
      is_required: data?.required !== undefined ? data.required : true
    };
    mockStore.documents = [newDoc, ...mockStore.documents];
    return newDoc;
  },

  getDocumentDownloadUrl(doc) {
    if (!doc) return null;
    return doc.file_url || doc.fileUrl || null;
  },

  async verifyDocument(id, data, maybeRemarks) {
    let status = 'Verified';
    let remarks = '';

    if (typeof data === 'string') {
      status = data;
      remarks = typeof maybeRemarks === 'string' ? maybeRemarks : (status === 'Verified' ? 'Verified by HR Operations.' : 'Requires re-upload.');
    } else if (data && typeof data === 'object') {
      status = data.verificationStatus || data.verification_status || 'Verified';
      remarks = data.remarks ?? (typeof maybeRemarks === 'string' ? maybeRemarks : (status === 'Verified' ? 'Verified by HR Operations.' : 'Requires re-upload.'));
    }

    mockStore.documents = mockStore.documents.map(d =>
      d.id === id ? { ...d, verificationStatus: status, verification_status: status, remarks } : d
    );
    return { success: true, id, verificationStatus: status, verification_status: status, remarks };
  },

  async getOfferLetter() {
    return { ...mockStore.offerLetter };
  },

  async acceptOfferLetter(data) {
    const signature = typeof data === 'string' ? data : data?.signature || mockStore.employee.name;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    mockStore.offerLetter = {
      ...mockStore.offerLetter,
      isAccepted: true,
      acceptedAt: nowStr,
      signature,
      hash: 'SHA256:mock_acceptance_hash_' + Date.now()
    };
    return { ...mockStore.offerLetter };
  },

  async getPolicies() {
    return [...mockStore.policies];
  },

  async acknowledgePolicy(id) {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    mockStore.policies = mockStore.policies.map(p =>
      p.id === id ? { ...p, acknowledged: true, acknowledgedAt: nowStr } : p
    );
    return { success: true, policyId: id, acknowledged: true, acknowledgedAt: nowStr };
  },

  async getTraining() {
    return [...mockStore.trainings];
  },

  async updateTrainingProgress(id, progress) {
    const progVal = Math.min(100, Math.max(0, Number(progress) || 0));
    const status = progVal === 100 ? 'Completed' : progVal > 0 ? 'In Progress' : 'Not Started';
    mockStore.trainings = mockStore.trainings.map(t =>
      t.id === id ? { ...t, progress: progVal, status } : t
    );
    return { success: true, moduleId: id, progress: progVal, status };
  },

  async getQuiz() {
    return [...mockStore.quiz];
  },

  async submitQuiz(answers) {
    let correctCount = 0;
    mockStore.quiz.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correctCount++;
    });
    const total = mockStore.quiz.length || 5;
    const percentage = Math.round((correctCount / total) * 100);
    const isPassed = percentage >= 70;
    const submission = {
      score: correctCount,
      totalQuestions: total,
      percentage,
      isPassed,
      userAnswers: answers,
      attempts: mockStore.quizSubmissions.length + 1,
      isSubmitted: true
    };
    mockStore.quizSubmissions.push(submission);
    return submission;
  },

  async getFirstDay() {
    return [...mockStore.firstDay];
  },

  async updateFirstDaySession(id, data) {
    const status = typeof data === 'string' ? data : data?.status || 'completed';
    mockStore.firstDay = mockStore.firstDay.map(s =>
      s.id === id ? { ...s, status } : s
    );
    return { success: true, sessionId: id, status };
  },

  async confirmFirstDay() {
    return { success: true, confirmed: true };
  },

  async getFeedback() {
    return { ...mockStore.feedback };
  },

  async submitFeedback(data) {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    mockStore.feedback = {
      ...data,
      isSubmitted: true,
      submittedAt: nowStr
    };
    return { ...mockStore.feedback };
  },

  async getStages() {
    return mockStore.stages.filter(s => s.is_active !== false && s.isActive !== false);
  },

  async toggleStage(key) {
    mockStore.stages = mockStore.stages.map(s =>
      s.id === key ? { ...s, isCompleted: !s.isCompleted, status: !s.isCompleted ? 'completed' : 'pending' } : s
    );
    return { success: true, stageId: key };
  },

  async createInvitation(data) {
    const rawToken = 'mock_tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newInv = {
      id: mockStore.invitations.length + 1,
      email: data.email,
      fullName: data.full_name || data.fullName,
      full_name: data.full_name || data.fullName,
      employeeId: 'EMP-2026-' + String(1000 + mockStore.invitations.length + 1),
      employee_id: 'EMP-2026-' + String(1000 + mockStore.invitations.length + 1),
      jobTitle: data.job_title || data.jobTitle || 'Software Engineer',
      job_title: data.job_title || data.jobTitle || 'Software Engineer',
      department: data.department || 'Data & Technology',
      joiningDate: data.joining_date || data.joiningDate || 'Monday, October 19, 2026',
      joining_date: data.joining_date || data.joiningDate || 'Monday, October 19, 2026',
      manager: data.manager || 'Arjun Mehta',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      rawToken,
      raw_token: rawToken,
      invitationUrl: `${window.location.origin}/register?token=${rawToken}`,
      invitation_url: `${window.location.origin}/register?token=${rawToken}`
    };
    mockStore.invitations.unshift(newInv);
    return newInv;
  },

  async getInvitations() {
    return [...mockStore.invitations];
  },

  async getInvitationPreview(token) {
    const inv = mockStore.invitations.find(i => i.rawToken === token || i.raw_token === token) || {
      fullName: 'New Candidate',
      full_name: 'New Candidate',
      email: 'candidate@example.com',
      jobTitle: 'Software Engineer',
      job_title: 'Software Engineer',
      department: 'Data & Technology',
      joiningDate: 'Monday, October 19, 2026',
      joining_date: 'Monday, October 19, 2026',
      manager: 'Arjun Mehta',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
    };
    return inv;
  },

  async acceptInvitation(data) {
    const token = data?.token;
    const inv = mockStore.invitations.find(i => i.rawToken === token || i.raw_token === token);
    if (inv) {
      inv.status = 'ACCEPTED';
      inv.acceptedAt = new Date().toISOString();
      inv.accepted_at = new Date().toISOString();
    }
    return {
      success: true,
      message: 'Registration successful. Your account has been created.'
    };
  },

  async cancelInvitation(id) {
    const inv = mockStore.invitations.find(i => i.id === Number(id) || i.id === id);
    if (inv) {
      inv.status = 'CANCELLED';
    }
    return { success: true, status: 'CANCELLED' };
  },

  async resendInvitation(id) {
    const inv = mockStore.invitations.find(i => i.id === Number(id) || i.id === id);
    if (inv) {
      inv.status = 'PENDING';
      inv.is_expired = false;
      inv.isExpired = false;
    }
    return { success: true, email_sent: true, status: 'PENDING' };
  },

  async getHRDashboard() {
    const pendingInvCount = mockStore.invitations.filter(i => i.status === 'PENDING').length;
    return {
      totalEmployees: 3,
      total_employees: 3,
      onboardingInProgress: 2,
      onboarding_in_progress: 2,
      completedOnboarding: 1,
      completed_onboarding: 1,
      pendingDocuments: 3,
      pending_documents: 3,
      pendingInvitations: pendingInvCount,
      pending_invitations: pendingInvCount,
      upcomingJoiners: 2,
      upcoming_joiners: 2,
      recentEmployees: [
        {
          id: 1,
          employee_id: 'EMP-2026-8941',
          employeeId: 'EMP-2026-8941',
          name: mockStore.employee.name,
          email: mockStore.employee.email,
          job_title: mockStore.employee.role,
          jobTitle: mockStore.employee.role,
          department: mockStore.employee.department,
          system_role: 'EMPLOYEE',
          systemRole: 'EMPLOYEE',
          joining_date: mockStore.employee.joiningDate,
          joiningDate: mockStore.employee.joiningDate,
          onboarding_progress: 70,
          onboardingProgress: 70,
          status: 'ONBOARDING',
          avatar: mockStore.employee.avatar
        }
      ],
      recentInvitations: mockStore.invitations.slice(0, 5)
    };
  },

  async getHREmployees(params = {}) {
    const defaultList = [
      {
        id: 1,
        employee_id: 'EMP-2026-8941',
        employeeId: 'EMP-2026-8941',
        name: 'Rahul Kumar',
        email: 'rahul.kumar@novatech.io',
        job_title: 'Software Engineer',
        jobTitle: 'Software Engineer',
        department: 'Data & Technology',
        system_role: 'EMPLOYEE',
        systemRole: 'EMPLOYEE',
        joining_date: 'Monday, September 21, 2026',
        joiningDate: 'Monday, September 21, 2026',
        manager: 'Arjun Mehta',
        onboarding_progress: 70,
        onboardingProgress: 70,
        current_stage: 'Policies',
        currentStage: 'Policies',
        status: 'ONBOARDING',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        is_candidate: false,
        isCandidate: false
      },
      {
        id: 2,
        employee_id: 'EMP-2026-1002',
        employeeId: 'EMP-2026-1002',
        name: 'Arjun Mehta',
        email: 'arjun.mehta@novatech.io',
        job_title: 'Engineering Director',
        jobTitle: 'Engineering Director',
        department: 'Data & Technology',
        system_role: 'HR_MANAGER',
        systemRole: 'HR_MANAGER',
        joining_date: 'Jan 15, 2024',
        joiningDate: 'Jan 15, 2024',
        manager: 'Priya Sharma',
        onboarding_progress: 100,
        onboardingProgress: 100,
        current_stage: 'Completed',
        currentStage: 'Completed',
        status: 'COMPLETED',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        is_candidate: false,
        isCandidate: false
      },
      {
        id: 3,
        employee_id: 'EMP-2026-1003',
        employeeId: 'EMP-2026-1003',
        name: 'Priya Sharma',
        email: 'priya.sharma@novatech.io',
        job_title: 'People & Culture Lead',
        jobTitle: 'People & Culture Lead',
        department: 'Human Resources',
        system_role: 'ADMIN',
        systemRole: 'ADMIN',
        joining_date: 'Nov 01, 2023',
        joiningDate: 'Nov 01, 2023',
        manager: 'Executive Board',
        onboarding_progress: 100,
        onboardingProgress: 100,
        current_stage: 'Completed',
        currentStage: 'Completed',
        status: 'COMPLETED',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        is_candidate: false,
        isCandidate: false
      }
    ];

    const candidateItems = mockStore.invitations.map(inv => ({
      id: `inv-${inv.id}`,
      employee_id: inv.employee_id || inv.employeeId,
      employeeId: inv.employee_id || inv.employeeId,
      name: inv.full_name || inv.fullName,
      email: inv.email,
      job_title: inv.job_title || inv.jobTitle,
      jobTitle: inv.job_title || inv.jobTitle,
      department: inv.department,
      system_role: 'EMPLOYEE',
      systemRole: 'EMPLOYEE',
      joining_date: inv.joining_date || inv.joiningDate,
      joiningDate: inv.joining_date || inv.joiningDate,
      manager: inv.manager,
      onboarding_progress: 0,
      onboardingProgress: 0,
      current_stage: 'Invitation Pending',
      currentStage: 'Invitation Pending',
      status: 'INVITED',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      is_candidate: true,
      isCandidate: true,
      expires_at: inv.expires_at,
      expiresAt: inv.expires_at
    }));

    let combined = [...defaultList, ...candidateItems];

    if (params.search) {
      const q = params.search.toLowerCase();
      combined = combined.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.employeeId && i.employeeId.toLowerCase().includes(q)) ||
        (i.jobTitle && i.jobTitle.toLowerCase().includes(q)) ||
        (i.department && i.department.toLowerCase().includes(q))
      );
    }

    if (params.status && params.status !== 'ALL') {
      combined = combined.filter(i => i.status === params.status);
    }

    if (params.role && params.role !== 'ALL') {
      combined = combined.filter(i => (i.systemRole || i.system_role) === params.role);
    }

    if (params.department && params.department !== 'ALL') {
      combined = combined.filter(i => i.department.toLowerCase().includes(params.department.toLowerCase()));
    }

    return {
      count: combined.length,
      totalPages: 1,
      total_pages: 1,
      currentPage: 1,
      current_page: 1,
      pageSize: 20,
      page_size: 20,
      results: combined
    };
  },

  async getHREmployee(id) {
    if (String(id).startsWith('inv-')) {
      const invId = String(id).replace('inv-', '');
      const inv = mockStore.invitations.find(i => String(i.id) === invId) || {
        id: invId,
        full_name: 'Invited Candidate',
        email: 'candidate@example.com',
        job_title: 'Software Engineer',
        department: 'Data & Technology',
        joining_date: 'Oct 19, 2026',
        manager: 'Arjun Mehta',
        status: 'INVITED'
      };
      return {
        isCandidate: true,
        is_candidate: true,
        identity: {
          id: `inv-${inv.id}`,
          employee_id: inv.employee_id || 'PENDING',
          employeeId: inv.employee_id || 'PENDING',
          name: inv.full_name || inv.fullName,
          email: inv.email,
          job_title: inv.job_title || inv.jobTitle,
          jobTitle: inv.job_title || inv.jobTitle,
          department: inv.department,
          manager: { name: inv.manager, role: 'Reporting Manager', email: 'arjun.mehta@novatech.io' },
          joining_date: inv.joining_date || inv.joiningDate,
          joiningDate: inv.joining_date || inv.joiningDate,
          system_role: 'EMPLOYEE',
          systemRole: 'EMPLOYEE',
          status: 'INVITED'
        },
        onboarding_progress: {
          overall_percentage: 0,
          overallPercentage: 0,
          current_stage: 'Invitation Pending',
          currentStage: 'Invitation Pending',
          status: 'INVITED',
          completed_stages: [],
          pending_stages: [],
          stages: []
        },
        documents: [],
        training: [],
        offer_letter: { is_accepted: false },
        policies: [],
        first_day: [],
        feedback: { is_submitted: false }
      };
    }

    return {
      isCandidate: false,
      is_candidate: false,
      identity: {
        id: 1,
        employee_id: 'EMP-2026-8941',
        employeeId: 'EMP-2026-8941',
        name: mockStore.employee.name,
        full_name: mockStore.employee.name,
        email: mockStore.employee.email,
        job_title: mockStore.employee.role,
        jobTitle: mockStore.employee.role,
        designation: mockStore.employee.designation || mockStore.employee.role,
        department: mockStore.employee.department,
        system_role: 'EMPLOYEE',
        systemRole: 'EMPLOYEE',
        joining_date: mockStore.employee.joiningDate,
        joiningDate: mockStore.employee.joiningDate,
        joining_time: mockStore.employee.joiningTime,
        location: mockStore.employee.location,
        work_mode: mockStore.employee.workMode,
        avatar: mockStore.employee.avatar,
        manager: {
          name: mockStore.employee.manager?.name || 'Arjun Mehta',
          role: mockStore.employee.manager?.role || 'Engineering Director',
          email: mockStore.employee.manager?.email || 'arjun.mehta@novatech.io'
        },
        hr_support: {
          name: mockStore.employee.hrSupport?.name || 'Priya Sharma',
          role: mockStore.employee.hrSupport?.role || 'People & Culture Lead',
          email: mockStore.employee.hrSupport?.email || 'priya.sharma@novatech.io'
        },
        profile: {
          phone: mockStore.employee.phone,
          dateOfBirth: mockStore.employee.dateOfBirth,
          bloodGroup: mockStore.employee.bloodGroup,
          address: mockStore.employee.address,
          city: mockStore.employee.city,
          state: mockStore.employee.state,
          pincode: mockStore.employee.pincode,
          emergencyContact: mockStore.employee.emergencyContact,
          isCompleted: true
        }
      },
      onboarding_progress: {
        overall_percentage: 70,
        overallPercentage: 70,
        current_stage: 'Company Policies',
        currentStage: 'Company Policies',
        status: 'ONBOARDING',
        completedStagesCount: 7,
        totalStagesCount: 10,
        completed_stages: mockStore.stages.filter(s => s.isCompleted),
        pending_stages: mockStore.stages.filter(s => !s.isCompleted),
        stages: mockStore.stages
      },
      documents: mockStore.documents,
      training: mockStore.trainings,
      offer_letter: mockStore.offerLetter,
      offerLetter: mockStore.offerLetter,
      policies: mockStore.policies,
      first_day: mockStore.firstDay,
      firstDay: mockStore.firstDay,
      feedback: mockStore.feedback
    };
  },

  async getHRAnalytics() {
    const totalEmployees = 3;
    const completedOnboarding = 1;
    const onboardingInProgress = 2;
    const pendingDocuments = mockStore.documents.filter(d => d.verificationStatus === 'Pending Verification' || d.verificationStatus === 'Not Uploaded').length;
    const verifiedDocuments = mockStore.documents.filter(d => d.verificationStatus === 'Verified').length;
    const uploadedDocuments = mockStore.documents.length - mockStore.documents.filter(d => d.verificationStatus === 'Not Uploaded').length;

    const completedTraining = mockStore.trainings.filter(t => t.status === 'Completed').length;
    const inProgressTraining = mockStore.trainings.filter(t => t.status === 'In Progress').length;
    const pendingTraining = mockStore.trainings.filter(t => t.status === 'Not Started').length;

    const pendingInvites = mockStore.invitations.filter(i => i.status === 'PENDING').length;
    const acceptedInvites = mockStore.invitations.filter(i => i.status === 'ACCEPTED').length;

    return {
      overview: {
        totalEmployees,
        activeEmployees: totalEmployees,
        onboardingInProgress,
        completedOnboarding,
        upcomingJoiners: pendingInvites + acceptedInvites,
        averageOnboardingProgress: 75.0
      },
      onboarding: {
        averageCompletion: 75.0,
        completedStages: 7,
        pendingStages: 3,
        totalStageRecords: 10
      },
      documents: {
        totalDocuments: mockStore.documents.length,
        uploadedDocuments,
        verifiedDocuments,
        pendingDocuments,
        rejectedDocuments: 0,
        notUploadedDocuments: mockStore.documents.filter(d => d.verificationStatus === 'Not Uploaded').length
      },
      training: {
        totalAssigned: mockStore.trainings.length,
        completed: completedTraining,
        inProgress: inProgressTraining,
        pending: pendingTraining,
        averageCompletion: 68.5
      },
      policies: {
        totalPolicies: mockStore.policies.length,
        acknowledged: mockStore.policies.filter(p => p.acknowledged).length,
        pending: mockStore.policies.filter(p => !p.acknowledged).length
      },
      firstDay: {
        totalSessions: mockStore.firstDay.length,
        confirmedSessions: mockStore.firstDay.filter(s => s.status === 'completed').length,
        pendingSessions: mockStore.firstDay.filter(s => s.status !== 'completed').length
      },
      feedback: {
        totalSubmissions: 1,
        averageNps: 9.5,
        averageRating: 4.8
      },
      candidates: {
        totalInvitations: mockStore.invitations.length,
        pendingInvitations: pendingInvites,
        acceptedInvitations: acceptedInvites,
        expiredInvitations: mockStore.invitations.filter(i => i.status === 'EXPIRED').length,
        cancelledInvitations: mockStore.invitations.filter(i => i.status === 'CANCELLED').length
      },
      monthlyOnboarding: [
        { month: '2026-05', joined: 1, completed: 1 },
        { month: '2026-06', joined: 0, completed: 0 },
        { month: '2026-07', joined: 2, completed: 1 },
        { month: '2026-08', joined: 1, completed: 0 },
        { month: '2026-09', joined: 3, completed: 1 }
      ],
      stageDistribution: mockStore.stages.map(s => ({
        stage: s.title,
        stageNumber: s.number,
        category: s.category || 'General',
        completed: s.isCompleted ? 2 : 1,
        pending: s.isCompleted ? 1 : 2
      }))
    };
  },

  async getNotifications(params = {}) {
    let list = [...(mockStore.notifications || [])];
    if (params.unread === true || params.unread === 'true') {
      list = list.filter(n => !n.isRead);
    }
    const page = Math.max(1, parseInt(params.page || 1, 10));
    const pageSize = Math.max(1, parseInt(params.pageSize || params.page_size || 20, 10));
    const start = (page - 1) * pageSize;
    const paginated = list.slice(start, start + pageSize);

    return {
      count: list.length,
      totalPages: Math.max(1, Math.ceil(list.length / pageSize)),
      currentPage: page,
      pageSize,
      results: paginated
    };
  },

  async getUnreadNotificationCount() {
    const count = (mockStore.notifications || []).filter(n => !n.isRead).length;
    return { count };
  },

  async markNotificationRead(id) {
    const notif = (mockStore.notifications || []).find(n => n.id === Number(id) || n.id === id);
    if (notif) {
      notif.isRead = true;
      notif.readAt = new Date().toISOString();
      return { ...notif };
    }
    return { id, isRead: true, readAt: new Date().toISOString() };
  },

  async markAllNotificationsRead() {
    let updated = 0;
    (mockStore.notifications || []).forEach(n => {
      if (!n.isRead) {
        n.isRead = true;
        n.readAt = new Date().toISOString();
        updated++;
      }
    });
    return { updated };
  },

  async getAdminDashboard() {
    return {
      totalUsers: 5,
      total_users: 5,
      totalEmployees: 4,
      total_employees: 4,
      hrManagers: 1,
      hr_managers: 1,
      admins: 2,
      adminsCount: 2,
      admins_count: 2,
      activeUsers: 5,
      active_users: 5,
      inactiveUsers: 0,
      inactive_users: 0,
      activeOnboarding: 3,
      active_onboarding: 3,
      completedOnboarding: 1,
      completed_onboarding: 1,
      pendingInvitations: 1,
      pending_invitations: 1,
      unreadNotifications: 2,
      unread_notifications: 2,
      recentActivity: [
        {
          id: 1,
          admin_username: 'priya.sharma',
          adminUsername: 'priya.sharma',
          admin_name: 'Priya Sharma',
          adminName: 'Priya Sharma',
          action: 'ROLE_CHANGE',
          target_type: 'User',
          target_id: '4',
          description: "System role for 'rahul.kumar' confirmed as EMPLOYEE.",
          createdAt: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ]
    };
  },

  async getAdminUsers(params = {}) {
    const defaultUsers = [
      {
        id: 1,
        username: 'priya.sharma',
        email: 'priya.sharma@novatech.io',
        first_name: 'Priya',
        last_name: 'Sharma',
        is_active: true,
        isActive: true,
        system_role: 'ADMIN',
        systemRole: 'ADMIN',
        date_joined: '2026-08-01T09:00:00Z',
        employee: {
          id: 1,
          employee_id: 'EMP-2026-0001',
          employeeId: 'EMP-2026-0001',
          name: 'Priya Sharma',
          role: 'Head of People & Systems',
          job_title: 'Head of People & Systems',
          jobTitle: 'Head of People & Systems',
          department: 'People & Culture',
          joining_date: 'August 01, 2026',
          joiningDate: 'August 01, 2026',
          onboarding_progress: 100,
          onboardingProgress: 100
        }
      },
      {
        id: 2,
        username: 'arjun.mehta',
        email: 'arjun.mehta@novatech.io',
        first_name: 'Arjun',
        last_name: 'Mehta',
        is_active: true,
        isActive: true,
        system_role: 'HR_MANAGER',
        systemRole: 'HR_MANAGER',
        date_joined: '2026-08-10T09:00:00Z',
        employee: {
          id: 2,
          employee_id: 'EMP-2026-0002',
          employeeId: 'EMP-2026-0002',
          name: 'Arjun Mehta',
          role: 'Engineering Director',
          job_title: 'Engineering Director',
          jobTitle: 'Engineering Director',
          department: 'Data & Technology',
          joining_date: 'August 10, 2026',
          joiningDate: 'August 10, 2026',
          onboarding_progress: 100,
          onboardingProgress: 100
        }
      },
      {
        id: 3,
        username: 'rahul.kumar',
        email: 'rahul.kumar@novatech.io',
        first_name: 'Rahul',
        last_name: 'Kumar',
        is_active: true,
        isActive: true,
        system_role: 'EMPLOYEE',
        systemRole: 'EMPLOYEE',
        date_joined: '2026-09-01T09:00:00Z',
        employee: {
          id: 3,
          employee_id: 'EMP-2026-8941',
          employeeId: 'EMP-2026-8941',
          name: 'Rahul Kumar',
          role: 'Software Engineer',
          job_title: 'Software Engineer',
          jobTitle: 'Software Engineer',
          department: 'Data & Technology',
          joining_date: 'Monday, September 21, 2026',
          joiningDate: 'Monday, September 21, 2026',
          onboarding_progress: 70,
          onboardingProgress: 70
        }
      }
    ];

    let filtered = [...defaultUsers];
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.first_name && u.first_name.toLowerCase().includes(q)) ||
        (u.last_name && u.last_name.toLowerCase().includes(q)) ||
        (u.employee?.name && u.employee.name.toLowerCase().includes(q)) ||
        (u.employee?.job_title && u.employee.job_title.toLowerCase().includes(q)) ||
        (u.employee?.department && u.employee.department.toLowerCase().includes(q))
      );
    }
    if (params.role && params.role !== 'ALL') {
      filtered = filtered.filter(u => u.system_role === params.role);
    }
    if (params.status && params.status !== 'ALL') {
      const wantActive = params.status === 'ACTIVE' || params.status === true || params.status === 'true';
      filtered = filtered.filter(u => u.is_active === wantActive);
    }

    return {
      count: filtered.length,
      totalPages: 1,
      total_pages: 1,
      currentPage: 1,
      current_page: 1,
      pageSize: 20,
      page_size: 20,
      results: filtered
    };
  },

  async getAdminUserDetail(id) {
    const list = (await this.getAdminUsers()).results;
    const found = list.find(u => String(u.id) === String(id));
    return found || list[0];
  },

  async updateUserRole(id, role) {
    return { success: true, message: `System role updated to ${role}.` };
  },

  async updateUserStatus(id, isActive) {
    return { success: true, message: `User status set to ${isActive ? 'Active' : 'Inactive'}.`, is_active: isActive };
  },

  async getAdminAuditLogs(params = {}) {
    return {
      count: 1,
      totalPages: 1,
      total_pages: 1,
      currentPage: 1,
      current_page: 1,
      pageSize: 20,
      page_size: 20,
      results: [
        {
          id: 1,
          admin_username: 'priya.sharma',
          adminUsername: 'priya.sharma',
          admin_name: 'Priya Sharma',
          adminName: 'Priya Sharma',
          action: 'ROLE_CHANGE',
          target_type: 'User',
          target_id: '3',
          description: "System role for 'rahul.kumar' confirmed as EMPLOYEE.",
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ]
    };
  },

  async getAdminConfiguration() {
    return {
      system_info: {
        platformName: 'NOVA Tech Digital Employee Onboarding System',
        version: 'v1.4.0 (Phase 3 Step 6C)',
        environment: 'Production Ready',
        authProvider: 'SimpleJWT + DRF RBAC',
        totalUsers: 5,
        totalEmployees: 4,
        invitationExpiryHours: 48,
        notificationsStatus: 'Active (Database Engine)'
      },
      stages: mockStore.stages || []
    };
  },

  async updateAdminStageConfig(key, data) {
    const stage = (mockStore.stages || []).find(s => s.stage_id === key || s.id === key);
    if (stage) {
      Object.assign(stage, data);
    }
    return { success: true, message: 'Stage configuration updated.', stage: { stage_id: key, ...data } };
  }
};

// ==============================================================================
// 3. Live Adapter Strategy (Django REST API via apiClient)
// ==============================================================================
const liveAdapter = {
  async getCurrentEmployee() {
    const data = await apiClient.get('/auth/me/');
    // Map backend employee to shape expected by all React components
    return {
      ...mockStore.employee,
      ...data,
      id: data.employee_id || mockStore.employee.id,
      employeeId: data.employee_id || mockStore.employee.id,
      name: data.name || mockStore.employee.name,
      email: data.email || mockStore.employee.email,
      role: data.role || data.designation || mockStore.employee.role,
      designation: data.designation || mockStore.employee.designation,
      department: data.department || mockStore.employee.department,
      joiningDate: data.joining_date || mockStore.employee.joiningDate,
      joiningTime: data.joining_time || mockStore.employee.joiningTime,
      location: data.location || mockStore.employee.location,
      workMode: data.work_mode || mockStore.employee.workMode,
      avatar: data.avatar || mockStore.employee.avatar,
      manager: data.manager || mockStore.employee.manager,
      hrSupport: data.hrSupport || mockStore.employee.hrSupport,
      phone: data.profile?.phone || mockStore.employee.phone,
      dateOfBirth: data.profile?.date_of_birth || mockStore.employee.dateOfBirth,
      bloodGroup: data.profile?.blood_group || mockStore.employee.bloodGroup,
      address: data.profile?.address || mockStore.employee.address,
      city: data.profile?.city || mockStore.employee.city,
      state: data.profile?.state || mockStore.employee.state,
      pincode: data.profile?.pincode || mockStore.employee.pincode,
      emergencyContact: {
        name: data.profile?.emergency_contact_name || mockStore.employee.emergencyContact?.name,
        relation: data.profile?.emergency_contact_relation || mockStore.employee.emergencyContact?.relation,
        phone: data.profile?.emergency_contact_phone || mockStore.employee.emergencyContact?.phone
      },
      isProfileCompleted: data.profile?.is_completed !== undefined ? data.profile.is_completed : true
    };
  },

  async getProfile() {
    return await apiClient.get('/profile/');
  },

  async updateProfile(data) {
    return await apiClient.put('/profile/', data);
  },

  async getDocuments() {
    const docs = await apiClient.get('/documents/');
    return Array.isArray(docs) ? docs : docs?.results || [];
  },

  async uploadDocument(data) {
    // If already FormData, send directly
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return await apiClient.post('/documents/', data);
    }

    // If data contains a File or Blob, build a FormData
    if (data?.file && (data.file instanceof File || (typeof Blob !== 'undefined' && data.file instanceof Blob))) {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.name) formData.append('name', data.name);
      const docType = data.type || data.document_type || 'Identification';
      formData.append('document_type', docType);
      formData.append('type', docType);
      if (data.required !== undefined) {
        formData.append('is_required', String(data.required));
      }
      return await apiClient.post('/documents/', formData);
    }

    // Fallback for metadata-only
    const payload = {
      name: data.name,
      type: data.type || data.document_type || 'Identification',
      document_type: data.type || data.document_type || 'Identification',
      size: data.size || data.size_str || '1.8 MB',
      size_str: data.size || data.size_str || '1.8 MB'
    };
    return await apiClient.post('/documents/', payload);
  },

  getDocumentDownloadUrl(doc) {
    if (!doc) return null;
    if (doc.file_url) return doc.file_url;
    if (doc.fileUrl) return doc.fileUrl;
    if (doc.file && typeof doc.file === 'string' && doc.file.startsWith('http')) return doc.file;
    if (doc.id) {
      return `${apiClient.baseUrl}/documents/${doc.id}/download/`;
    }
    return null;
  },

  async verifyDocument(id, data, maybeRemarks) {
    let verificationStatus = 'Verified';
    let remarks = '';

    if (typeof data === 'string') {
      verificationStatus = data;
      remarks = typeof maybeRemarks === 'string' ? maybeRemarks : (verificationStatus === 'Verified' ? 'Verified by HR Operations.' : 'Requires re-upload.');
    } else if (data && typeof data === 'object') {
      verificationStatus = data.verificationStatus || data.verification_status || 'Verified';
      remarks = data.remarks ?? (typeof maybeRemarks === 'string' ? maybeRemarks : (verificationStatus === 'Verified' ? 'Verified by HR Operations.' : 'Requires re-upload.'));
    }

    const payload = {
      verificationStatus,
      verification_status: verificationStatus,
      remarks: remarks || (verificationStatus === 'Verified' ? 'Verified by HR Operations.' : 'Document rejected by HR Operations.')
    };
    return await apiClient.patch(`/documents/${id}/verify/`, payload);
  },

  async getOfferLetter() {
    return await apiClient.get('/offer-letter/');
  },

  async acceptOfferLetter(data) {
    const signature = typeof data === 'string' ? data : data?.signature;
    return await apiClient.post('/offer-letter/accept/', { signature });
  },

  async getPolicies() {
    const policies = await apiClient.get('/policies/');
    return Array.isArray(policies) ? policies : policies?.results || [];
  },

  async acknowledgePolicy(id) {
    return await apiClient.post(`/policies/${id}/acknowledge/`);
  },

  async getTraining() {
    const modules = await apiClient.get('/training/');
    return Array.isArray(modules) ? modules : modules?.results || [];
  },

  async updateTrainingProgress(id, progress) {
    return await apiClient.post(`/training/${id}/progress/`, { progress: Number(progress) });
  },

  async getQuiz() {
    const questions = await apiClient.get('/quiz/');
    return Array.isArray(questions) ? questions : questions?.results || [];
  },

  async submitQuiz(answers) {
    return await apiClient.post('/quiz/submit/', { answers });
  },

  async getFirstDay() {
    const sessions = await apiClient.get('/first-day/');
    return Array.isArray(sessions) ? sessions : sessions?.results || [];
  },

  async updateFirstDaySession(id, data) {
    const payload = typeof data === 'string' ? { status: data } : data;
    return await apiClient.patch(`/first-day/${id}/`, payload);
  },

  async confirmFirstDay() {
    return await apiClient.post('/first-day/confirm/');
  },

  async getFeedback() {
    return await apiClient.get('/feedback/');
  },

  async submitFeedback(data) {
    return await apiClient.post('/feedback/', data);
  },

  async getStages() {
    const stages = await apiClient.get('/stages/');
    return Array.isArray(stages) ? stages : stages?.results || [];
  },

  async toggleStage(key) {
    return await apiClient.post(`/stages/${key}/toggle/`);
  },

  async createInvitation(data) {
    return await apiClient.post('/invitations/', data);
  },

  async getInvitations() {
    const res = await apiClient.get('/invitations/');
    return Array.isArray(res) ? res : res?.results || [];
  },

  async getInvitationPreview(token) {
    return await apiClient.get(`/invitations/preview/?token=${encodeURIComponent(token)}`);
  },

  async acceptInvitation(data) {
    return await apiClient.post('/invitations/accept/', data);
  },

  async cancelInvitation(id) {
    return await apiClient.post(`/invitations/${id}/cancel/`);
  },

  async resendInvitation(id) {
    return await apiClient.post(`/invitations/${id}/resend/`);
  },

  async getHRDashboard() {
    return await apiClient.get('/hr/dashboard/');
  },

  async getHREmployees(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.role && params.role !== 'ALL') query.append('role', params.role);
    if (params.department && params.department !== 'ALL') query.append('department', params.department);
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize || params.page_size) query.append('page_size', String(params.pageSize || params.page_size));

    const qs = query.toString();
    const endpoint = `/hr/employees/${qs ? `?${qs}` : ''}`;
    return await apiClient.get(endpoint);
  },

  async getHREmployee(id) {
    return await apiClient.get(`/hr/employees/${id}/`);
  },

  async getHRAnalytics() {
    return await apiClient.get('/hr/analytics/');
  },

  async getNotifications(params = {}) {
    const query = new URLSearchParams();
    if (params.unread !== undefined) query.append('unread', String(params.unread));
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize || params.page_size) query.append('page_size', String(params.pageSize || params.page_size));

    const qs = query.toString();
    return await apiClient.get(`/notifications/${qs ? `?${qs}` : ''}`);
  },

  async getUnreadNotificationCount() {
    return await apiClient.get('/notifications/unread-count/');
  },

  async markNotificationRead(id) {
    return await apiClient.patch(`/notifications/${id}/read/`);
  },

  async markAllNotificationsRead() {
    return await apiClient.patch('/notifications/read-all/');
  },

  async getAdminDashboard() {
    return await apiClient.get('/admin/dashboard/');
  },

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'ALL') query.append('role', params.role);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize || params.page_size) query.append('page_size', String(params.pageSize || params.page_size));

    const qs = query.toString();
    return await apiClient.get(`/admin/users/${qs ? `?${qs}` : ''}`);
  },

  async getAdminUserDetail(id) {
    return await apiClient.get(`/admin/users/${id}/`);
  },

  async updateUserRole(id, role) {
    return await apiClient.patch(`/admin/users/${id}/role/`, { system_role: role });
  },

  async updateUserStatus(id, isActive) {
    return await apiClient.patch(`/admin/users/${id}/status/`, { is_active: Boolean(isActive) });
  },

  async getAdminAuditLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.action && params.action !== 'ALL') query.append('action', params.action);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize || params.page_size) query.append('page_size', String(params.pageSize || params.page_size));

    const qs = query.toString();
    return await apiClient.get(`/admin/audit-logs/${qs ? `?${qs}` : ''}`);
  },

  async getAdminConfiguration() {
    return await apiClient.get('/admin/configuration/');
  },

  async updateAdminStageConfig(key, data) {
    return await apiClient.patch(`/admin/stages/${key}/`, data);
  }
};

// ==============================================================================
// 4. Main Service Interface with Graceful Fallback
// ==============================================================================
const executeWithFallback = async (methodName, ...args) => {
  if (isMockMode()) {
    return await mockAdapter[methodName](...args);
  }

  try {
    return await liveAdapter[methodName](...args);
  } catch (err) {
    console.warn(`[onboardingService.${methodName}] Live API error, using graceful fallback:`, err.message || err);
    // Fall back to mock adapter to prevent app crashes while backend is starting or offline
    if (typeof mockAdapter[methodName] === 'function') {
      return await mockAdapter[methodName](...args);
    }
    throw err;
  }
};

export const onboardingService = {
  // === Required Method Signatures ===
  getCurrentEmployee() {
    return executeWithFallback('getCurrentEmployee');
  },

  getProfile() {
    return executeWithFallback('getProfile');
  },

  updateProfile(data) {
    return executeWithFallback('updateProfile', data);
  },

  getDocuments() {
    return executeWithFallback('getDocuments');
  },

  uploadDocument(data) {
    return executeWithFallback('uploadDocument', data);
  },

  getDocumentDownloadUrl(doc) {
    if (!doc) return null;
    if (doc.file_url) return doc.file_url;
    if (doc.fileUrl) return doc.fileUrl;
    if (doc.file && typeof doc.file === 'string' && doc.file.startsWith('http')) return doc.file;
    if (doc.id) {
      return `${apiClient.baseUrl}/documents/${doc.id}/download/`;
    }
    return null;
  },

  verifyDocument(id, data, maybeRemarks) {
    return executeWithFallback('verifyDocument', id, data, maybeRemarks);
  },

  getOfferLetter() {
    return executeWithFallback('getOfferLetter');
  },

  acceptOfferLetter(data) {
    return executeWithFallback('acceptOfferLetter', data);
  },

  getPolicies() {
    return executeWithFallback('getPolicies');
  },

  acknowledgePolicy(id) {
    return executeWithFallback('acknowledgePolicy', id);
  },

  getTraining() {
    return executeWithFallback('getTraining');
  },

  updateTrainingProgress(id, progress) {
    return executeWithFallback('updateTrainingProgress', id, progress);
  },

  getQuiz() {
    return executeWithFallback('getQuiz');
  },

  submitQuiz(answers) {
    return executeWithFallback('submitQuiz', answers);
  },

  getFirstDay() {
    return executeWithFallback('getFirstDay');
  },

  updateFirstDaySession(id, data) {
    return executeWithFallback('updateFirstDaySession', id, data);
  },

  confirmFirstDay() {
    return executeWithFallback('confirmFirstDay');
  },

  getFeedback() {
    return executeWithFallback('getFeedback');
  },

  submitFeedback(data) {
    return executeWithFallback('submitFeedback', data);
  },

  getStages() {
    return executeWithFallback('getStages');
  },

  toggleStage(key) {
    return executeWithFallback('toggleStage', key);
  },

  createInvitation(data) {
    return executeWithFallback('createInvitation', data);
  },

  getInvitations() {
    return executeWithFallback('getInvitations');
  },

  getInvitationPreview(token) {
    return executeWithFallback('getInvitationPreview', token);
  },

  acceptInvitation(data) {
    return executeWithFallback('acceptInvitation', data);
  },

  cancelInvitation(id) {
    return executeWithFallback('cancelInvitation', id);
  },

  resendInvitation(id) {
    return executeWithFallback('resendInvitation', id);
  },

  getHRDashboard() {
    return executeWithFallback('getHRDashboard');
  },

  getHREmployees(params) {
    return executeWithFallback('getHREmployees', params);
  },

  getHREmployee(id) {
    return executeWithFallback('getHREmployee', id);
  },

  getHRAnalytics() {
    return executeWithFallback('getHRAnalytics');
  },

  getNotifications(params) {
    return executeWithFallback('getNotifications', params);
  },

  getUnreadNotificationCount() {
    return executeWithFallback('getUnreadNotificationCount');
  },

  markNotificationRead(id) {
    return executeWithFallback('markNotificationRead', id);
  },

  markAllNotificationsRead() {
    return executeWithFallback('markAllNotificationsRead');
  },

  getAdminDashboard() {
    return executeWithFallback('getAdminDashboard');
  },

  getAdminUsers(params) {
    return executeWithFallback('getAdminUsers', params);
  },

  getAdminUserDetail(id) {
    return executeWithFallback('getAdminUserDetail', id);
  },

  updateUserRole(id, role) {
    return executeWithFallback('updateUserRole', id, role);
  },

  updateUserStatus(id, isActive) {
    return executeWithFallback('updateUserStatus', id, isActive);
  },

  getAdminAuditLogs(params) {
    return executeWithFallback('getAdminAuditLogs', params);
  },

  getAdminConfiguration() {
    return executeWithFallback('getAdminConfiguration');
  },

  updateAdminStageConfig(key, data) {
    return executeWithFallback('updateAdminStageConfig', key, data);
  },

  // === Backward-Compatibility Aliases ===
  getEmployee() {
    return this.getCurrentEmployee();
  },

  getTrainingModules() {
    return this.getTraining();
  },

  getQuizQuestions() {
    return this.getQuiz();
  },

  getFirstDayTimeline() {
    return this.getFirstDay();
  },

  toggleFirstDaySession(id, status) {
    return this.updateFirstDaySession(id, { status });
  },

  confirmFirstDayPlan() {
    return this.confirmFirstDay();
  }
};
