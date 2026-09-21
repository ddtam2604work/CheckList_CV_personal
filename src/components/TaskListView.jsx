import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  Plus, 
  CheckCircle, 
  Sparkles,
  SearchX
} from 'lucide-react';
import TaskCard from './TaskCard';

export default function TaskListView({
  tasks,
  searchQuery,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onOpenCreateTask,
  onOpenVaultWithTask
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline', 'priority', 'newest'

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    tasks.forEach(t => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return Array.from(set);
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description && t.description.toLowerCase().includes(q);
        const matchCat = t.category && t.category.toLowerCase().includes(q);
        const matchFiles = t.attachments && t.attachments.some(a => a.name.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchFiles) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          const now = new Date();
          if (t.status === 'completed' || !t.endDate || new Date(t.endDate) >= now) return false;
        } else if (t.status !== statusFilter) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        // Earliest deadline first; no deadline at the end
        if (!a.endDate && !b.endDate) return 0;
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate) - new Date(b.endDate);
      } else if (sortBy === 'priority') {
        const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });
  }, [tasks, searchQuery, statusFilter, categoryFilter, priorityFilter, sortBy]);

  return (
    <div>
      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 mb-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full lg:w-auto">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'todo', label: 'Chưa làm' },
              { id: 'in_progress', label: 'Đang làm' },
              { id: 'review', label: 'Chờ duyệt' },
              { id: 'completed', label: 'Đã xong' },
              { id: 'overdue', label: 'Quá hạn' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-sage-600 text-white shadow-soft shadow-sage-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters: Category, Priority, Sort */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end text-xs">
            
            {/* Category Dropdown */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            >
              <option value="all">Mọi mức độ ưu tiên</option>
              <option value="urgent">Khẩn cấp</option>
              <option value="high">Ưu tiên cao</option>
              <option value="medium">Bình thường</option>
              <option value="low">Thấp</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-750">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              >
                <option value="deadline">Hạn chót gần nhất</option>
                <option value="priority">Độ ưu tiên cao nhất</option>
                <option value="newest">Mới tạo nhất</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onToggleStatus={onToggleStatus}
              onOpenVaultWithTask={onOpenVaultWithTask}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center shadow-soft">
          <div className="w-16 h-16 rounded-2xl bg-sage-50 dark:bg-sage-950/50 text-sage-600 dark:text-sage-400 flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            Không tìm thấy công việc nào
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            Không có công việc nào khớp với bộ lọc hiện tại hoặc bạn chưa tạo task mới nào.
          </p>
          <button
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 transition-all shadow-soft shadow-sage-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo công việc ngay</span>
          </button>
        </div>
      )}
    </div>
  );
}
