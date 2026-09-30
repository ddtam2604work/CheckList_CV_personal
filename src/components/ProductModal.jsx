import React, { useState, useEffect } from 'react';
import { 
  X, 
  Rocket, 
  Calendar, 
  Clock, 
  Mail, 
  Layers, 
  FileText, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { DEFAULT_NOTIFICATION_EMAIL, sendProductLaunchEmail } from '../services/emailService';
import { formatDateTime } from '../utils/helpers';

const PLATFORM_SUGGESTIONS = [
  'Website / Web App',
  'Mobile App (iOS/Android)',
  'SaaS Platform',
  'Khóa học / Video',
  'Hồ sơ / CV Portfolio',
  'Ebook / Tài liệu',
  'Sản phẩm số'
];

export default function ProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  onTriggerToast
}) {
  const [name, setName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [email, setEmail] = useState(DEFAULT_NOTIFICATION_EMAIL);
  const [platform, setPlatform] = useState('Website / Web App');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('scheduled'); // 'scheduled' | 'launched' | 'cancelled'
  const [errorMsg, setErrorMsg] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (productToEdit) {
      setName(productToEdit.name || '');
      setReleaseDate(productToEdit.releaseDate || '');
      setEmail(productToEdit.email || DEFAULT_NOTIFICATION_EMAIL);
      setPlatform(productToEdit.platform || 'Website / Web App');
      setDescription(productToEdit.description || '');
      setStatus(productToEdit.status || 'scheduled');
    } else {
      // Mặc định cho sản phẩm mới: 3 ngày sau từ hiện tại
      const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      setName('');
      setReleaseDate(future.toISOString().slice(0, 16));
      setEmail(DEFAULT_NOTIFICATION_EMAIL);
      setPlatform('Website / Web App');
      setDescription('');
      setStatus('scheduled');
    }
    setErrorMsg('');
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (!releaseDate) {
      setErrorMsg('Vui lòng chọn ngày và giờ ra mắt sản phẩm.');
      return;
    }

    const payload = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      releaseDate: releaseDate,
      email: email.trim() || DEFAULT_NOTIFICATION_EMAIL,
      platform: platform,
      description: description.trim(),
      status: status,
      notified2DaysBefore: productToEdit ? (productToEdit.notified2DaysBefore || false) : false,
      notifiedAt: productToEdit ? productToEdit.notifiedAt : null,
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveProduct(payload);
    onClose();
  };

  const handleSendTestEmail = async () => {
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm trước khi gửi thử email.');
      return;
    }
    setIsSendingTest(true);
    const mockProduct = {
      name: name.trim(),
      releaseDate: releaseDate,
      email: email.trim() || DEFAULT_NOTIFICATION_EMAIL,
      platform,
      description
    };
    try {
      const res = await sendProductLaunchEmail({
        product: mockProduct,
        recipientEmail: email.trim() || DEFAULT_NOTIFICATION_EMAIL,
        isTest: true
      });
      if (res.success) {
        if (onTriggerToast) {
          onTriggerToast('Đã gửi email thử nghiệm! 🚀', `Kiểm tra hộp thư ${mockProduct.email} để xem thông báo mẫu.`, 'success');
        }
      } else {
        if (onTriggerToast) {
          onTriggerToast('Thông báo gửi email', res.message, 'warning');
        }
      }
    } catch (err) {
      if (onTriggerToast) {
        onTriggerToast('Lỗi gửi email', err.message, 'danger');
      }
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-500/15 text-sage-600 dark:text-sage-400 flex items-center justify-center font-bold">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {productToEdit ? 'Chỉnh sửa Lịch Ra mắt' : 'Thêm Lịch Sản phẩm Ra mắt'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động gửi email thông báo trước 2 ngày (48 giờ) tới người phụ trách
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tên sản phẩm sắp ra mắt <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="product-name-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="VD: Website Portfolio v2, Ứng dụng Quản lý Tuyển dụng..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Release Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                Thời gian ra mắt <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="product-release-date-input"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition-all"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Hệ thống sẽ thông báo qua mail trước thời điểm này 2 ngày (48 giờ).
              </p>
            </div>

            {/* Recipient Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                Email nhận thông báo
              </label>
              <input
                type="email"
                id="product-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="duytam262004@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition-all font-mono"
              />
              <p className="text-[11px] text-sage-600 dark:text-sage-400 mt-1 font-medium">
                Mặc định: duytam262004@gmail.com
              </p>
            </div>
          </div>

          {/* Platform / Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
              Nền tảng / Phân loại
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PLATFORM_SUGGESTIONS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setPlatform(item)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    platform === item
                      ? 'bg-sage-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Hoặc tự nhập nền tảng khác..."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500"
            />
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
              Mô tả kế hoạch & Ghi chú quan trọng
            </label>
            <textarea
              id="product-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Kiểm tra responsive mobile, chuẩn bị bài đăng mạng xã hội, kiểm tra hosting GitHub Pages..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition-all resize-none"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Trạng thái ra mắt
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('scheduled')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  status === 'scheduled'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                }`}
              >
                ⏳ Đang chuẩn bị
              </button>
              <button
                type="button"
                onClick={() => setStatus('launched')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  status === 'launched'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                }`}
              >
                🚀 Đã ra mắt
              </button>
              <button
                type="button"
                onClick={() => setStatus('cancelled')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  status === 'cancelled'
                    ? 'bg-slate-200 dark:bg-slate-750 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                }`}
              >
                ⏸ Hoãn / Hủy
              </button>
            </div>
          </div>

          {/* Info callout */}
          <div className="p-3.5 rounded-xl bg-sage-50/70 dark:bg-sage-950/40 border border-sage-200/70 dark:border-sage-800/60 text-xs text-sage-800 dark:text-sage-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-sage-900 dark:text-sage-200">
              <Sparkles className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
              Cơ chế tự động gửi email:
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              Khi thời gian hiện tại chạm mốc <strong>trước 2 ngày</strong> (48 giờ) so với lịch ra mắt, hệ thống sẽ tự động phát tín hiệu gửi email thông báo chi tiết đến <strong>{email || DEFAULT_NOTIFICATION_EMAIL}</strong>.
            </p>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/60 shrink-0 gap-3">
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={isSendingTest}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 transition-colors disabled:opacity-50"
            title="Gửi ngay một email thử nghiệm đến hộp thư"
          >
            <Send className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>{isSendingTest ? 'Đang gửi...' : 'Gửi thử email'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="product-form"
              id="btn-save-product"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 active:scale-98 transition-all shadow-soft shadow-sage-600/30"
            >
              {productToEdit ? 'Lưu thay đổi' : 'Lên lịch ra mắt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
