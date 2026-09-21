import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Paperclip,
  CheckSquare
} from 'lucide-react';
import { formatDate, formatDateTime, getDeadlineInfo, PRIORITY_CONFIG } from '../utils/helpers';

export default function CalendarTimelineView({ 
  tasks, 
  onEditTask, 
  onToggleStatus, 
  onOpenVaultWithTask 
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'active', 'upcoming', 'overdue'

  // Sort tasks chronologically by start date or end date
  const sortedTasks = useMemo(() => {
    const now = new Date();

    return [...tasks].filter(t => {
      if (filterMode === 'active') {
        return t.status !== 'completed';
      }
      if (filterMode === 'upcoming') {
        return t.status !== 'completed' && t.startDate && new Date(t.startDate) > now;
      }
      if (filterMode === 'overdue') {
        return t.status !== 'completed' && t.endDate && new Date(t.endDate) < now;
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.endDate || a.startDate || 0);
      const dateB = new Date(b.endDate || b.startDate || 0);
      return dateA - dateB;
    });
  }, [tasks, filterMode]);

  return (
    <div className="space-y-4">
      
      {/* Top filter bar */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-soft flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sage-600" />
            <span>Dòng thời gian công việc (Timeline & Lịch)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Theo dõi tiến độ dựa trên thời gian bắt đầu và hạn chót kết thúc
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'active', label: 'Đang làm' },
            { id: 'upcoming', label: 'Sắp tới' },
            { id: 'overdue', label: 'Quá hạn' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === btn.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft">
        {sortedTasks.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
            {sortedTasks.map((task) => {
              const deadlineInfo = getDeadlineInfo(task.endDate, task.status);
              const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
              const isDone = task.status === 'completed';

              return (
                <div key={task.id} className="relative group">
                  
                  {/* Timeline dot */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                    isDone 
                      ? 'bg-emerald-500' 
                      : deadlineInfo.state === 'overdue' 
                        ? 'bg-rose-500' 
                        : 'bg-sage-600'
                  }`} />

                  {/* Task Card in Timeline */}
                  <div 
                    onClick={() => onEditTask(task)}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-750 hover:border-sage-400 dark:hover:border-sage-600 transition-all cursor-pointer shadow-soft hover:shadow-soft-lg"
                  >
                    
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-2">
                        {task.category && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {task.category}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${deadlineInfo.badgeClass}`}>
                        {deadlineInfo.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className={`text-sm font-bold text-slate-900 dark:text-white mb-1.5 ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h4>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}

                    {/* Time bar */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-750 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Bắt đầu: <strong>{formatDateTime(task.startDate)}</strong></span>
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>Kết thúc: <strong>{formatDateTime(task.endDate)}</strong></span>
                      </div>

                      {(task.attachments || []).length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenVaultWithTask) onOpenVaultWithTask(task.id);
                          }}
                          className="ml-auto inline-flex items-center gap-1 text-sage-600 dark:text-sage-400 hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{(task.attachments || []).length} tệp</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Không có công việc nào trong danh mục hiển thị thời gian này.
          </div>
        )}
      </div>

    </div>
  );
}
