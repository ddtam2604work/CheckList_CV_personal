import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ListTodo, 
  TrendingUp 
} from 'lucide-react';

export default function StatsBanner({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  
  // Overdue check
  const now = new Date();
  const overdue = tasks.filter(t => {
    if (t.status === 'completed' || !t.endDate) return false;
    return new Date(t.endDate) < now;
  }).length;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4 sm:p-5 shadow-soft transition-colors mb-6">
      
      {/* Top metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        
        {/* Total */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750/50">
          <div className="w-10 h-10 rounded-lg bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {total}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Tổng công việc
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-sage-50/70 dark:bg-sage-950/30 border border-sage-100 dark:border-sage-900/40">
          <div className="w-10 h-10 rounded-lg bg-sage-200/70 dark:bg-sage-900/60 text-sage-700 dark:text-sage-300 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-sage-900 dark:text-sage-200 leading-tight">
              {inProgress}
            </div>
            <div className="text-xs text-sage-700 dark:text-sage-400 font-medium">
              Đang thực hiện
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="w-10 h-10 rounded-lg bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
              {completed}
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Đã hoàn thành
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
          <div className="w-10 h-10 rounded-lg bg-rose-200/70 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-rose-900 dark:text-rose-200 leading-tight">
              {overdue}
            </div>
            <div className="text-xs text-rose-700 dark:text-rose-400 font-medium">
              Công việc trễ hạn
            </div>
          </div>
        </div>

      </div>

      {/* Progress Bar & Rate */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            Tiến độ hoàn thành công việc
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {completed}/{total} ({percent}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sage-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

    </div>
  );
}
