import { get, set } from 'idb-keyval';

const STORAGE_KEY_TASKS = 'checklist_cv_tasks_v1';
const STORAGE_KEY_SETTINGS = 'checklist_cv_settings_v1';

// Sample visual placeholder image (SVG data URL encoded)
const SAMPLE_PREVIEW_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23e5ece7"/><circle cx="300" cy="180" r="70" fill="%235f876f" opacity="0.3"/><path d="M180,320 C220,250 380,250 420,320" stroke="%235f876f" stroke-width="14" fill="none" stroke-linecap="round"/><text x="50%" y="360" font-family="sans-serif" font-size="20" fill="%233c5746" text-anchor="middle" font-weight="bold">CheckList CV - Tài liệu mẫu</text></svg>`;

export const SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Hoàn thiện hồ sơ năng lực & CV xin việc vị trí Developer',
    description: 'Rà soát lại toàn bộ dự án đã tham gia, cập nhật kỹ năng công nghệ mới nhất và thiết kế layout CV chuyên nghiệp, thanh lịch.',
    category: 'Sự nghiệp',
    priority: 'urgent', // urgent, high, medium, low
    status: 'in_progress', // todo, in_progress, review, completed
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    subtasks: [
      { id: 'sub-1', title: 'Cập nhật danh sách công nghệ chính (React, Tailwind, Node.js)', completed: true },
      { id: 'sub-2', title: 'Viết mô tả đóng góp nổi bật trong 3 dự án gần nhất', completed: true },
      { id: 'sub-3', title: 'Nhờ mentor review và góp ý nội dung', completed: false },
      { id: 'sub-4', title: 'Xuất file PDF chất lượng cao và kiểm tra hiển thị mobile', completed: false }
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'CV_Mau_Thiet_Ke_Chuyen_Nghiep.png',
        type: 'image/svg+xml',
        size: 34500,
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        dataUrl: SAMPLE_PREVIEW_IMG
      },
      {
        id: 'att-2',
        name: 'Ghi_chu_Mentor_gop_y.txt',
        type: 'text/plain',
        size: 4200,
        uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        dataUrl: 'data:text/plain;charset=utf-8,' + encodeURIComponent('Mentor feedback:\n- Tăng cường số liệu đo lường hiệu suất (metrics)\n- Nhấn mạnh kiến trúc hệ thống và khả năng tự động hóa\n- Giữ thiết kế tinh tế, dịu mắt')
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-2',
    title: 'Xây dựng module Thống kê & Biểu đồ trực quan cho hệ thống',
    description: 'Tích hợp Chart.js hiển thị biểu đồ tròn phân bố công việc và biểu đồ cột tiến độ hàng tuần.',
    category: 'Dự án',
    priority: 'high',
    status: 'completed',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    subtasks: [
      { id: 'sub-21', title: 'Cài đặt và cấu hình react-chartjs-2', completed: true },
      { id: 'sub-22', title: 'Tạo biểu đồ Donut phân tích trạng thái công việc', completed: true },
      { id: 'sub-23', title: 'Tối ưu màu sắc dịu mắt trên Dark Mode', completed: true }
    ],
    attachments: [],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-3',
    title: 'Thiết kế Không gian lưu trữ tài liệu & hình ảnh (Media Vault)',
    description: 'Xây dựng giải pháp lưu trữ tệp trên IndexedDB, hỗ trợ upload ảnh, xem preview phóng to và tìm kiếm tài liệu tập trung.',
    category: 'Dự án',
    priority: 'high',
    status: 'in_progress',
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    subtasks: [
      { id: 'sub-31', title: 'Cấu hình idb-keyval lưu trữ blob/base64 an toàn', completed: true },
      { id: 'sub-32', title: 'Tạo modal xem trước ảnh phóng to (Lightbox)', completed: false },
      { id: 'sub-33', title: 'Thêm bộ lọc tài liệu theo định dạng (PDF, Image, Docs)', completed: false }
    ],
    attachments: [
      {
        id: 'att-3',
        name: 'Kien_truc_Kho_Luu_Tru.svg',
        type: 'image/svg+xml',
        size: 28400,
        uploadedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        dataUrl: SAMPLE_PREVIEW_IMG
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-4',
    title: 'Đọc và nghiên cứu tài liệu System Design & Clean Architecture',
    description: 'Hoàn thành chương 4 và chương 5 về Thiết kế luồng dữ liệu hướng sự kiện và tối ưu hiệu năng front-end.',
    category: 'Học tập',
    priority: 'medium',
    status: 'todo',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    subtasks: [
      { id: 'sub-41', title: 'Đọc tài liệu chương 4: Message Queue & Caching', completed: false },
      { id: 'sub-42', title: 'Tổng hợp sơ đồ tư duy tóm tắt vào file markdown', completed: false }
    ],
    attachments: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-5',
    title: 'Lên kế hoạch tập thể dục & cải thiện giấc ngủ tuần này',
    description: 'Duy trì chạy bộ 3 buổi/tuần và nghỉ ngơi điều độ trước 23h30 để giữ tinh thần minh mẫn.',
    category: 'Cá nhân',
    priority: 'low',
    status: 'in_progress',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    subtasks: [
      { id: 'sub-51', title: 'Chạy bộ 5km sáng thứ 2', completed: true },
      { id: 'sub-52', title: 'Chạy bộ 5km sáng thứ 4', completed: false },
      { id: 'sub-53', title: 'Chạy bộ 5km sáng thứ 7', completed: false }
    ],
    attachments: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function loadTasks() {
  try {
    const data = await get(STORAGE_KEY_TASKS);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Lỗi đọc từ IndexedDB, thử localStorage:', err);
  }

  // Fallback localStorage
  try {
    const local = localStorage.getItem(STORAGE_KEY_TASKS);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc localStorage:', e);
  }

  // Default to sample data
  await saveTasks(SAMPLE_TASKS);
  return SAMPLE_TASKS;
}

export async function saveTasks(tasks) {
  try {
    await set(STORAGE_KEY_TASKS, tasks);
  } catch (err) {
    console.error('Không thể lưu vào IndexedDB:', err);
  }

  try {
    // Save metadata without large attachments to localStorage as backup
    const stripped = tasks.map(t => ({
      ...t,
      attachments: (t.attachments || []).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        size: a.size,
        uploadedAt: a.uploadedAt,
        // omit large dataUrl in localStorage to prevent 5MB quota errors
      }))
    }));
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(stripped));
  } catch (e) {
    console.warn('Không thể lưu backup localStorage (có thể vượt quota):', e);
  }
}

export async function exportBackupData() {
  const tasks = await loadTasks();
  const backup = {
    app: 'CheckList CV Personal',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    tasks: tasks
  };
  return JSON.stringify(backup, null, 2);
}

export async function importBackupData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.tasks)) {
      throw new Error('Định dạng tệp sao lưu không hợp lệ (thiếu danh sách tasks)');
    }
    await saveTasks(parsed.tasks);
    return parsed.tasks;
  } catch (error) {
    throw new Error('Lỗi khi đọc file sao lưu: ' + error.message);
  }
}

export async function resetToSampleData() {
  await saveTasks(SAMPLE_TASKS);
  return SAMPLE_TASKS;
}

// Helper to convert browser File object to persistent attachment record
export function fileToAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl: reader.result
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
