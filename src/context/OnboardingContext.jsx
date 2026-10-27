import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { onboardingService } from '../services/onboardingService';
import { formatTimeAgo } from '../utils/timeAgo';
import { 
  mockEmployeeData, 
  initialDocumentsData,
  initialPoliciesData,
  initialOfferLetterData,
  initialQuizData,
  initialFirstDayTimeline,
  initialFeedbackData,
  onboardingStagesList,
  initialTasksData, 
  mockTrainingModules, 
  mockAnnouncements, 
  mockUpcomingEvents, 
  mockNotifications,
  mockFirstDayPlan
} from '../data/onboardingData';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading, user: authUser } = useAuth();
  const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

  // Global loading & sync state
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Employee Profile State
  const [employee, setEmployee] = useState(mockEmployeeData);
  const [isProfileCompleted, setIsProfileCompleted] = useState(true);

  // 2. Documents State
  const [documents, setDocuments] = useState(initialDocumentsData);

  // 3. Offer Letter State
  const [offerLetter, setOfferLetter] = useState(initialOfferLetterData);

  // 4. Policies State
  const [policies, setPolicies] = useState(initialPoliciesData);

  // 5. Training Modules State
  const [trainings, setTrainings] = useState(mockTrainingModules);

  // 6. Quiz State
  const [quizState, setQuizState] = useState({
    questions: initialQuizData,
    userAnswers: {},
    score: null,
    percentage: null,
    isSubmitted: false,
    isPassed: false,
    attempts: 0
  });

  // 7. Department & Manager Alignment State
  const [managerMeetingConfirmed, setManagerMeetingConfirmed] = useState(false);

  // 8. First Day Plan State
  const [firstDayTimeline, setFirstDayTimeline] = useState(initialFirstDayTimeline);
  const [firstDayPlanConfirmed, setFirstDayPlanConfirmed] = useState(false);

  // 9. Feedback State
  const [feedback, setFeedback] = useState(initialFeedbackData);

  // 10. Stage manual overrides (for testing/grading flexibility)
  const [stageOverrides, setStageOverrides] = useState({});
  const [activeStageIds, setActiveStageIds] = useState(null);

  // Phase 1 Tasks state kept in sync
  const [tasks, setTasks] = useState(initialTasksData);
  const [announcements] = useState(mockAnnouncements);
  const [events] = useState(mockUpcomingEvents);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [firstDayPlan] = useState(mockFirstDayPlan);

  // Modals & UI States
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [isFirstDayModalOpen, setIsFirstDayModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // === Load from Django REST API (or Mock Adapter) on Mount / Auth Change ===
  useEffect(() => {
    let isMounted = true;

    // In live mode, wait until session restoration finishes
    if (!isMock && isAuthLoading) {
      return;
    }

    // In live mode, do not call protected endpoints if unauthenticated
    if (!isMock && !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // Sync basic info from authenticated user if available
    if (authUser) {
      setEmployee(prev => ({
        ...prev,
        id: authUser.employee_id || authUser.id || prev.id,
        employeeId: authUser.employee_id || authUser.employeeId,
        name: authUser.name || prev.name,
        email: authUser.email || prev.email,
        role: authUser.role || prev.role,
        avatar: authUser.avatar || prev.avatar,
      }));
    }

    async function loadInitialData() {
      setIsLoading(true);
      setError(null);
      try {
        const [
          empRes,
          profRes,
          docsRes,
          offerRes,
          polsRes,
          trainRes,
          quizRes,
          fdayRes,
          feedRes,
          stagesRes
        ] = await Promise.allSettled([
          onboardingService.getCurrentEmployee(),
          onboardingService.getProfile(),
          onboardingService.getDocuments(),
          onboardingService.getOfferLetter(),
          onboardingService.getPolicies(),
          onboardingService.getTraining(),
          onboardingService.getQuiz(),
          onboardingService.getFirstDay(),
          onboardingService.getFeedback(),
          onboardingService.getStages()
        ]);

        if (!isMounted) return;

        // 1. Current Employee & Profile
        if (empRes.status === 'fulfilled' && empRes.value) {
          const emp = empRes.value;
          setEmployee(prev => ({
            ...prev,
            ...emp,
            id: emp.employee_id || emp.id || prev.id,
            employeeId: emp.employee_id || emp.employeeId || prev.employeeId,
            name: emp.name || prev.name,
            email: emp.email || prev.email,
            role: emp.role || prev.role,
            designation: emp.designation || prev.designation,
            department: emp.department || prev.department,
            joiningDate: emp.joining_date || emp.joiningDate || prev.joiningDate,
            joiningTime: emp.joining_time || emp.joiningTime || prev.joiningTime,
            location: emp.location || prev.location,
            workMode: emp.work_mode || emp.workMode || prev.workMode,
            avatar: emp.avatar || prev.avatar,
            manager: emp.manager || prev.manager,
            hrSupport: emp.hrSupport || prev.hrSupport,
            phone: emp.profile?.phone || emp.phone || prev.phone,
            dateOfBirth: emp.profile?.date_of_birth || emp.dateOfBirth || prev.dateOfBirth,
            bloodGroup: emp.profile?.blood_group || emp.bloodGroup || prev.bloodGroup,
            address: emp.profile?.address || emp.address || prev.address,
            city: emp.profile?.city || emp.city || prev.city,
            state: emp.profile?.state || emp.state || prev.state,
            pincode: emp.profile?.pincode || emp.pincode || prev.pincode,
            emergencyContact: emp.profile?.emergencyContact || emp.emergencyContact || prev.emergencyContact
          }));
        }

        if (profRes.status === 'fulfilled' && profRes.value) {
          const prof = profRes.value;
          setEmployee(prev => ({
            ...prev,
            phone: prof.phone || prev.phone,
            dateOfBirth: prof.dateOfBirth || prev.dateOfBirth,
            bloodGroup: prof.bloodGroup || prev.bloodGroup,
            address: prof.address || prev.address,
            city: prof.city || prev.city,
            state: prof.state || prev.state,
            pincode: prof.pincode || prev.pincode,
            emergencyContact: prof.emergencyContact || prev.emergencyContact
          }));
        }

        // 2. Documents
        if (docsRes.status === 'fulfilled' && Array.isArray(docsRes.value) && docsRes.value.length > 0) {
          setDocuments(docsRes.value);
        }

        // 3. Offer Letter
        if (offerRes.status === 'fulfilled' && offerRes.value) {
          setOfferLetter(prev => ({ ...prev, ...offerRes.value }));
        }

        // 4. Policies
        if (polsRes.status === 'fulfilled' && Array.isArray(polsRes.value) && polsRes.value.length > 0) {
          setPolicies(polsRes.value);
        }

        // 5. Training Modules
        if (trainRes.status === 'fulfilled' && Array.isArray(trainRes.value) && trainRes.value.length > 0) {
          setTrainings(trainRes.value);
        }

        // 6. Quiz Questions
        if (quizRes.status === 'fulfilled' && Array.isArray(quizRes.value) && quizRes.value.length > 0) {
          setQuizState(prev => ({
            ...prev,
            questions: quizRes.value
          }));
        }

        // 7. First Day Sessions
        if (fdayRes.status === 'fulfilled' && Array.isArray(fdayRes.value) && fdayRes.value.length > 0) {
          setFirstDayTimeline(fdayRes.value);
        }

        // 8. Feedback
        if (feedRes.status === 'fulfilled' && feedRes.value) {
          setFeedback(feedRes.value);
        }

        // 9. Onboarding Stages Initial Progress & Active Stages Filtering
        if (stagesRes.status === 'fulfilled' && Array.isArray(stagesRes.value) && stagesRes.value.length > 0) {
          const activeIds = stagesRes.value.map(s => s.id || s.stage_id);
          setActiveStageIds(activeIds);
          const initialOverrides = {};
          stagesRes.value.forEach(s => {
            if (s.status === 'completed' || s.isCompleted) {
              initialOverrides[s.id || s.stage_id] = 'completed';
            }
          });
          setStageOverrides(prev => ({ ...initialOverrides, ...prev }));
        }
      } catch (err) {
        console.warn('Initial data load completed via default fallback store:', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();
    return () => { isMounted = false; };
  }, [isAuthenticated, isAuthLoading, isMock, authUser]);

  // === Service-Connected Dynamic Actions ===

  // 1. Update Profile
  const updateEmployee = async (newFields) => {
    setIsSyncing(true);
    setError(null);
    try {
      await onboardingService.updateProfile(newFields);
      setEmployee(prev => ({
        ...prev,
        ...newFields,
        emergencyContact: newFields.emergencyContact || prev.emergencyContact
      }));
      setIsProfileCompleted(true);
      setTasks(prev => prev.map(t => t.id === 'task-1' ? { ...t, status: 'completed' } : t));
    } catch (err) {
      console.error('[OnboardingContext] Error updating profile:', err);
      setError(err.message || 'Failed to update profile.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Upload Document
  const uploadDocument = async (docPayload) => {
    setIsSyncing(true);
    setError(null);
    try {
      const serverDoc = await onboardingService.uploadDocument(docPayload);
      if (serverDoc) {
        setDocuments(prev => [serverDoc, ...prev.filter(d => d.name !== serverDoc.name)]);
      }
      return serverDoc;
    } catch (err) {
      console.error('[OnboardingContext] Error uploading document:', err);
      setError(err.message || 'Failed to upload document.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Verify / Reject Document (HR demo simulation)
  const updateDocumentStatus = async (docId, newStatus, newRemarks) => {
    setIsSyncing(true);
    setError(null);
    try {
      await onboardingService.verifyDocument(docId, {
        verificationStatus: newStatus,
        remarks: newRemarks || (newStatus === 'Verified' ? 'Verified by HR Operations.' : 'Document rejected. Please re-upload.')
      });
      setDocuments(prev => prev.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            verificationStatus: newStatus,
            remarks: newRemarks || (newStatus === 'Verified' ? 'Verified by HR Operations.' : 'Document rejected. Please re-upload.')
          };
        }
        return d;
      }));
    } catch (err) {
      console.error('[OnboardingContext] Error updating document status:', err);
      setError(err.message || 'Failed to update document status.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Accept Offer Letter
  const acceptOfferLetter = async (signatureName) => {
    setIsSyncing(true);
    setError(null);
    try {
      const updatedOffer = await onboardingService.acceptOfferLetter(signatureName);
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
        ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      setOfferLetter(prev => ({
        ...prev,
        ...updatedOffer,
        isAccepted: true,
        acceptedAt: updatedOffer?.acceptedAt || formattedDate,
        signature: updatedOffer?.signature || signatureName || prev.employeeName
      }));
      setTasks(prev => prev.map(t => t.id === 'task-3' ? { ...t, status: 'completed' } : t));
      return updatedOffer;
    } catch (err) {
      console.error('[OnboardingContext] Error accepting offer letter:', err);
      setError(err.message || 'Failed to accept offer letter.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Acknowledge Policy
  const acknowledgePolicy = async (policyId) => {
    setIsSyncing(true);
    setError(null);
    try {
      const res = await onboardingService.acknowledgePolicy(policyId);
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setPolicies(prev => prev.map(p => {
        if (p.id === policyId) {
          return {
            ...p,
            acknowledged: true,
            acknowledgedAt: res?.acknowledgedAt || formattedDate
          };
        }
        return p;
      }));
      return res;
    } catch (err) {
      console.error('[OnboardingContext] Error acknowledging policy:', err);
      setError(err.message || 'Failed to acknowledge policy.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Training Progress & Module Completion
  const updateTrainingProgress = async (courseId, newProgress) => {
    setIsSyncing(true);
    setError(null);
    try {
      const res = await onboardingService.updateTrainingProgress(courseId, newProgress);
      const prog = Math.min(100, Math.max(0, newProgress));
      const status = prog === 100 ? 'Completed' : prog > 0 ? 'In Progress' : 'Not Started';
      setTrainings(prev => prev.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            progress: prog,
            status,
            completedModules: res?.completedModules !== undefined ? res.completedModules : (prog === 100 ? course.modulesCount : course.completedModules)
          };
        }
        return course;
      }));
      return res;
    } catch (err) {
      console.error('[OnboardingContext] Error updating training progress:', err);
      setError(err.message || 'Failed to update training progress.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const completeTrainingModule = async (courseId) => {
    return await updateTrainingProgress(courseId, 100);
  };

  // 6. Quiz Submission
  const submitQuiz = async (selectedAnswers) => {
    setIsSyncing(true);
    setError(null);
    try {
      const sub = await onboardingService.submitQuiz(selectedAnswers);
      setQuizState(prev => ({
        ...prev,
        userAnswers: selectedAnswers,
        score: sub.score,
        percentage: sub.percentage,
        isSubmitted: true,
        isPassed: sub.isPassed,
        attempts: sub.attempts || prev.attempts + 1
      }));

      if (sub.isPassed) {
        setTasks(prev => prev.map(t => t.id === 'task-6' ? { ...t, status: 'completed' } : t));
      }
      return sub;
    } catch (err) {
      console.error('[OnboardingContext] Error submitting quiz:', err);
      setError(err.message || 'Failed to submit quiz.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const resetQuiz = () => {
    setQuizState(prev => ({
      ...prev,
      userAnswers: {},
      score: null,
      percentage: null,
      isSubmitted: false,
      isPassed: false
    }));
  };

  // 7. Department & Manager alignment
  const confirmManagerMeeting = () => {
    setManagerMeetingConfirmed(true);
    setTasks(prev => prev.map(t => t.id === 'task-7' ? { ...t, status: 'completed' } : t));
  };

  // 8. First Day Plan toggle & confirmation
  const toggleTimelineItem = async (itemId) => {
    setIsSyncing(true);
    setError(null);
    try {
      const item = firstDayTimeline.find(t => t.id === itemId);
      const nextStatus = item?.status === 'completed' 
        ? 'in-progress' 
        : item?.status === 'in-progress' 
          ? 'upcoming' 
          : 'completed';

      await onboardingService.updateFirstDaySession(itemId, { status: nextStatus });
      setFirstDayTimeline(prev => prev.map(t =>
        t.id === itemId ? { ...t, status: nextStatus } : t
      ));
    } catch (err) {
      console.error('[OnboardingContext] Error updating first day session:', err);
      setError(err.message || 'Failed to update first day session.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmFirstDayPlan = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      await onboardingService.confirmFirstDay();
      setFirstDayPlanConfirmed(true);
      setTasks(prev => prev.map(t => t.id === 'task-8' ? { ...t, status: 'completed' } : t));
    } catch (err) {
      console.error('[OnboardingContext] Error confirming first day plan:', err);
      setError(err.message || 'Failed to confirm first day plan.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // 9. Feedback Submission
  const submitFeedback = async (payload) => {
    setIsSyncing(true);
    setError(null);
    try {
      const res = await onboardingService.submitFeedback(payload);
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const feedbackObj = {
        ratings: payload.ratings || { journey: 5, documentation: 5, support: 5, training: 5 },
        npsScore: payload.npsScore ?? 10,
        comments: payload.comments || '',
        isSubmitted: true,
        submittedAt: res?.submittedAt || formattedDate
      };
      setFeedback(feedbackObj);
      setTasks(prev => prev.map(t => t.id === 'task-9' ? { ...t, status: 'completed' } : t));
      return res;
    } catch (err) {
      console.error('[OnboardingContext] Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual Stage Override Toggle for quick demo testing
  const toggleStageStatus = async (stageId) => {
    setIsSyncing(true);
    setError(null);
    try {
      await onboardingService.toggleStage(stageId);
      setStageOverrides(prev => {
        const current = prev[stageId];
        return {
          ...prev,
          [stageId]: current === 'completed' ? 'pending' : 'completed'
        };
      });
    } catch (err) {
      console.error('[OnboardingContext] Error toggling stage:', err);
      setError(err.message || 'Failed to toggle stage.');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // === Dynamic Evaluation of the 10 Stages ===
  const stages = useMemo(() => {
    // 1. Profile:
    const isProfileDone = stageOverrides.profile 
      ? stageOverrides.profile === 'completed' 
      : isProfileCompleted;

    // 2. Documents: All required docs verified
    const requiredDocs = documents.filter(d => d.required);
    const verifiedDocs = requiredDocs.filter(d => d.verificationStatus === 'Verified');
    const isDocsDone = stageOverrides.documents 
      ? stageOverrides.documents === 'completed' 
      : (requiredDocs.length > 0 && verifiedDocs.length === requiredDocs.length);

    // 3. Offer Letter:
    const isOfferDone = stageOverrides.offerLetter 
      ? stageOverrides.offerLetter === 'completed' 
      : offerLetter.isAccepted;

    // 4. Policies:
    const allPoliciesAck = policies.every(p => p.acknowledged);
    const isPoliciesDone = stageOverrides.policies
      ? stageOverrides.policies === 'completed'
      : allPoliciesAck;

    // 5. Training:
    const allTrainingsDone = trainings.every(t => t.status === 'Completed' || t.progress === 100);
    const isTrainingDone = stageOverrides.training
      ? stageOverrides.training === 'completed'
      : allTrainingsDone;

    // 6. Quiz:
    const isQuizDone = stageOverrides.quiz
      ? stageOverrides.quiz === 'completed'
      : quizState.isPassed;

    // 7. Department & Manager:
    const isManagerDone = stageOverrides.manager
      ? stageOverrides.manager === 'completed'
      : managerMeetingConfirmed;

    // 8. First Day:
    const isFirstDayDone = stageOverrides.firstDay
      ? stageOverrides.firstDay === 'completed'
      : firstDayPlanConfirmed;

    // 9. Feedback:
    const isFeedbackDone = stageOverrides.feedback
      ? stageOverrides.feedback === 'completed'
      : feedback?.isSubmitted;

    // Map stages to their dynamic or overridden completion statuses
    const completionMap = {
      profile: isProfileDone,
      documents: isDocsDone,
      offerLetter: isOfferDone,
      policies: isPoliciesDone,
      training: isTrainingDone,
      quiz: isQuizDone,
      manager: isManagerDone,
      firstDay: isFirstDayDone,
      feedback: isFeedbackDone
    };

    // 10. Completed: All prior active stages done
    const activeStageList = activeStageIds
      ? onboardingStagesList.filter(stage => activeStageIds.includes(stage.id))
      : onboardingStagesList;

    const priorStages = activeStageList.filter(s => s.id !== 'completed');
    const allPriorDone = priorStages.length > 0 && priorStages.every(s => Boolean(completionMap[s.id]));
    const isFinalDone = stageOverrides.completed 
      ? stageOverrides.completed === 'completed'
      : allPriorDone;

    completionMap.completed = isFinalDone;

    // Determine current active stage (first incomplete stage)
    let foundCurrent = false;

    return activeStageList.map((stage) => {
      const isCompleted = Boolean(completionMap[stage.id]);
      let status = 'pending';

      if (isCompleted) {
        status = 'completed';
      } else if (!foundCurrent) {
        status = 'current';
        foundCurrent = true;
      }

      return {
        ...stage,
        status,
        isCompleted
      };
    });
  }, [
    activeStageIds,
    stageOverrides,
    isProfileCompleted,
    documents,
    offerLetter.isAccepted,
    policies,
    trainings,
    quizState.isPassed,
    managerMeetingConfirmed,
    firstDayPlanConfirmed,
    feedback.isSubmitted
  ]);

  // Dynamic Overall Progress Calculation
  const { completedStagesCount, currentStagesCount, pendingStagesCount, totalStagesCount, progressPercentage } = useMemo(() => {
    const completed = stages.filter(s => s.status === 'completed').length;
    const current = stages.filter(s => s.status === 'current').length;
    const pending = stages.filter(s => s.status === 'pending').length;
    const total = stages.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completedStagesCount: completed,
      currentStagesCount: current,
      pendingStagesCount: pending,
      totalStagesCount: total,
      progressPercentage: percentage
    };
  }, [stages]);

  // Phase 1 Task toggle compatibility
  const toggleTaskStatus = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
  };

  const completeTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      )
    );
  };

  const completedCount = completedStagesCount;
  const currentCount = currentStagesCount;
  const pendingCount = pendingStagesCount;
  const totalCount = totalStagesCount;

  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed'), [tasks]);
  const currentTasks = useMemo(() => tasks.filter(t => t.status === 'current'), [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.status === 'pending'), [tasks]);

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      const res = await onboardingService.getNotifications(params);
      const notifs = res?.results || (Array.isArray(res) ? res : []);
      const mapped = notifs.map(n => ({
        ...n,
        unread: !(n.isRead ?? n.is_read),
        isRead: Boolean(n.isRead ?? n.is_read),
        time: formatTimeAgo(n.createdAt || n.created_at)
      }));
      setNotifications(mapped);
      return mapped;
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
      return [];
    }
  }, []);

  const fetchUnreadNotificationCount = useCallback(async () => {
    try {
      const res = await onboardingService.getUnreadNotificationCount();
      if (res && typeof res.count === 'number') {
        setUnreadNotificationCount(res.count);
      }
    } catch (err) {
      console.warn('Failed to fetch unread notification count:', err);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, unread: false } : n));
    setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    try {
      await onboardingService.markNotificationRead(id);
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, unread: false })));
    setUnreadNotificationCount(0);
    try {
      await onboardingService.markAllNotificationsRead();
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Polling notifications & unread count when authenticated (every 35 seconds)
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    fetchNotifications({ page_size: 20 });
    fetchUnreadNotificationCount();

    const intervalId = setInterval(() => {
      fetchUnreadNotificationCount();
    }, 35000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchNotifications, fetchUnreadNotificationCount]);

  return (
    <OnboardingContext.Provider
      value={{
        // Loading & Status
        isLoading,
        isSyncing,
        error,

        // Profile
        employee,
        updateEmployee,
        isProfileCompleted,

        // Documents
        documents,
        uploadDocument,
        updateDocumentStatus,

        // Offer Letter
        offerLetter,
        acceptOfferLetter,

        // Policies
        policies,
        acknowledgePolicy,

        // Training
        trainings,
        updateTrainingProgress,
        completeTrainingModule,

        // Quiz
        quizState,
        submitQuiz,
        resetQuiz,

        // Manager & Department
        managerMeetingConfirmed,
        confirmManagerMeeting,

        // First Day Plan
        firstDayTimeline,
        toggleTimelineItem,
        firstDayPlanConfirmed,
        confirmFirstDayPlan,

        // Feedback
        feedback,
        submitFeedback,

        // 10 Stages & Progress
        stages,
        toggleStageStatus,
        completedStagesCount,
        currentStagesCount,
        pendingStagesCount,
        totalStagesCount,
        progressPercentage,

        // Phase 1 compatibility
        tasks,
        completedCount,
        currentCount,
        pendingCount,
        totalCount,
        completedTasks,
        currentTasks,
        pendingTasks,
        toggleTaskStatus,
        completeTask,

        // Feeds & notifications
        announcements,
        events,
        notifications,
        firstDayPlan,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        fetchNotifications,
        fetchUnreadNotificationCount,
        unreadNotificationCount,

        // Modals
        isHrModalOpen,
        setIsHrModalOpen,
        isFirstDayModalOpen,
        setIsFirstDayModalOpen,
        isCertificateModalOpen,
        setIsCertificateModalOpen,
        searchQuery,
        setSearchQuery,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
