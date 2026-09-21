import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Paperclip, 
  CheckSquare, 
  X,
  Filter
} from 'lucide-react';
import { formatDateTime, formatDate, getDeadlineInfo, PRIORITY_CONFIG } from '../utils/helpers';

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function CalendarTimelineView({ 
  tasks, 
  onEditTask, 
  onToggleStatus, 
  onOpenCreateTask,
  onOpenVaultWithTask 
}) {
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarMode, setCalendarMode] = useState('month'); // 'month', 'week', 'agenda'
  const [selectedDayTasks, setSelectedDayTasks] = useState(null); // For "+X more" popover
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'completed', 'overdue'

  // Current year & month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (calendarMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (calendarMode === 'week') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() - 7);
      setCurrentDate(nextDate);
    } else {
      const nextDate = new Date(currentDate);
      nextDate.setMonth(nextDate.getMonth() - 1);
      setCurrentDate(nextDate);
    }
  };

  const handleNext = () => {
    if (calendarMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (calendarMode === 'week') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 7);
      setCurrentDate(nextDate);
    } else {
      const nextDate = new Date(currentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      setCurrentDate(nextDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper: check if a date string is within a day
  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isDateInRange = (targetDate, startStr, endStr) => {
    if (!startStr && !endStr) return false;
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
    
    let start = null;
    let end = null;
    if (startStr) {
      const s = new Date(startStr);
      start = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
    }
    if (endStr) {
      const e = new Date(endStr);
      end = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
    }

    if (start && end) {
      return target >= start && target <= end;
    }
    if (start) return target === start;
    if (end) return target === end;
    return false;
  };

  // Filter tasks based on statusFilter
  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(t => {
      if (statusFilter === 'active') return t.status !== 'completed';
      if (statusFilter === 'completed') return t.status === 'completed';
      if (statusFilter === 'overdue') {
        return t.status !== 'completed' && t.endDate && new Date(t.endDate) < now;
      }
      return true;
    });
  }, [tasks, statusFilter]);

  // Generate Month Grid Data (similar to Google Calendar)
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Get day of week for 1st of month (0 = Sun, 1 = Mon... -> adjust Mon = 0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Padding from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date()),
        tasks: filteredTasks.filter(t => isDateInRange(d, t.startDate, t.endDate))
      });
    }

    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: isSameDay(d, new Date()),
        tasks: filteredTasks.filter(t => isDateInRange(d, t.startDate, t.endDate))
      });
    }

    // Padding for next month to complete 35 or 42 grid cells (5 or 6 weeks)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date()),
        tasks: filteredTasks.filter(t => isDateInRange(d, t.startDate, t.endDate))
      });
    }

    return days;
  }, [currentYear, currentMonth, filteredTasks]);

  // Generate Week View Days (7 days from Monday to Sunday of the week)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      days.push({
        date: current,
        weekdayName: WEEKDAYS[i],
        isToday: isSameDay(current, new Date()),
        tasks: filteredTasks.filter(t => isDateInRange(current, t.startDate, t.endDate))
      });
    }
    return days;
  }, [currentDate, filteredTasks]);

  // Format month title
  const monthTitle = `Tháng ${currentMonth + 1}, ${currentYear}`;
  const weekTitle = useMemo(() => {
    if (!weekDays.length) return '';
    const start = weekDays[0].date;
    const end = weekDays[6].date;
    return `${start.getDate()} Thg ${start.getMonth() + 1} - ${end.getDate()} Thg ${end.getMonth() + 1}, ${end.getFullYear()}`;
  }, [weekDays]);

  const handleDayClick = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const dateString = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    if (onOpenCreateTask) {
      onOpenCreateTask(dateString);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Google Calendar Style Toolbar */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Today & Navigation & Title */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Today Button */}
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200/70 dark:border-slate-700"
            >
              Hôm nay
            </button>

            {/* Prev & Next Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                title="Trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                title="Sau"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Current Period Title */}
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight ml-1">
              {calendarMode === 'week' ? weekTitle : monthTitle}
            </h2>

          </div>

          {/* Right: View Mode Selector & Status Filter */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            >
              <option value="all">Tất cả việc</option>
              <option value="active">Đang tiến hành</option>
              <option value="completed">Đã xong</option>
              <option value="overdue">Quá hạn</option>
            </select>

            {/* Mode Switch: Tháng, Tuần, Lịch trình */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[
                { id: 'month', label: 'Tháng' },
                { id: 'week', label: 'Tuần' },
                { id: 'agenda', label: 'Lịch trình' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCalendarMode(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    calendarMode === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-soft'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* VIEW 1: MONTH VIEW (GOOGLE CALENDAR STYLE) */}
      {calendarMode === 'month' && (
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
          
          {/* 7 Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
            {WEEKDAYS.map((day, idx) => (
              <div 
                key={day} 
                className={`py-2.5 text-xs font-bold uppercase tracking-wider ${
                  idx === 5 || idx === 6 ? 'text-sage-700 dark:text-sage-400' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {monthDays.map((cell, idx) => {
              const dayNum = cell.date.getDate();
              const tasksForDay = cell.tasks;
              const displayLimit = 3;
              const hasMore = tasksForDay.length > displayLimit;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(cell.date)}
                  className={`min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors relative group cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50 ${
                    !cell.isCurrentMonth ? 'bg-slate-50/40 dark:bg-slate-900/30' : ''
                  }`}
                >
                  {/* Top row: Date Number & Add Icon on hover */}
                  <div className="flex items-center justify-between mb-1">
                    <span 
                      className={`text-xs font-bold ${
                        cell.isToday
                          ? 'w-6 h-6 rounded-full bg-sage-600 text-white flex items-center justify-center shadow-sm shadow-sage-600/40'
                          : cell.isCurrentMonth
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {dayNum}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(cell.date);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-sage-600 transition-opacity"
                      title="Tạo công việc vào ngày này"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tasks in day cell */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {tasksForDay.slice(0, displayLimit).map((task) => {
                      const isDone = task.status === 'completed';
                      const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                      
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium truncate flex items-center gap-1 transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 line-through opacity-70'
                              : 'bg-sage-50 dark:bg-sage-950/60 text-slate-800 dark:text-slate-200 hover:bg-sage-100 dark:hover:bg-sage-900/60 border border-sage-200/60 dark:border-sage-800'
                          }`}
                          title={`${task.title} - Bắt đầu: ${formatDateTime(task.startDate)} | Hạn chót: ${formatDateTime(task.endDate)}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.dot}`} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}

                    {/* Show more badge */}
                    {hasMore && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayTasks(cell);
                        }}
                        className="text-[10px] font-bold text-sage-700 dark:text-sage-400 hover:underline px-1 block"
                      >
                        + {tasksForDay.length - displayLimit} công việc khác
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: WEEK VIEW (GOOGLE CALENDAR STYLE 7 COLUMNS) */}
      {calendarMode === 'week' && (
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[750px] divide-x divide-slate-100 dark:divide-slate-800">
            {weekDays.map((col, idx) => (
              <div key={idx} className="flex flex-col min-h-[420px]">
                
                {/* Column Day Header */}
                <div 
                  onClick={() => handleDayClick(col.date)}
                  className={`p-3 text-center border-b border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    col.isToday ? 'bg-sage-50/70 dark:bg-sage-950/30' : 'bg-slate-50/40 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    {col.weekdayName}
                  </div>
                  <div className="flex items-center justify-center">
                    <span className={`text-base font-extrabold ${
                      col.isToday
                        ? 'w-7 h-7 rounded-full bg-sage-600 text-white flex items-center justify-center shadow-sm shadow-sage-600/30'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {col.date.getDate()}
                    </span>
                  </div>
                </div>

                {/* Day Tasks column content */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                  {col.tasks.map((task) => {
                    const isDone = task.status === 'completed';
                    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    const subtasks = task.subtasks || [];
                    const completedSubtasks = subtasks.filter(s => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`p-2.5 rounded-xl border text-xs shadow-soft transition-all cursor-pointer hover:shadow-soft-lg hover:-translate-y-0.5 ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/40'
                            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:border-sage-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${priority.color}`}>
                            {priority.label}
                          </span>
                          {task.endDate && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(task.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        <h4 className={`font-semibold text-slate-900 dark:text-white leading-snug mb-1.5 break-words ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}>
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-750">
                          {subtasks.length > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-sage-600" />
                              <span>{completedSubtasks}/{subtasks.length}</span>
                            </span>
                          )}
                          {(task.attachments || []).length > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              <span>{(task.attachments || []).length}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {col.tasks.length === 0 && (
                    <div 
                      onClick={() => handleDayClick(col.date)}
                      className="h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-400 cursor-pointer hover:border-sage-400 transition-colors"
                    >
                      + Tạo việc
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: AGENDA / TIMELINE STREAM */}
      {calendarMode === 'agenda' && (
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft">
          {filteredTasks.length > 0 ? (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-5">
              {filteredTasks
                .sort((a, b) => new Date(a.endDate || a.startDate || 0) - new Date(b.endDate || b.startDate || 0))
                .map((task) => {
                  const deadlineInfo = getDeadlineInfo(task.endDate, task.status);
                  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const isDone = task.status === 'completed';

                  return (
                    <div key={task.id} className="relative group">
                      <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        isDone 
                          ? 'bg-emerald-500' 
                          : deadlineInfo.state === 'overdue' 
                            ? 'bg-rose-500' 
                            : 'bg-sage-600'
                      }`} />

                      <div 
                        onClick={() => onEditTask(task)}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-750 hover:border-sage-400 transition-all cursor-pointer shadow-soft"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                          <div className="flex items-center gap-2">
                            {task.category && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {task.category}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${priority.color}`}>
                              {priority.label}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${deadlineInfo.badgeClass}`}>
                            {deadlineInfo.label}
                          </span>
                        </div>

                        <h4 className={`text-sm font-bold text-slate-900 dark:text-white mb-1 ${isDone ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-750 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Bắt đầu: {formatDateTime(task.startDate)}</span>
                          </span>
                          <span>→</span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-rose-400" />
                            <span>Hạn chót: {formatDateTime(task.endDate)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Không có công việc nào theo bộ lọc này.
            </div>
          )}
        </div>
      )}

      {/* Modal: Xem tất cả công việc của 1 ngày (khi click vào "+X việc khác") */}
      {selectedDayTasks && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Công việc ngày {selectedDayTasks.date.toLocaleDateString('vi-VN')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedDayTasks.tasks.length} công việc diễn ra trong ngày này
                </p>
              </div>
              <button
                onClick={() => setSelectedDayTasks(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {selectedDayTasks.tasks.map((task) => {
                const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const isDone = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedDayTasks(null);
                      onEditTask(task);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-sage-400 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-soft"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${priority.color}`}>
                          {priority.label}
                        </span>
                        {task.category && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            {task.category}
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}>
                        {task.title}
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {task.startDate && `Từ: ${new Date(task.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} `}
                        {task.endDate && `→ Đến: ${new Date(task.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const d = selectedDayTasks.date;
                  setSelectedDayTasks(null);
                  handleDayClick(d);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 flex items-center gap-1.5 shadow-soft shadow-sage-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm việc vào ngày này</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDayTasks(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
