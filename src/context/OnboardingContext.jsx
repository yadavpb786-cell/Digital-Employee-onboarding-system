import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  mockEmployeeData, 
  initialTasksData, 
  mockTrainingModules, 
  mockAnnouncements, 
  mockUpcomingEvents, 
  mockNotifications,
  mockFirstDayPlan
} from '../data/onboardingData';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [employee, setEmployee] = useState(mockEmployeeData);
  const [tasks, setTasks] = useState(initialTasksData);
  const [trainings, setTrainings] = useState(mockTrainingModules);
  const [announcements] = useState(mockAnnouncements);
  const [events] = useState(mockUpcomingEvents);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [firstDayPlan] = useState(mockFirstDayPlan);
  
  // Modals & UI States
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [isFirstDayModalOpen, setIsFirstDayModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dynamic progress calculation based on task state
  const { completedCount, currentCount, pendingCount, totalCount, progressPercentage } = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const current = tasks.filter(t => t.status === 'current').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      completedCount: completed,
      currentCount: current,
      pendingCount: pending,
      totalCount: total,
      progressPercentage: percentage
    };
  }, [tasks]);

  // Dynamic lists
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed'), [tasks]);
  const currentTasks = useMemo(() => tasks.filter(t => t.status === 'current'), [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.status === 'pending'), [tasks]);

  // Toggle task status
  const toggleTaskStatus = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          let nextStatus = 'completed';
          if (task.status === 'completed') {
            nextStatus = 'pending';
          } else if (task.status === 'pending') {
            nextStatus = 'current';
          } else {
            nextStatus = 'completed';
          }
          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
  };

  // Mark task directly as completed
  const completeTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      )
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadNotificationCount = useMemo(() => 
    notifications.filter(n => n.unread).length
  , [notifications]);

  return (
    <OnboardingContext.Provider
      value={{
        employee,
        tasks,
        trainings,
        announcements,
        events,
        notifications,
        firstDayPlan,
        completedCount,
        currentCount,
        pendingCount,
        totalCount,
        progressPercentage,
        completedTasks,
        currentTasks,
        pendingTasks,
        toggleTaskStatus,
        completeTask,
        isHrModalOpen,
        setIsHrModalOpen,
        isFirstDayModalOpen,
        setIsFirstDayModalOpen,
        searchQuery,
        setSearchQuery,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        markAllNotificationsAsRead,
        unreadNotificationCount
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
