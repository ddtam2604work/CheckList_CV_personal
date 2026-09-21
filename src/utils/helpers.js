export function formatDateTime(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export function formatDate(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getDeadlineInfo(endDate, status) {
  if (status === 'completed') {
    return {
      label: 'Đã hoàn tất',
      state: 'completed',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
    };
  }

  if (!endDate) {
    return {
      label: 'Không có hạn',
      state: 'none',
      badgeClass: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    };
  }

  const now = new Date();
  const target = new Date(endDate);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: overdueDays === 0 ? 'Quá hạn vài giờ' : `Quá hạn ${overdueDays} ngày`,
      state: 'overdue',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
    };
  }

  if (diffHours <= 24) {
    return {
      label: diffHours <= 1 ? 'Hạn trong 1 giờ' : `Hạn trong ${diffHours} giờ`,
      state: 'imminent',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
    };
  }

  return {
    label: `Còn ${diffDays} ngày`,
    state: 'normal',
    badgeClass: 'bg-sage-50 text-sage-700 border-sage-200 dark:bg-sage-950/40 dark:text-sage-300 dark:border-sage-800/60'
  };
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const PRIORITY_CONFIG = {
  urgent: {
    label: 'Khẩn cấp',
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900',
    dot: 'bg-red-500'
  },
  high: {
    label: 'Ưu tiên cao',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
    dot: 'bg-amber-500'
  },
  medium: {
    label: 'Bình thường',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
    dot: 'bg-blue-500'
  },
  low: {
    label: 'Thấp',
    color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400'
  }
};

export const STATUS_CONFIG = {
  todo: {
    label: 'Chưa làm',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  },
  in_progress: {
    label: 'Đang thực hiện',
    color: 'bg-sage-100 text-sage-800 dark:bg-sage-950/60 dark:text-sage-300'
  },
  review: {
    label: 'Chờ kiểm duyệt',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
  },
  completed: {
    label: 'Đã hoàn thành',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
  }
};
