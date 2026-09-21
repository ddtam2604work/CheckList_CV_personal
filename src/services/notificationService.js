/**
 * Notification Service for CheckList CV
 * Quản lý thông báo tự động (quá hạn, sắp đến hạn, sao lưu) và trạng thái đọc/xóa
 */

const STORAGE_KEY_READ = 'checklist_notifications_read';
const STORAGE_KEY_DISMISSED = 'checklist_notifications_dismissed';

export function getReadNotificationIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReadNotificationIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(ids));
  } catch (err) {
    console.error('Lỗi lưu trạng thái đã đọc thông báo:', err);
  }
}

export function getDismissedNotificationIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDismissedNotificationIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(ids));
  } catch (err) {
    console.error('Lỗi lưu danh sách thông báo đã xóa:', err);
  }
}

/**
 * Sinh danh sách thông báo thông minh từ mảng tasks
 */
export function generateNotifications(tasks = []) {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dismissedIds = new Set(getDismissedNotificationIds());
  const readIds = new Set(getReadNotificationIds());

  const notifications = [];

  tasks.forEach((task) => {
    if (!task || task.status === 'done') return;

    if (task.endDate) {
      const dueDate = new Date(task.endDate);

      // 1. Kiểm tra công việc quá hạn
      if (dueDate < now) {
        const id = `overdue-${task.id}-${task.endDate}`;
        if (!dismissedIds.has(id)) {
          const diffHours = Math.round((now - dueDate) / (1000 * 60 * 60));
          const diffText = diffHours < 24 
            ? `${diffHours} giờ trước` 
            : `${Math.round(diffHours / 24)} ngày trước`;

          notifications.push({
            id,
            taskId: task.id,
            type: 'overdue',
            priority: 'danger',
            title: `Quá hạn: ${task.title}`,
            message: `Công việc này đã trễ hạn từ ${diffText}. Vui lòng kiểm tra và xử lý ngay!`,
            date: dueDate,
            isRead: readIds.has(id),
          });
        }
      }
      // 2. Kiểm tra công việc sắp đến hạn trong vòng 24 giờ tới
      else if (dueDate <= next24Hours) {
        const id = `due-soon-${task.id}-${task.endDate}`;
        if (!dismissedIds.has(id)) {
          const diffHours = Math.max(1, Math.round((dueDate - now) / (1000 * 60 * 60)));
          const diffText = diffHours <= 1 
            ? 'ít hơn 1 giờ nữa' 
            : `trong khoảng ${diffHours} giờ nữa`;

          notifications.push({
            id,
            taskId: task.id,
            type: 'due_soon',
            priority: 'warning',
            title: `Sắp đến hạn: ${task.title}`,
            message: `Hạn chót hoàn thành ${diffText}. Đừng quên cập nhật tiến độ công việc!`,
            date: dueDate,
            isRead: readIds.has(id),
          });
        }
      }
    }
  });

  // 3. Thông báo nhắc nhở sao lưu định kỳ
  const lastBackupStr = localStorage.getItem('checklist_last_backup_date');
  const lastBackup = lastBackupStr ? new Date(lastBackupStr) : null;
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (!lastBackup || lastBackup < sevenDaysAgo) {
    const id = `backup-reminder-${now.toISOString().slice(0, 10)}`;
    if (!dismissedIds.has(id)) {
      notifications.push({
        id,
        taskId: null,
        type: 'system',
        priority: 'info',
        title: 'Nhắc nhở sao lưu dữ liệu',
        message: 'Bạn chưa tạo bản sao lưu JSON trong tuần qua. Hãy lưu trữ dự phòng để bảo vệ dữ liệu.',
        date: now,
        isRead: readIds.has(id),
      });
    }
  }

  // Sắp xếp: Ưu tiên Quá hạn (danger) -> Sắp đến hạn (warning) -> Hệ thống (info) -> Mới nhất
  const priorityWeight = { danger: 3, warning: 2, info: 1 };
  notifications.sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (diff !== 0) return diff;
    return new Date(b.date) - new Date(a.date);
  });

  return notifications;
}

/**
 * Trình duyệt Web Notifications API
 */
export async function requestBrowserNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return Notification.permission;
}

export function sendBrowserNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }
  try {
    return new Notification(title, {
      icon: '/data/icon.png',
      badge: '/data/icon.png',
      ...options,
    });
  } catch (err) {
    console.warn('Không thể gửi thông báo trình duyệt:', err);
    return null;
  }
}
