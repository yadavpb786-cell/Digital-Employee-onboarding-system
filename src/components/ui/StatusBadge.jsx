import React from 'react';
import { CheckCircle2, Clock, CircleDot, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status, size = "md" }) => {
  const normalized = (status || '').toLowerCase().replace(' ', '_');

  const configs = {
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      icon: CheckCircle2
    },
    current: {
      label: 'In Progress',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dot: 'bg-indigo-600 animate-pulse',
      icon: CircleDot
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dot: 'bg-indigo-600 animate-pulse',
      icon: CircleDot
    },
    pending: {
      label: 'Pending',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      icon: Clock
    },
    not_started: {
      label: 'Not Started',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      icon: Clock
    }
  };

  const config = configs[normalized] || configs.pending;
  const IconComponent = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs font-medium gap-1'
    : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border transition-all ${config.bg} ${sizeClasses}`}>
      <IconComponent className={size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{config.label}</span>
    </span>
  );
};
