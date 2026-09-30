/**
 * Email Notification Service for CheckList CV
 * Quản lý gửi thông báo lịch sản phẩm ra mắt trước 2 ngày qua email duytam262004@gmail.com
 */

import { formatDateTime } from '../utils/helpers';

export const DEFAULT_NOTIFICATION_EMAIL = 'duytam262004@gmail.com';

/**
 * Tính toán thời gian còn lại đến ngày ra mắt
 */
export function calculateRemainingTime(releaseDateIso) {
  if (!releaseDateIso) return 'Chưa xác định';
  const now = new Date();
  const target = new Date(releaseDateIso);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    const passedHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    if (passedHours < 24) return `Đã ra mắt ${passedHours} giờ trước`;
    return `Đã ra mắt ${Math.floor(passedHours / 24)} ngày trước`;
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} ngày ${remainingHours} giờ`;
  }
  if (totalHours > 0) {
    return `${totalHours} giờ ${remainingMinutes} phút`;
  }
  return `${remainingMinutes} phút`;
}

/**
 * Kiểm tra xem sản phẩm có đang ở mốc trước 2 ngày (<= 48 giờ) và chưa quá ngày ra mắt không
 */
export function isWithinTwoDaysWindow(releaseDateIso) {
  if (!releaseDateIso) return false;
  const now = new Date();
  const target = new Date(releaseDateIso);
  const diffMs = target.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Nằm trong khoảng từ 0 đến 48 giờ (2 ngày)
  return diffHours > 0 && diffHours <= 48;
}

/**
 * Gửi email thông báo sản phẩm ra mắt qua FormSubmit AJAX API
 * Hỗ trợ gửi trực tiếp tới email đích (mặc định duytam262004@gmail.com)
 */
export async function sendProductLaunchEmail({
  product,
  recipientEmail = DEFAULT_NOTIFICATION_EMAIL,
  isTest = false
}) {
  const targetEmail = recipientEmail || product.email || DEFAULT_NOTIFICATION_EMAIL;
  const releaseFormatted = formatDateTime(product.releaseDate);
  const remainingText = calculateRemainingTime(product.releaseDate);
  
  const subjectPrefix = isTest ? '[TEST THỬ NGHIỆM] ' : '';
  const subject = `${subjectPrefix}🚀 [CheckList CV] Nhắc nhở: Sản phẩm "${product.name}" sẽ ra mắt sau 2 ngày!`;

  const payload = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    'Tên sản phẩm': product.name,
    'Thời gian ra mắt dự kiến': releaseFormatted,
    'Thời gian đếm ngược còn lại': remainingText,
    'Email nhận thông báo': targetEmail,
    'Mô tả / Kế hoạch ra mắt': product.description || '(Không có mô tả bổ sung)',
    'Nền tảng / Phân loại': product.platform || 'Chung',
    'Trạng thái nhắc nhở': isTest ? 'Email gửi thử nghiệm' : 'Thông báo tự động trước 2 ngày (48 giờ)',
    'Thời điểm gửi email': formatDateTime(new Date().toISOString()),
    'Hệ thống gửi': 'CheckList CV Personal - Quản lý công việc & Lịch ra mắt'
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        method: 'api',
        message: `Đã gửi email thông báo thành công đến ${targetEmail}!`,
        data
      };
    } else {
      const errText = await response.text().catch(() => '');
      return {
        success: false,
        method: 'api',
        message: `Máy chủ gửi mail phản hồi lỗi (${response.status}): ${errText || 'Không xác định'}.`,
        fallbackUrl: generateMailtoLink(product, targetEmail, isTest)
      };
    }
  } catch (error) {
    console.error('Lỗi khi gửi email qua FormSubmit API:', error);
    return {
      success: false,
      method: 'api',
      message: `Không thể kết nối đến dịch vụ gửi email: ${error.message}. Bạn có thể mở ứng dụng Mail dự phòng.`,
      fallbackUrl: generateMailtoLink(product, targetEmail, isTest)
    };
  }
}

/**
 * Sinh link mailto dự phòng để mở ứng dụng Email trên máy
 */
export function generateMailtoLink(product, recipientEmail = DEFAULT_NOTIFICATION_EMAIL, isTest = false) {
  const targetEmail = recipientEmail || product.email || DEFAULT_NOTIFICATION_EMAIL;
  const subjectPrefix = isTest ? '[TEST THỬ NGHIỆM] ' : '';
  const subject = encodeURIComponent(`${subjectPrefix}🚀 [CheckList CV] Nhắc nhở: Sản phẩm "${product.name}" sẽ ra mắt sau 2 ngày!`);
  
  const body = encodeURIComponent(
    `Kính gửi bạn,\n\n` +
    `Hệ thống CheckList CV xin thông báo sản phẩm sắp ra mắt:\n` +
    `- Tên sản phẩm: ${product.name}\n` +
    `- Thời gian ra mắt: ${formatDateTime(product.releaseDate)}\n` +
    `- Thời gian còn lại: ${calculateRemainingTime(product.releaseDate)}\n` +
    `- Nền tảng: ${product.platform || 'Chung'}\n` +
    `- Mô tả / Kế hoạch: ${product.description || 'Không có mô tả'}\n\n` +
    `Vui lòng chuẩn bị và rà soát các khâu cuối cùng trước giờ ra mắt.\n\n` +
    `Trân trọng,\n` +
    `Hệ thống CheckList CV Personal`
  );

  return `mailto:${targetEmail}?subject=${subject}&body=${body}`;
}
