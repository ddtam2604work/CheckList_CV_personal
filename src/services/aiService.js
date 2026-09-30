/**
 * AI Service for CheckList CV Personal
 * Kiến trúc Hybrid:
 * 1. Chế độ Mặc định: Built-in Local AI Engine (Siêu nhẹ 0MB, 0s latency, 100% offline)
 * 2. Chế độ Ollama Local: Kết nối Ollama trên máy tính (localhost:11434) với auto-fallback
 */

import { formatDateTime, formatDate } from '../utils/helpers';
import { isWithinTwoDaysWindow, calculateRemainingTime } from './emailService';

export const AI_STORAGE_KEY = 'checklist_cv_ai_config_v1';

export const DEFAULT_AI_CONFIG = {
  provider: 'builtin', // 'builtin' | 'ollama'
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:0.5b',
};

export function loadAIConfig() {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    return raw ? { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) } : DEFAULT_AI_CONFIG;
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAIConfig(config) {
  try {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Lỗi lưu cấu hình AI:', err);
  }
}

/**
 * Phân tích & trích xuất ngữ cảnh hệ thống từ tasks và products
 */
export function buildAIContext(tasks = [], products = [], categories = []) {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'done');
  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'done');

  // Phân loại active tasks
  const overdueTasks = [];
  const todayTasks = [];
  const upcomingTasks = [];

  activeTasks.forEach((task) => {
    if (!task.endDate) {
      upcomingTasks.push(task);
      return;
    }
    const dueDate = new Date(task.endDate);
    if (dueDate < now) {
      overdueTasks.push(task);
    } else if (dueDate <= todayEnd) {
      todayTasks.push(task);
    } else {
      upcomingTasks.push(task);
    }
  });

  // Sản phẩm sắp ra mắt trong 2 ngày
  const launchesWithin2Days = products.filter((p) => {
    if (!p.releaseDate) return false;
    const diffHours = (new Date(p.releaseDate) - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48;
  });

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return {
    now,
    totalTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    todayTasks,
    upcomingTasks,
    products,
    launchesWithin2Days,
    categories,
    completionRate,
  };
}

/**
 * Kiểm tra kết nối với Ollama Local
 */
export async function checkOllamaConnection(url = 'http://localhost:11434') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${url}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const models = (data.models || []).map((m) => m.name);
      return { connected: true, models };
    }
    return { connected: false, models: [] };
  } catch {
    return { connected: false, models: [] };
  }
}

/**
 * Built-in AI Local Engine: Phân tích nghiệp vụ sâu sắc, trả lời ngay lập tức
 */
export function runBuiltinAIEngine(queryType, userText = '', context) {
  const {
    overdueTasks,
    todayTasks,
    upcomingTasks,
    launchesWithin2Days,
    completedTasks,
    totalTasks,
    completionRate,
  } = context;

  // 1. Phân tích ưu tiên hôm nay
  if (queryType === 'priorities' || /ưu tiên|hôm nay|làm gì/i.test(userText)) {
    let response = `### 🎯 BẢNG ĐIỀU PHỐI THỨ TỰ ƯU TIÊN HÔM NAY\n\n`;

    if (overdueTasks.length === 0 && todayTasks.length === 0 && launchesWithin2Days.length === 0) {
      response += `🎉 **Tuyệt vời!** Hiện bạn không có công việc nào bị quá hạn hay gấp trong hôm nay.\n\n`;
      if (upcomingTasks.length > 0) {
        response += `**Gợi ý bước tiếp theo:** Bạn có thể bắt đầu trước các công việc của ngày mai:\n`;
        upcomingTasks.slice(0, 3).forEach((t, i) => {
          response += `${i + 1}. **${t.title}** (${t.category || 'Chung'}) - Độ ưu tiên: ${t.priority || 'Bình thường'}\n`;
        });
      } else {
        response += `Bạn đã hoàn tất mọi mục tiêu! Hãy dành thời gian nghỉ ngơi hoặc lên kế hoạch cho các dự án mới.`;
      }
      return response;
    }

    let rank = 1;
    // Nhóm 1: Quá hạn (Cần cứu vãn khẩn cấp)
    if (overdueTasks.length > 0) {
      response += `#### 🚨 MỨC 1: XỬ LÝ KHẨN CẤP (Công việc quá hạn)\n`;
      overdueTasks.slice(0, 3).forEach((t) => {
        response += `${rank++}. **${t.title}**\n   - *Hạn chót:* ${formatDateTime(t.endDate)}\n   - *Hành động:* Tập trung giải quyết dứt điểm ngay trong buổi sáng để tránh dồn ứ tiến độ.\n`;
      });
      response += `\n`;
    }

    // Nhóm 2: Lịch ra mắt sản phẩm trong 2 ngày
    if (launchesWithin2Days.length > 0) {
      response += `#### 🚀 MỨC 2: RÀ SOÁT LỊCH RA MẮT SẢN PHẨM (<= 48 giờ)\n`;
      launchesWithin2Days.forEach((p) => {
        response += `${rank++}. **Sản phẩm: ${p.name}**\n   - *Thời gian ra mắt:* ${formatDateTime(p.releaseDate)} (${calculateRemainingTime(p.releaseDate)})\n   - *Email thông báo:* ${p.notified2DaysBefore ? '✅ Đã gửi mail nhắc nhở' : '⚠️ Cần kiểm tra gửi email'}\n   - *Nhiệm vụ:* Rà soát các khâu kiểm thử, link phát hành và nội dung công bố.\n`;
      });
      response += `\n`;
    }

    // Nhóm 3: Công việc có hạn trong hôm nay
    if (todayTasks.length > 0) {
      response += `#### ⚡ MỨC 3: HOÀN THÀNH TRONG NGÀY HÔM NAY\n`;
      todayTasks.forEach((t) => {
        response += `${rank++}. **${t.title}** (${t.category || 'Chung'}) - Hạn lúc: ${formatDateTime(t.endDate).split(' ')[0]}\n`;
      });
      response += `\n`;
    }

    response += `> 💡 **Chiến lược thời gian:** Dành 90 phút đầu ngày tập trung cho việc Mức 1 (không check mạng xã hội), đầu giờ chiều xử lý Mức 2 và Mức 3.`;
    return response;
  }

  // 2. Phân tích rủi ro trễ hạn
  if (queryType === 'risks' || /rủi ro|trễ hạn|quá hạn|nguy cơ/i.test(userText)) {
    let response = `### ⚠️ PHÂN TÍCH RỦI RO TIẾN ĐỘ & TRỄ HẠN\n\n`;

    if (overdueTasks.length === 0) {
      response += `✅ **Chỉ số an toàn cao:** Không có công việc nào bị quá hạn tại thời điểm này.\n\n`;
      // Kiểm tra việc sắp đến hạn trong 24h
      if (todayTasks.length > 0) {
        response += `Tuy nhiên, bạn có **${todayTasks.length} công việc** cần hoàn thành trước khi hết ngày hôm nay. Hãy chú ý phân bổ thời gian hợp lý.`;
      }
      return response;
    }

    response += `Hiện hệ thống ghi nhận **${overdueTasks.length} công việc** đang bị quá hạn:\n\n`;
    overdueTasks.forEach((t, i) => {
      const subtaskCount = t.subtasks?.length || 0;
      const subtaskDone = (t.subtasks || []).filter((s) => s.completed).length;
      response += `${i + 1}. **${t.title}**\n   - Danh mục: *${t.category || 'Mặc định'}* | Ưu tiên: *${t.priority || 'Bình thường'}*\n   - Tiến độ checklist: *${subtaskDone}/${subtaskCount} mục đã xong*\n   - Đề xuất khắc phục: Hoặc cập nhật gia hạn hạn chót nếu bị phụ thuộc yếu tố bên ngoài, hoặc chia nhỏ 1 bước khả thi để làm ngay trong 15 phút.\n\n`;
    });

    response += `> 🛠 **Hành động khuyến nghị:** Hãy mở từng công việc trên, hoàn thành các checklist con ngắn nhất để tạo đà tinh thần (quick win).`;
    return response;
  }

  // 3. Kế hoạch ra mắt sản phẩm
  if (queryType === 'launches' || /ra mắt|sản phẩm|launch/i.test(userText)) {
    let response = `### 🚀 BẢNG CẬP NHẬT KẾ HOẠCH RA MẮT SẢN PHẨM\n\n`;

    if (context.products.length === 0) {
      response += `Chưa có sản phẩm nào trong Lịch ra mắt.\n\nBạn có thể chuyển sang tab **"Lịch ra mắt"** (icon Rocket) và bấm **"+ Thêm lịch ra mắt"** để hệ thống tự động theo dõi và gửi email thông báo trước 2 ngày đến **duytam262004@gmail.com**.`;
      return response;
    }

    response += `Tổng số sản phẩm đang theo dõi: **${context.products.length}** sản phẩm.\n\n`;

    if (launchesWithin2Days.length > 0) {
      response += `#### 🔔 CẦN CHÚ Ý ĐẶC BIỆT (Trong mốc 2 ngày):\n`;
      launchesWithin2Days.forEach((p) => {
        response += `- **${p.name}**\n  • Nền tảng: *${p.platform || 'Chung'}*\n  • Thời gian ra mắt: **${formatDateTime(p.releaseDate)}** (*${calculateRemainingTime(p.releaseDate)}*)\n  • Email: *${p.email || 'duytam262004@gmail.com'}* (${p.notified2DaysBefore ? 'Đã gửi' : 'Sẵn sàng gửi'})\n  • Ghi chú: *${p.description || 'Chưa có ghi chú'}*\n\n`;
      });
    }

    const otherProducts = context.products.filter(
      (p) => !launchesWithin2Days.some((l) => l.id === p.id)
    );
    if (otherProducts.length > 0) {
      response += `#### 🗓️ Các sản phẩm trong kế hoạch tiếp theo:\n`;
      otherProducts.forEach((p) => {
        response += `- **${p.name}** (${formatDateTime(p.releaseDate)}) - Trạng thái: ${p.status === 'launched' ? 'Đã phát hành' : 'Đang chuẩn bị'}\n`;
      });
    }

    return response;
  }

  // 4. Tóm tắt hiệu suất & năng suất
  if (queryType === 'productivity' || /hiệu suất|năng suất|báo cáo|tóm tắt/i.test(userText)) {
    let response = `### 📊 BÁO CÁO NĂNG SUẤT & HIỆU SUẤT CÔNG VIỆC\n\n`;
    response += `- **Tổng số công việc:** ${totalTasks}\n`;
    response += `- **Đã hoàn thành:** ${completedTasks.length} việc\n`;
    response += `- **Đang thực hiện:** ${context.activeTasks.length} việc\n`;
    response += `- **Đang quá hạn:** ${overdueTasks.length} việc\n`;
    response += `- **Tỷ lệ hoàn thành:** **${completionRate}%**\n\n`;

    if (completionRate >= 80) {
      response += `🌟 **Đánh giá: Xuất sắc!** Bạn đang duy trì tiến độ hoàn thành rất cao và kiểm soát tốt khối lượng công việc.`;
    } else if (completionRate >= 50) {
      response += `👍 **Đánh giá: Tốt.** Đa số công việc đang được xử lý đều đặn. Hãy tập trung dứt điểm các việc quá hạn để bứt phá.`;
    } else {
      response += `📈 **Đánh giá: Cần tăng tốc.** Hãy thử áp dụng kỹ thuật Pomodoro (làm việc tập trung 25 phút, nghỉ 5 phút) để tăng tốc xử lý các việc đang tồn đọng.`;
    }
    return response;
  }

  // 5. Câu hỏi tự do / Trợ giúp chung
  return `### 🤖 TRỢ LÝ AI COPILOT ĐÃ TIẾP NHẬN

Bạn đang quản lý **${totalTasks} công việc** (${completedTasks.length} đã xong, ${overdueTasks.length} quá hạn) và **${context.products.length} sản phẩm** trong lịch ra mắt.

**Gợi ý những điều tôi có thể giúp bạn ngay:**
- Bấm **"Hôm nay nên làm gì?"** để tôi tối ưu hóa thứ tự ưu tiên cho bạn.
- Bấm **"Phân tích rủi ro trễ hạn"** để rà soát các đầu việc cần xử lý gấp.
- Bấm **"Kế hoạch ra mắt sản phẩm"** để xem đếm ngược và trạng thái email thông báo trước 2 ngày.
- Bấm **"Đánh giá hiệu suất"** để xem tổng quan năng suất làm việc.`;
}

/**
 * Gọi API Ollama Local nếu người dùng bật cấu hình
 */
export async function queryOllamaAPI({ message, context, config }) {
  const systemPrompt = `Bạn là Trợ lý AI Copilot thông minh cho ứng dụng CheckList CV Personal.
Nhiệm vụ của bạn là hỗ trợ người dùng quản lý công việc cá nhân, lập kế hoạch ra mắt sản phẩm và tối ưu hóa thời gian.
Hiện trạng dữ liệu của người dùng:
- Tổng số công việc: ${context.totalTasks} (Đã xong: ${context.completedTasks.length}, Quá hạn: ${context.overdueTasks.length}, Hạn hôm nay: ${context.todayTasks.length})
- Sản phẩm sắp ra mắt trong 2 ngày: ${context.launchesWithin2Days.map((p) => p.name).join(', ') || 'Không có'}
- Tỷ lệ hoàn thành: ${context.completionRate}%
Hãy trả lời ngắn gọn, súc tích, bằng tiếng Việt, dùng markdown rõ ràng.`;

  const url = `${config.ollamaUrl || 'http://localhost:11434'}/api/chat`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollamaModel || 'qwen2.5:0.5b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama lỗi HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || data.response || 'Không nhận được câu trả lời từ Ollama.';
}

/**
 * Hàm gọi thống nhất: Tự động chọn Ollama nếu khả dụng, fallback sang Built-in Engine
 */
export async function askAICopilot({ message = '', queryType = 'custom', tasks = [], products = [], categories = [] }) {
  const config = loadAIConfig();
  const context = buildAIContext(tasks, products, categories);

  // Nếu người dùng chọn dùng Ollama
  if (config.provider === 'ollama') {
    try {
      const ollamaReply = await queryOllamaAPI({ message, context, config });
      return {
        reply: ollamaReply,
        provider: 'ollama',
        model: config.ollamaModel,
      };
    } catch (err) {
      console.warn('Ollama không phản hồi, tự động fallback sang Built-in AI Engine:', err);
      const fallbackReply = runBuiltinAIEngine(queryType, message, context);
      return {
        reply: `${fallbackReply}\n\n*(Lưu ý: Không kết nối được Ollama tại ${config.ollamaUrl}, hệ thống tự động sử dụng Local AI Engine có sẵn)*`,
        provider: 'builtin-fallback',
      };
    }
  }

  // Mặc định: Chạy Built-in Engine siêu nhẹ, tức thì
  const reply = runBuiltinAIEngine(queryType, message, context);
  return {
    reply,
    provider: 'builtin',
  };
}
