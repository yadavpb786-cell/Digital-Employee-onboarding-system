import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CheckSquare, Filter, Search, Calendar, Clock, ArrowRight } from 'lucide-react';

export const TasksPage = () => {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus } = useOnboarding();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'completed' ? t.status === 'completed' :
      filter === 'current' ? t.status === 'current' :
      t.status === 'pending';

    const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase()) ||
                         t.category.toLowerCase().includes(query.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-nova-md">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Onboarding Tasks</h2>
          <p className="text-xs text-slate-500 mt-1">Manage and execute your assigned onboarding items.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'completed', 'current', 'pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-nova-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Filter tasks by name or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 shadow-nova-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-nova-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {task.category}
                </span>
                <StatusBadge status={task.status} size="sm" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> Due {task.dueDate}
              </span>
              
              <div className="flex items-center gap-2">
                {task.actionPath && (
                  <button
                    onClick={() => navigate(task.actionPath)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    task.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {task.status === 'completed' ? '✓ Done' : 'Toggle Completion'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
