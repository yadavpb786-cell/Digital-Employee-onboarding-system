import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsAsRead, unreadNotificationCount } = useOnboarding();
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
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
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
            Mark read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No notifications at this time.
          </div>
        ) : (
          notifications.map(item => (
            <div 
              key={item.id} 
              className={`p-3.5 transition-colors flex items-start gap-3 ${
                item.unread ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
              }`}
            >
              {getIcon(item.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
              </div>
              {item.unread && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button 
          onClick={onClose} 
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Close panel
        </button>
      </div>
    </div>
  );
};
