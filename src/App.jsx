import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import Header from './components/Header';
import StatsBanner from './components/StatsBanner';
import ViewSwitcher from './components/ViewSwitcher';
import TaskListView from './components/TaskListView';
import KanbanView from './components/KanbanView';
import CalendarTimelineView from './components/CalendarTimelineView';
import AnalyticsView from './components/AnalyticsView';
import MediaVaultView from './components/MediaVaultView';
import ProductLaunchView from './components/ProductLaunchView';
import ProductModal from './components/ProductModal';
import AICopilotDrawer from './components/AICopilotDrawer';
import TaskModal from './components/TaskModal';
import BackupModal from './components/BackupModal';
import ImageLightboxModal from './components/ImageLightboxModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import ToastContainer from './components/ToastContainer';
import { 
  loadTasks, 
  saveTasks, 
  loadCategories, 
  saveCategories, 
  loadProducts, 
  saveProducts,
  SAMPLE_PRODUCTS 
} from './services/storageService';
import { 
  generateNotifications, 
  getReadNotificationIds, 
  saveReadNotificationIds, 
  getDismissedNotificationIds, 
  saveDismissedNotificationIds 
} from './services/notificationService';
import { 
  sendProductLaunchEmail, 
  isWithinTwoDaysWindow, 
  DEFAULT_NOTIFICATION_EMAIL 
} from './services/emailService';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
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

  // Load initial tasks, categories & products from IndexedDB
  useEffect(() => {
    async function initData() {
      try {
        const [loadedTasks, loadedCats, loadedProducts] = await Promise.all([
          loadTasks(),
          loadCategories(),
          loadProducts()
        ]);
        setTasks(loadedTasks || []);
        setCategories(loadedCats || []);
        setProducts(loadedProducts || []);
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

  // Save products on changes
  const updateProducts = async (newProducts) => {
    setProducts(newProducts);
    await saveProducts(newProducts);
  };

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const showToast = (title, message = '', type = 'info', duration = 3500) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);
  };

  const handleDismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Notifications state
  const [readNotifIds, setReadNotifIds] = useState(getReadNotificationIds);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(getDismissedNotificationIds);

  const notifications = useMemo(() => {
    return generateNotifications(tasks, products);
  }, [tasks, products, readNotifIds, dismissedNotifIds]);

  const launchesDueCount = useMemo(() => {
    return products.filter((p) => isWithinTwoDaysWindow(p.releaseDate)).length;
  }, [products]);

  // Tự động kiểm tra và gửi email thông báo trước 2 ngày (48 giờ) đến duytam262004@gmail.com
  useEffect(() => {
    if (isLoading || products.length === 0) return;

    const scanAndNotify = async () => {
      const dueProducts = products.filter(
        (p) => isWithinTwoDaysWindow(p.releaseDate) && !p.notified2DaysBefore
      );

      if (dueProducts.length === 0) return;

      for (const prod of dueProducts) {
        try {
          const res = await sendProductLaunchEmail({ product: prod });
          if (res.success) {
            showToast(
              'Tự động gửi email thông báo 🚀',
              `Sản phẩm "${prod.name}" sắp ra mắt sau ít hơn 2 ngày. Đã gửi email đến ${prod.email || DEFAULT_NOTIFICATION_EMAIL}.`,
              'success',
              5000
            );
            setProducts((prev) => {
              const updated = prev.map((item) =>
                item.id === prod.id
                  ? {
                      ...item,
                      notified2DaysBefore: true,
                      notifiedAt: new Date().toISOString()
                    }
                  : item
              );
              saveProducts(updated);
              return updated;
            });
          }
        } catch (err) {
          console.error('Lỗi tự động gửi thông báo lịch ra mắt:', err);
        }
      }
    };

    scanAndNotify();
    const interval = setInterval(scanAndNotify, 60000);
    return () => clearInterval(interval);
  }, [products, isLoading]);

  const handleMarkAsRead = (notifId) => {
    const updated = Array.from(new Set([...readNotifIds, notifId]));
    setReadNotifIds(updated);
    saveReadNotificationIds(updated);
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(updated);
    saveReadNotificationIds(updated);
    showToast('Đã đọc tất cả', 'Tất cả thông báo đã được đánh dấu là đã đọc.', 'info');
  };

  const handleDismissNotification = (notifId) => {
    const updated = Array.from(new Set([...dismissedNotifIds, notifId]));
    setDismissedNotifIds(updated);
    saveDismissedNotificationIds(updated);
  };

  const handleClearAllNotifications = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...dismissedNotifIds, ...allIds]));
    setDismissedNotifIds(updated);
    saveDismissedNotificationIds(updated);
    showToast('Đã dọn dẹp', 'Toàn bộ thông báo đã được dọn sạch.', 'info');
  };

  const handleSelectTaskFromNotification = (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      handleEditTask(target);
    }
  };

  const handleSelectProductFromNotification = (productId) => {
    setCurrentView('launches');
    const target = products.find((p) => p.id === productId);
    if (target) {
      handleEditProduct(target);
    }
  };

  // Product launch actions
  const handleSaveProduct = async (productData) => {
    let updated;
    const exists = products.some((p) => p.id === productData.id);
    if (exists) {
      updated = products.map((p) => (p.id === productData.id ? productData : p));
      showToast('Cập nhật thành công', `Đã lưu các thay đổi của "${productData.name}".`, 'info');
    } else {
      updated = [productData, ...products];
      showToast('Lên lịch thành công 🚀', `Đã thêm "${productData.name}" vào lịch ra mắt.`, 'success');
    }
    await updateProducts(updated);
  };

  const handleDeleteProduct = async (productId) => {
    const target = products.find((p) => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    await updateProducts(updated);
    showToast('Đã xóa sản phẩm', `"${target?.name || 'Sản phẩm'}" đã được loại bỏ.`, 'warning');
  };

  const handleUpdateSingleProduct = async (updatedProduct) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    await updateProducts(updated);
  };

  const handleLoadSampleProducts = async () => {
    await updateProducts(SAMPLE_PRODUCTS);
    showToast('Đã nạp dữ liệu mẫu test', 'Đã thêm 2 sản phẩm mẫu để kiểm tra tính năng đếm ngược & gửi mail.', 'info');
  };

  const handleClearSampleProducts = async () => {
    await updateProducts([]);
    showToast('Đã dọn sạch kho sản phẩm', 'Kho dữ liệu lịch ra mắt hoàn toàn trống, sẵn sàng cho việc sử dụng thực tế.', 'info');
  };

  const handleOpenCreateProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  // Category actions
  const handleAddCategory = async (catName, color = 'sage') => {
    if (!catName || categories.some(c => c.name.toLowerCase() === catName.toLowerCase())) {
      showToast('Không thể thêm', 'Tên nhóm không hợp lệ hoặc đã tồn tại.', 'warning');
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
    showToast('Thêm nhóm thành công', `Đã tạo nhóm "${catName}".`, 'success');
  };

  const handleDeleteCategory = async (catId) => {
    const cat = categories.find(c => c.id === catId);
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    await saveCategories(updated);
    showToast('Đã xóa nhóm', `Đã loại bỏ nhóm "${cat?.name || ''}".`, 'warning');
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
      showToast('Cập nhật thành công', `Đã lưu các thay đổi của "${taskData.title}".`, 'info');
    } else {
      updated = [taskData, ...tasks];
      showToast('Tạo công việc thành công', `Đã thêm "${taskData.title}" vào danh sách.`, 'success');
    }
    await updateTasks(updated);
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const updated = tasks.filter(t => t.id !== taskId);
    await updateTasks(updated);
    showToast('Đã xóa công việc', `"${task?.title || 'Công việc'}" đã được xóa khỏi hệ thống.`, 'warning');
  };

  const handleToggleStatus = async (taskId, newStatus) => {
    const target = tasks.find(t => t.id === taskId);
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    await updateTasks(updated);
    if (newStatus === 'done') {
      showToast('Hoàn thành xuất sắc! 🎉', `Đã hoàn thành: "${target?.title || ''}".`, 'success');
    } else if (newStatus === 'in_progress') {
      showToast('Bắt đầu thực hiện', `Đang xử lý: "${target?.title || ''}".`, 'info');
    } else {
      showToast('Chuyển trạng thái', `Chuyển về Cần làm: "${target?.title || ''}".`, 'info');
    }
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
        onOpenAICopilot={() => setIsAICopilotOpen(true)}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDismissNotification={handleDismissNotification}
        onClearAllNotifications={handleClearAllNotifications}
        onSelectTask={handleSelectTaskFromNotification}
        onSelectProduct={handleSelectProductFromNotification}
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
                launchesDueCount={launchesDueCount}
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

              {currentView === 'launches' && (
                <ProductLaunchView
                  products={products}
                  onOpenCreateProduct={handleOpenCreateProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onUpdateProduct={handleUpdateSingleProduct}
                  onLoadSampleProducts={handleLoadSampleProducts}
                  onClearSampleProducts={handleClearSampleProducts}
                  onTriggerToast={showToast}
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
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        onSaveProduct={handleSaveProduct}
        onTriggerToast={showToast}
      />

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
          let count = 0;
          if (data && data.tasks) {
            setTasks(data.tasks);
            count = data.tasks.length;
          } else if (Array.isArray(data)) {
            setTasks(data);
            count = data.length;
          }
          if (data && data.categories) setCategories(data.categories);
          if (data && data.products) setProducts(data.products);
          showToast('Khôi phục dữ liệu thành công', `Đã khôi phục ${count} công việc và dữ liệu sản phẩm.`, 'success');
        }}
      />

      <ImageLightboxModal
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
        tasks={tasks}
        products={products}
        categories={categories}
      />

      {/* Floating AI Copilot Trigger Button */}
      <button
        id="btn-floating-ai-copilot"
        onClick={() => setIsAICopilotOpen(true)}
        title="Mở Trợ lý AI Copilot"
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-sage-600 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group border border-white/20"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-bold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          AI Copilot
        </span>
      </button>

      {/* Floating Toast System */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

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
