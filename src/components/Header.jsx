import React from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  Database, 
  X
} from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  onOpenCreateTask,
  onOpenBackupModal,
  isDark,
  toggleDarkMode
}) {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center text-white shadow-soft shadow-sage-500/20">
              <CheckSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                CheckList <span className="text-sage-600 dark:text-sage-400 font-extrabold">CV</span>
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
                Quản lý công việc & tài liệu cá nhân
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm công việc, tài liệu..."
                className="w-full pl-9 pr-9 py-2 rounded-xl text-sm bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200/60 dark:border-slate-750 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Create Task Button */}
            <button
              id="btn-create-task"
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-sage-600 hover:bg-sage-700 active:scale-[0.98] transition-all shadow-soft shadow-sage-600/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Tạo Task</span>
            </button>

            {/* Backup / Restore */}
            <button
              id="btn-backup-restore"
              onClick={onOpenBackupModal}
              title="Sao lưu & Phục hồi dữ liệu"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-800"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              id="btn-toggle-darkmode"
              onClick={toggleDarkMode}
              title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* GitHub Repo Link */}
            <a
              href="https://github.com/ddtam2604work/CheckList_CV_personal"
              target="_blank"
              rel="noopener noreferrer"
              title="Xem kho lưu trữ GitHub"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-800"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
          </div>

        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công việc, tài liệu..."
              className="w-full pl-9 pr-9 py-2 rounded-xl text-sm bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200/60 dark:border-slate-750 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
