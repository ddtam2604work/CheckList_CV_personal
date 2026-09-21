import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import StatsBanner from './components/StatsBanner';
import ViewSwitcher from './components/ViewSwitcher';
import TaskListView from './components/TaskListView';
import KanbanView from './components/KanbanView';
import CalendarTimelineView from './components/CalendarTimelineView';
import AnalyticsView from './components/AnalyticsView';
import MediaVaultView from './components/MediaVaultView';
import TaskModal from './components/TaskModal';
import BackupModal from './components/BackupModal';
import ImageLightboxModal from './components/ImageLightboxModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import { loadTasks, saveTasks, loadCategories, saveCategories } from './services/storageService';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [vaultSelectedTaskId, setVaultSelectedTaskId] = useState(null);
  const [categories, setCategories] = useState([]);

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme_mode');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync dark mode class with html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  // Load initial tasks & categories from IndexedDB
  useEffect(() => {
    async function initData() {
      try {
        const [loadedTasks, loadedCats] = await Promise.all([
          loadTasks(),
          loadCategories()
        ]);
        setTasks(loadedTasks || []);
        setCategories(loadedCats || []);
      } catch (err) {
        console.error('Lỗi khởi tạo dữ liệu:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Save tasks on changes
  const updateTasks = async (newTasks) => {
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  // Category actions
  const handleAddCategory = async (catName, color = 'sage') => {
    if (!catName || categories.some(c => c.name.toLowerCase() === catName.toLowerCase())) {
      return;
    }
    const newCat = {
      id: 'cat-' + Date.now(),
      name: catName,
      color: color
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    await saveCategories(updated);
  };

  const handleDeleteCategory = async (catId) => {
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    await saveCategories(updated);
  };

  const handleOpenCreateTask = (initialDate = null) => {
    if (initialDate) {
      setTaskToEdit({
        _isNew: true,
        startDate: initialDate + 'T08:00',
        endDate: initialDate + 'T17:00',
      });
    } else {
      setTaskToEdit(null);
    }
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    let updated;
    const exists = tasks.some(t => t.id === taskData.id);
    if (exists) {
      updated = tasks.map(t => t.id === taskData.id ? taskData : t);
    } else {
      updated = [taskData, ...tasks];
    }
    await updateTasks(updated);
  };

  const handleDeleteTask = async (taskId) => {
    const updated = tasks.filter(t => t.id !== taskId);
    await updateTasks(updated);
  };

  const handleToggleStatus = async (taskId, newStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    await updateTasks(updated);
  };

  const handleOpenVaultWithTask = (taskId) => {
    setVaultSelectedTaskId(taskId);
    setCurrentView('vault');
  };

  // Count total attachments for ViewSwitcher badge
  const totalAttachmentsCount = useMemo(() => {
    return tasks.reduce((acc, t) => acc + (t.attachments?.length || 0), 0);
  }, [tasks]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreateTask={handleOpenCreateTask}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-10 h-10 border-3 border-sage-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-medium">Đang tải dữ liệu và tài liệu lưu trữ...</p>
          </div>
        ) : (
          <>
            {/* Quick KPI Stats Banner */}
            <StatsBanner tasks={tasks} />

            {/* View Switcher Controls */}
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <ViewSwitcher
                currentView={currentView}
                setCurrentView={setCurrentView}
                attachmentsCount={totalAttachmentsCount}
              />
            </div>

            {/* Views rendering */}
            <div className="transition-all">
              {currentView === 'list' && (
                <TaskListView
                  tasks={tasks}
                  categories={categories}
                  onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
                  searchQuery={searchQuery}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleStatus={handleToggleStatus}
                  onOpenCreateTask={handleOpenCreateTask}
                  onOpenVaultWithTask={handleOpenVaultWithTask}
                />
              )}

              {currentView === 'kanban' && (
                <KanbanView
                  tasks={tasks}
                  searchQuery={searchQuery}
                  onEditTask={handleEditTask}
                  onToggleStatus={handleToggleStatus}
                  onOpenCreateTask={handleOpenCreateTask}
                  onOpenVaultWithTask={handleOpenVaultWithTask}
                />
              )}

              {currentView === 'calendar' && (
                <CalendarTimelineView
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onToggleStatus={handleToggleStatus}
                  onOpenCreateTask={handleOpenCreateTask}
                  onOpenVaultWithTask={handleOpenVaultWithTask}
                />
              )}

              {currentView === 'analytics' && (
                <AnalyticsView
                  tasks={tasks}
                  isDark={isDark}
                />
              )}

              {currentView === 'vault' && (
                <MediaVaultView
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onPreviewImage={(img) => setLightboxImage(img)}
                  initialTaskId={vaultSelectedTaskId}
                />
              )}
            </div>
          </>
        )}

      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        onSaveTask={handleSaveTask}
        onPreviewImage={(img) => setLightboxImage(img)}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        tasks={tasks}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={(data) => {
          if (data && data.tasks) setTasks(data.tasks);
          else if (Array.isArray(data)) setTasks(data);
          if (data && data.categories) setCategories(data.categories);
        }}
      />

      <ImageLightboxModal
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CheckList CV Personal. Lưu trữ an toàn & bảo mật trên thiết bị.</p>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <a 
              href="https://github.com/ddtam2604work/CheckList_CV_personal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-sage-600 transition-colors"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <button 
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-sage-600 transition-colors"
            >
              Sao lưu dữ liệu
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
