import React from 'react';
import { 
  Check, 
  Calendar, 
  Paperclip, 
  CheckSquare, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatDate, getDeadlineInfo, PRIORITY_CONFIG } from '../utils/helpers';
import confetti from 'canvas-confetti';

export default function TaskCard({ 
  task, 
  onEditTask, 
  onDeleteTask, 
  onToggleStatus, 
  onOpenVaultWithTask 
}) {
  const isCompleted = task.status === 'completed';
  const deadlineInfo = getDeadlineInfo(task.endDate, task.status);
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const subtaskPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
  
  const attachments = task.attachments || [];

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    const newStatus = isCompleted ? 'todo' : 'completed';
    if (newStatus === 'completed') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#5f876f', '#83a691', '#cedcd3', '#f4f7f5']
      });
    }
    onToggleStatus(task.id, newStatus);
  };

  return (
    <div
      onClick={() => onEditTask(task)}
      className={`group relative bg-white dark:bg-slate-850 rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 ${
        isCompleted
          ? 'border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/15 dark:bg-emerald-950/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-sage-300 dark:hover:border-sage-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-slate-300 dark:border-slate-600 hover:border-sage-500 dark:hover:border-sage-400 bg-white dark:bg-slate-800'
          }`}
          title={isCompleted ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          
          {/* Top badges row */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Category */}
              {task.category && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {task.category}
                </span>
              )}

              {/* Priority */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${priority.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>
            </div>

            {/* Deadline Pill */}
            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${deadlineInfo.badgeClass}`}>
              {deadlineInfo.label}
            </span>
          </div>

          {/* Title */}
          <h3 className={`text-base font-semibold text-slate-900 dark:text-white leading-snug mb-1.5 break-words ${
            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
          }`}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Dates row */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3 flex-wrap">
            {task.startDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Bắt đầu: {formatDate(task.startDate)}</span>
              </span>
            )}
            {task.endDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Hạn chót: {formatDate(task.endDate)}</span>
              </span>
            )}
          </div>

          {/* Subtasks Progress */}
          {subtasks.length > 0 && (
            <div className="mb-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <CheckSquare className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                  Tiến độ việc con ({completedSubtasks}/{subtasks.length})
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{subtaskPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sage-500 rounded-full transition-all duration-300"
                  style={{ width: `${subtaskPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Bottom metadata & Quick buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-3">
              {attachments.length > 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenVaultWithTask) onOpenVaultWithTask(task.id);
                  }}
                  className="inline-flex items-center gap-1 text-sage-700 dark:text-sage-300 hover:text-sage-800 font-medium bg-sage-50 dark:bg-sage-950/40 px-2 py-0.5 rounded-lg border border-sage-200/60 dark:border-sage-900/60"
                  title="Xem các tệp đính kèm trong kho lưu trữ"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{attachments.length} tệp/ảnh</span>
                </button>
              ) : (
                <span className="text-slate-400 dark:text-slate-600">Chưa có tệp</span>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Sửa công việc"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Bạn có chắc muốn xóa công việc "${task.title}"?`)) {
                    onDeleteTask(task.id);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Xóa công việc"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
