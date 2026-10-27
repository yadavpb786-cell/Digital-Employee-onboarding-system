import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { onboardingService } from '../services/onboardingService';
import { formatTimeAgo } from '../utils/timeAgo';
import {
  Bell,
  CheckCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  GraduationCap,
  ShieldCheck,
  Calendar,
  FileCheck,
  UserPlus,
  Smile,
  Info,
  RefreshCw,
  ExternalLink,
  Filter,
  Check,
  Clock
} from 'lucide-react';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { 
    unreadNotificationCount, 
    markAllNotificationsAsRead: contextMarkAll, 
    markNotificationAsRead: contextMarkRead,
    fetchUnreadNotificationCount 
  } = useOnboarding();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError('');
    try {
      const params = { page_size: 50 };
      if (activeTab === 'unread') {
        params.unread = true;
      }
      const res = await onboardingService.getNotifications(params);
      const items = res?.results || (Array.isArray(res) ? res : []);
      setNotifications(items);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      if (showLoading) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications(true);
  }, [activeTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadNotifications(false);
    if (fetchUnreadNotificationCount) {
      fetchUnreadNotificationCount();
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true, is_read: true } : n)));
      if (contextMarkRead) {
        contextMarkRead(id);
      } else {
        await onboardingService.markNotificationRead(id);
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
      if (contextMarkAll) {
        contextMarkAll();
      } else {
        await onboardingService.markAllNotificationsRead();
      }
      if (fetchUnreadNotificationCount) {
        fetchUnreadNotificationCount();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = (item) => {
    const isUnread = !(item.isRead ?? item.is_read);
    if (isUnread) {
      handleMarkAsRead(item.id);
    }
    const targetUrl = item.actionUrl || item.action_url;
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'DOCUMENT_VERIFIED':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'DOCUMENT_REJECTED':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'DOCUMENT_UPLOADED':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'TRAINING_ASSIGNED':
      case 'TRAINING_COMPLETED':
        return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 'POLICY_PENDING':
      case 'POLICY_ACKNOWLEDGED':
        return <ShieldCheck className="w-5 h-5 text-teal-400" />;
      case 'FIRST_DAY_REMINDER':
      case 'FIRST_DAY_CONFIRMED':
        return <Calendar className="w-5 h-5 text-cyan-400" />;
      case 'OFFER_LETTER':
        return <FileCheck className="w-5 h-5 text-purple-400" />;
      case 'CANDIDATE_INVITATION':
        return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'FEEDBACK_REQUEST':
        return <Smile className="w-5 h-5 text-emerald-400" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Notification Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-400" />
            Notifications
          </h1>
          <p className="text-slate-400 text-sm">
            Stay updated on your onboarding tasks, compliance verification, and HR announcements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh
          </button>
          {unreadNotificationCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'unread'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Unread
            {unreadNotificationCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Showing {notifications.length} notification{notifications.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadNotifications(true)} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-800/40 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Bell className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-sm font-bold text-white">
            {activeTab === 'unread' ? "You're all caught up!" : "No notifications found"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'unread' 
              ? "There are no unread notifications waiting for your attention." 
              : "Notifications regarding document uploads, compliance approvals, and training will appear here."}
          </p>
        </div>
      ) : (
        /* Notification List */
        <div className="space-y-3">
          {notifications.map(item => {
            const isUnread = !(item.isRead ?? item.is_read);
            const timeStr = formatTimeAgo(item.createdAt || item.created_at);
            const targetUrl = item.actionUrl || item.action_url;

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isUnread
                    ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/20 hover:border-indigo-400'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shrink-0 mt-0.5">
                  {getIcon(item.notificationType || item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold truncate ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                        {item.title}
                      </h4>
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          Unread
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800/50">
                    {targetUrl && (
                      <span className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                        Open action link <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
