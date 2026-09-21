import React from 'react';
import { 
  CheckSquare, 
  Kanban, 
  CalendarDays, 
  PieChart, 
  FolderArchive 
} from 'lucide-react';

export default function ViewSwitcher({ currentView, setCurrentView, attachmentsCount }) {
  const tabs = [
    { id: 'list', label: 'Danh sách', icon: CheckSquare },
    { id: 'kanban', label: 'Bảng Kanban', icon: Kanban },
    { id: 'calendar', label: 'Lịch & Timeline', icon: CalendarDays },
    { id: 'analytics', label: 'Biểu đồ phân tích', icon: PieChart },
    { 
      id: 'vault', 
      label: 'Kho tài liệu & Ảnh', 
      icon: FolderArchive,
      badge: attachmentsCount 
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/60 dark:bg-slate-850/80 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-none border border-slate-200/60 dark:border-slate-800 transition-colors">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-view-${tab.id}`}
            onClick={() => setCurrentView(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-soft font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-sage-600 dark:text-sage-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive 
                  ? 'bg-sage-100 text-sage-800 dark:bg-sage-950 dark:text-sage-300' 
                  : 'bg-slate-300/60 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
