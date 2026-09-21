import React from 'react';
import { 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Paperclip, 
  CheckSquare, 
  Clock 
} from 'lucide-react';
import { formatDate, getDeadlineInfo, PRIORITY_CONFIG } from '../utils/helpers';

const COLUMNS = [
  { id: 'todo', title: 'Chưa bắt đầu', color: 'border-slate-300 dark:border-slate-700', badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
  { id: 'in_progress', title: 'Đang thực hiện', color: 'border-sage-400 dark:border-sage-700', badge: 'bg-sage-100 dark:bg-sage-950 text-sage-800 dark:text-sage-300' },
  { id: 'review', title: 'Chờ duyệt / Review', color: 'border-purple-400 dark:border-purple-700', badge: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' },
  { id: 'completed', title: 'Đã hoàn thành', color: 'border-emerald-400 dark:border-emerald-700', badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' },
];

export default function KanbanView({ 
  tasks, 
  searchQuery, 
  onEditTask, 
  onToggleStatus, 
  onOpenCreateTask,
  onOpenVaultWithTask
}) {
  const filteredTasks = tasks.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  const getNextStatus = (current) => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'completed';
    return null;
  };

  const getPrevStatus = (current) => {
    if (current === 'completed') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = filteredTasks.filter(t => t.status === col.id);

        return (
          <div 
            key={col.id}
            className="bg-slate-100/70 dark:bg-slate-850/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-3.5 flex flex-col min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-750">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {col.title}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {col.id === 'todo' && (
                <button
                  onClick={onOpenCreateTask}
                  className="p-1 rounded-lg text-slate-400 hover:text-sage-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  title="Thêm nhanh việc vào Chưa bắt đầu"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Task list inside column */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.map((task) => {
                const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const deadlineInfo = getDeadlineInfo(task.endDate, task.status);
                const subtasks = task.subtasks || [];
                const completedSubtasks = subtasks.filter(s => s.completed).length;
                const next = getNextStatus(task.status);
                const prev = getPrevStatus(task.status);

                return (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-soft hover:shadow-soft-lg hover:border-sage-400 dark:hover:border-sage-600 transition-all cursor-pointer"
                  >
                    {/* Category and priority */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      {task.category && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300">
                          {task.category}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${priority.color}`}>
                        <span className={`w-1 h-1 rounded-full ${priority.dot}`} />
                        {priority.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-1.5 leading-snug break-words">
                      {task.title}
                    </h4>

                    {/* Deadline pill */}
                    <div className="mb-2.5">
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${deadlineInfo.badgeClass}`}>
                        {deadlineInfo.label}
                      </span>
                    </div>

                    {/* Subtasks and attachments counts */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-750">
                      <div className="flex items-center gap-2">
                        {subtasks.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-sage-600" />
                            <span>{completedSubtasks}/{subtasks.length}</span>
                          </span>
                        )}
                        {(task.attachments || []).length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenVaultWithTask) onOpenVaultWithTask(task.id);
                            }}
                            className="flex items-center gap-1 text-sage-600 dark:text-sage-400 hover:underline"
                            title="Mở kho tài liệu cho task này"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{(task.attachments || []).length}</span>
                          </button>
                        )}
                      </div>

                      {/* Move Column buttons */}
                      <div className="flex items-center gap-1">
                        {prev && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(task.id, prev);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Chuyển về cột trước"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {next && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(task.id, next);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-sage-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Chuyển sang cột tiếp theo"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="h-32 border border-dashed border-slate-200 dark:border-slate-750 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Không có việc nào
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
