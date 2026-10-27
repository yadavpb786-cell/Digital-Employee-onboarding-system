import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  GraduationCap, 
  ShieldCheck, 
  Calendar, 
  FileCheck, 
  UserPlus, 
  Smile, 
  ArrowRight 
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    markAllNotificationsAsRead, 
    markNotificationAsRead, 
    unreadNotificationCount 
  } = useOnboarding();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'DOCUMENT_VERIFIED':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'DOCUMENT_REJECTED':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'DOCUMENT_UPLOADED':
        return <FileText className="w-4 h-4 text-indigo-500 shrink-0" />;
      case 'TRAINING_ASSIGNED':
      case 'TRAINING_COMPLETED':
        return <GraduationCap className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'POLICY_PENDING':
      case 'POLICY_ACKNOWLEDGED':
        return <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />;
      case 'FIRST_DAY_REMINDER':
      case 'FIRST_DAY_CONFIRMED':
        return <Calendar className="w-4 h-4 text-cyan-500 shrink-0" />;
      case 'OFFER_LETTER':
        return <FileCheck className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'CANDIDATE_INVITATION':
        return <UserPlus className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'FEEDBACK_REQUEST':
        return <Smile className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  const handleItemClick = (item) => {
    if (!item.isRead && markNotificationAsRead) {
      markNotificationAsRead(item.id);
    }
    onClose();
    const targetUrl = item.actionUrl || item.action_url;
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-nova-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadNotificationCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
              {unreadNotificationCount} new
            </span>
          )}
        </div>
        {unreadNotificationCount > 0 && (
          <button 
            onClick={markAllNotificationsAsRead}
            className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No new notifications
          </div>
        ) : (
          notifications.slice(0, 10).map(item => {
            const isUnread = !item.isRead;
            return (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                  isUnread ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5">
                  {getIcon(item.notificationType || item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-semibold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{item.message}</p>
                </div>
                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs px-4">
        <button 
          onClick={handleViewAll} 
          className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
        >
          View all notifications <ArrowRight className="w-3 h-3" />
        </button>
        <button 
          onClick={onClose} 
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
