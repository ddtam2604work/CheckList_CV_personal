import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Calendar, 
  X,
  ExternalLink,
  ShieldCheck,
  BellRing
} from 'lucide-react';
import { 
  requestBrowserNotificationPermission 
} from '../services/notificationService';

export default function NotificationCenter({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDismissNotification,
  onClearAllNotifications,
  onSelectTask,
  onOpenBackupModal,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'deadline' | 'system'
  const [browserPermission, setBrowserPermission] = useState(() => {
    return 'Notification' in window ? Notification.permission : 'unsupported';
  });

  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Đếm số lượng chưa đọc
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Lọc theo tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'deadline') {
      return notifications.filter((n) => n.type === 'overdue' || n.type === 'due_soon');
    }
    if (activeTab === 'system') {
      return notifications.filter((n) => n.type === 'system');
    }
    return notifications;
  }, [notifications, activeTab]);

  // Xử lý bật thông báo trình duyệt
  const handleEnableBrowserNotification = async () => {
    const res = await requestBrowserNotificationPermission();
    setBrowserPermission(res);
  };

  const handleItemClick = (notification) => {
    onMarkAsRead(notification.id);
    if (notification.taskId) {
      onSelectTask(notification.taskId);
      setIsOpen(false);
    } else if (notification.type === 'system') {
      if (onOpenBackupModal) onOpenBackupModal();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        id="btn-notification-center"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Trung tâm thông báo"
        className={`relative p-2 rounded-xl transition-all duration-200 border ${
          isOpen
            ? 'bg-sage-100/80 dark:bg-sage-950/60 border-sage-300 dark:border-sage-700 text-sage-700 dark:text-sage-300'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2.5 w-[360px] sm:w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-200"
          style={{
            maxHeight: 'calc(100vh - 100px)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-850/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sage-100 dark:bg-sage-950/70 text-sage-600 dark:text-sage-400 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Thông báo
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                      {unreadCount} mới
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cập nhật tiến độ & hạn chót công việc
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  title="Đánh dấu tất cả đã đọc"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-sage-600 dark:text-slate-400 dark:hover:text-sage-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAllNotifications}
                  title="Xóa toàn bộ thông báo"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Browser Notification Banner if not enabled */}
          {browserPermission === 'default' && (
            <div className="px-4 py-2.5 bg-sage-50/70 dark:bg-sage-950/40 border-b border-sage-100 dark:border-sage-900/50 flex items-center justify-between text-xs text-sage-800 dark:text-sage-300">
              <span className="flex items-center gap-1.5 truncate">
                <Bell className="w-3.5 h-3.5 shrink-0" />
                Bật thông báo đẩy để không bỏ lỡ hạn chót
              </span>
              <button
                onClick={handleEnableBrowserNotification}
                className="shrink-0 font-semibold text-sage-600 hover:text-sage-700 dark:text-sage-400 underline ml-2"
              >
                Cho phép
              </button>
            </div>
          )}

          {/* Tabs Filter */}
          <div className="flex items-center px-4 pt-2.5 pb-2 gap-1.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('deadline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'deadline'
                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-3 h-3" />
              Hạn chót ({notifications.filter((n) => n.type === 'overdue' || n.type === 'due_soon').length})
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'system'
                  ? 'bg-sage-100/80 dark:bg-sage-950/60 text-sage-800 dark:text-sage-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              Hệ thống ({notifications.filter((n) => n.type === 'system').length})
            </button>
          </div>

          {/* List of Notifications */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1.5 max-h-[380px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 stroke-[1.8] text-sage-500 dark:text-sage-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Không có thông báo nào!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
                  Tiến độ công việc của bạn đang diễn ra rất tốt. Các thông báo nhắc việc sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isOverdue = n.type === 'overdue';
                const isDueSoon = n.type === 'due_soon';
                const isSystem = n.type === 'system';

                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`group relative p-3 rounded-xl transition-all cursor-pointer border ${
                      !n.isRead
                        ? 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon Indicator */}
                      <div
                        className={`shrink-0 p-2 rounded-xl mt-0.5 ${
                          isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                            : isDueSoon
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
                            : 'bg-sage-100 dark:bg-sage-950/70 text-sage-600 dark:text-sage-400'
                        }`}
                      >
                        {isOverdue && <AlertTriangle className="w-4 h-4" />}
                        {isDueSoon && <Clock className="w-4 h-4" />}
                        {isSystem && <ShieldCheck className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <h4
                            className={`text-xs leading-snug line-clamp-1 ${
                              !n.isRead
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'font-medium text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          {n.taskId && (
                            <span className="inline-flex items-center gap-1 font-medium text-sage-600 dark:text-sage-400">
                              <ExternalLink className="w-2.5 h-2.5" />
                              Mở công việc
                            </span>
                          )}
                          {isSystem && (
                            <span className="inline-flex items-center gap-1 font-medium text-sage-600 dark:text-sage-400">
                              <ExternalLink className="w-2.5 h-2.5" />
                              Xem sao lưu
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete individual button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissNotification(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        title="Xóa thông báo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Tự động đồng bộ theo thời gian thực</span>
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="font-medium text-sage-600 dark:text-sage-400 hover:underline"
              >
                Đọc tất cả
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
