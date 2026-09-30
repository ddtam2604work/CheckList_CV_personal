import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rocket, 
  Plus, 
  Calendar, 
  Clock, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Layers, 
  Sparkles, 
  RefreshCw,
  BellRing,
  Filter,
  Search,
  X
} from 'lucide-react';
import { 
  DEFAULT_NOTIFICATION_EMAIL, 
  calculateRemainingTime, 
  isWithinTwoDaysWindow, 
  sendProductLaunchEmail,
  generateMailtoLink
} from '../services/emailService';
import { formatDateTime } from '../utils/helpers';
import { SAMPLE_PRODUCTS } from '../services/storageService';

export default function ProductLaunchView({
  products = [],
  onOpenCreateProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateProduct,
  onLoadSampleProducts,
  onClearSampleProducts,
  onTriggerToast
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'within2days' | 'scheduled' | 'launched'
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Real-time ticking interval for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (!prod) return false;
      const matchesSearch = !searchQuery || 
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.platform && prod.platform.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === 'within2days') {
        return isWithinTwoDaysWindow(prod.releaseDate);
      }
      if (filterStatus === 'scheduled') {
        return prod.status === 'scheduled';
      }
      if (filterStatus === 'launched') {
        return prod.status === 'launched';
      }
      return true;
    });
  }, [products, searchQuery, filterStatus, currentTime]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = products.length;
    const within2Days = products.filter((p) => isWithinTwoDaysWindow(p.releaseDate)).length;
    const notifiedCount = products.filter((p) => p.notified2DaysBefore).length;
    const launched = products.filter((p) => p.status === 'launched' || (p.releaseDate && new Date(p.releaseDate) <= new Date())).length;
    return { total, within2Days, notifiedCount, launched };
  }, [products, currentTime]);

  // Handle manual email trigger
  const handleSendEmailNow = async (product) => {
    setSendingId(product.id);
    try {
      const res = await sendProductLaunchEmail({
        product,
        recipientEmail: product.email || DEFAULT_NOTIFICATION_EMAIL,
        isTest: false
      });

      if (res.success) {
        const updated = {
          ...product,
          notified2DaysBefore: true,
          notifiedAt: new Date().toISOString()
        };
        onUpdateProduct(updated);
        if (onTriggerToast) {
          onTriggerToast(
            'Đã gửi email thông báo thành công! 🚀',
            `Thông báo ra mắt sản phẩm "${product.name}" đã được chuyển tới ${product.email || DEFAULT_NOTIFICATION_EMAIL}.`,
            'success'
          );
        }
      } else {
        if (onTriggerToast) {
          onTriggerToast('Không thể gửi tự động', res.message, 'warning');
        }
      }
    } catch (err) {
      if (onTriggerToast) {
        onTriggerToast('Lỗi gửi email', err.message, 'danger');
      }
    } finally {
      setSendingId(null);
    }
  };

  // Quick scan and send for all products within 2-day window that haven't been notified
  const handleScanAndSendAll = async () => {
    const dueProducts = products.filter(
      (p) => isWithinTwoDaysWindow(p.releaseDate) && !p.notified2DaysBefore
    );

    if (dueProducts.length === 0) {
      if (onTriggerToast) {
        onTriggerToast('Quét hoàn tất', 'Không có sản phẩm nào trong mốc 2 ngày chưa gửi thông báo.', 'info');
      }
      return;
    }

    if (onTriggerToast) {
      onTriggerToast('Bắt đầu gửi thông báo', `Đang xử lý gửi email cho ${dueProducts.length} sản phẩm...`, 'info');
    }

    let successCount = 0;
    for (const prod of dueProducts) {
      const res = await sendProductLaunchEmail({ product: prod });
      if (res.success) {
        successCount++;
        onUpdateProduct({
          ...prod,
          notified2DaysBefore: true,
          notifiedAt: new Date().toISOString()
        });
      }
    }

    if (onTriggerToast) {
      onTriggerToast(
        'Đã hoàn thành gửi email',
        `Đã gửi thành công ${successCount}/${dueProducts.length} email thông báo đến ${DEFAULT_NOTIFICATION_EMAIL}.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Description */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left Title & Status */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-500 to-sage-700 text-white flex items-center justify-center shadow-soft shadow-sage-600/30 shrink-0">
              <Rocket className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Lịch Ra Mắt Sản Phẩm
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 dark:bg-sage-950/80 dark:text-sage-300 border border-sage-200 dark:border-sage-800">
                  Thông báo trước 2 ngày
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <Mail className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                Email nhận thông báo cố định:
                <strong className="text-slate-800 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {DEFAULT_NOTIFICATION_EMAIL}
                </strong>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-add-product"
              onClick={onOpenCreateProduct}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-sage-600 hover:bg-sage-700 active:scale-98 transition-all shadow-soft shadow-sage-600/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Thêm lịch ra mắt</span>
            </button>

            <button
              id="btn-scan-send-emails"
              onClick={handleScanAndSendAll}
              title="Quét các sản phẩm trong mốc 2 ngày và gửi email thông báo"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors border border-slate-200/60 dark:border-slate-700"
            >
              <Send className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              <span className="hidden sm:inline">Quét & Gửi Email</span>
            </button>

            {/* Test data controls */}
            {products.length === 0 ? (
              <button
                onClick={onLoadSampleProducts}
                title="Tạo nhanh 2 sản phẩm mẫu để kiểm tra tính năng đếm ngược và gửi email"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nạp dữ liệu test</span>
              </button>
            ) : (
              <button
                onClick={onClearSampleProducts}
                title="Xóa tất cả sản phẩm mẫu để trả về trạng thái kho sạch sẽ"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Xóa dữ liệu test</span>
              </button>
            )}
          </div>

        </div>

        {/* 4 Mini KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tổng sản phẩm theo dõi</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Sắp ra mắt trong 2 ngày
            </span>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-0.5">{stats.within2Days}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Đã gửi mail trước 2 ngày
            </span>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">{stats.notifiedCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-sage-50/70 dark:bg-sage-950/30 border border-sage-200/60 dark:border-sage-900/40">
            <span className="text-[11px] font-semibold text-sage-700 dark:text-sage-400 flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              Đã ra mắt / Hoàn thành
            </span>
            <div className="text-xl font-bold text-sage-800 dark:text-sage-300 mt-0.5">{stats.launched}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-850/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-soft font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tất cả ({products.length})
          </button>
          <button
            onClick={() => setFilterStatus('within2days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
              filterStatus === 'within2days'
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-semibold shadow-soft'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-500" />
            Trong mốc 2 ngày ({stats.within2Days})
          </button>
          <button
            onClick={() => setFilterStatus('scheduled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'scheduled'
                ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-soft font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Đang chuẩn bị
          </button>
          <button
            onClick={() => setFilterStatus('launched')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'launched'
                ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-soft font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Đã ra mắt
          </button>
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, nền tảng..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Cards Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-sage-50 dark:bg-sage-950/60 text-sage-600 dark:text-sage-400 flex items-center justify-center mb-4 shadow-soft shadow-sage-500/10">
            <Rocket className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {searchQuery || filterStatus !== 'all' ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có lịch sản phẩm ra mắt nào'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
            {searchQuery || filterStatus !== 'all'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem các sản phẩm khác.'
              : 'Thêm lịch ra mắt cho các sản phẩm của bạn. Hệ thống sẽ tự động gửi email thông báo chi tiết trước 2 ngày (48 giờ) tới duytam262004@gmail.com.'}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onOpenCreateProduct}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-sage-600 hover:bg-sage-700 active:scale-98 transition-all shadow-soft shadow-sage-600/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Thêm sản phẩm đầu tiên</span>
            </button>
            
            {products.length === 0 && (
              <button
                onClick={onLoadSampleProducts}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Nạp dữ liệu mẫu thử nghiệm</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const is2Days = isWithinTwoDaysWindow(product.releaseDate);
            const remaining = calculateRemainingTime(product.releaseDate);
            const releaseDateObj = new Date(product.releaseDate);
            const isPast = releaseDateObj <= new Date();

            return (
              <div
                key={product.id}
                className={`relative rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  is2Days
                    ? 'border-amber-400/80 dark:border-amber-600/80 ring-2 ring-amber-400/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Top badges */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Layers className="w-3 h-3 text-sage-600 dark:text-sage-400" />
                      {product.platform || 'Chung'}
                    </span>

                    {/* Status badge */}
                    {isPast ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        🚀 Đã ra mắt
                      </span>
                    ) : is2Days ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 animate-pulse flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Trong mốc 2 ngày
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        ⏳ Đang chuẩn bị
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Countdown Ticker Box */}
                  <div className={`mt-4 p-3 rounded-2xl border ${
                    is2Days 
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200' 
                      : 'bg-slate-50 dark:bg-slate-850/60 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}>
                    <div className="flex items-center justify-between text-[11px] font-medium opacity-80 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-sage-600 dark:text-sage-400" />
                        Ra mắt: {formatDateTime(product.releaseDate)}
                      </span>
                    </div>
                    <div className="text-sm font-bold flex items-center justify-between">
                      <span>Đếm ngược:</span>
                      <span className={`font-mono ${is2Days ? 'text-amber-700 dark:text-amber-300 font-extrabold' : 'text-sage-700 dark:text-sage-300'}`}>
                        {remaining}
                      </span>
                    </div>
                  </div>

                  {/* Email notification status */}
                  <div className="mt-3 text-xs">
                    {product.notified2DaysBefore ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div className="text-[11px] leading-tight">
                          <strong className="block">Đã gửi email thông báo trước 2 ngày</strong>
                          <span className="opacity-80">Gửi lúc: {formatDateTime(product.notifiedAt) || 'Hệ thống'}</span>
                        </div>
                      </div>
                    ) : is2Days ? (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>Chờ gửi mail thông báo 2 ngày</span>
                        </div>
                        <button
                          onClick={() => handleSendEmailNow(product)}
                          disabled={sendingId === product.id}
                          className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold transition-all disabled:opacity-50"
                        >
                          {sendingId === product.id ? 'Đang gửi...' : 'Gửi ngay'}
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>Sẽ tự động gửi mail trước 2 ngày</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Send email manual trigger */}
                    <button
                      onClick={() => handleSendEmailNow(product)}
                      disabled={sendingId === product.id}
                      title="Gửi email thông báo ngay đến duytam262004@gmail.com"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sage-600 dark:text-slate-400 dark:hover:text-sage-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Gửi mail</span>
                    </button>

                    {/* Mailto fallback */}
                    <a
                      href={generateMailtoLink(product, product.email || DEFAULT_NOTIFICATION_EMAIL)}
                      title="Mở ứng dụng email cá nhân (mailto fallback)"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProduct(product)}
                      title="Chỉnh sửa sản phẩm"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      title="Xóa sản phẩm"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
