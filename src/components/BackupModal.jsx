import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { exportBackupData, importBackupData, resetToSampleData } from '../services/storageService';

export default function BackupModal({ 
  isOpen, 
  onClose, 
  onDataRestored 
}) {
  const [msg, setMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const json = await exportBackupData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CheckList_CV_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setMsg({ type: 'success', text: 'Xuất file sao lưu thành công! Bạn có thể lưu giữ hoặc chuyển sang máy khác.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Lỗi khi xuất sao lưu: ' + err.message });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = await importBackupData(text);
      onDataRestored(result);
      const taskCount = result.tasks ? result.tasks.length : (Array.isArray(result) ? result.length : 0);
      setMsg({ type: 'success', text: `Khôi phục thành công ${taskCount} công việc và các danh mục!` });
    } catch (err) {
      setMsg({ type: 'error', text: 'Lỗi khi đọc file sao lưu: ' + err.message });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetSample = async () => {
    if (confirm('Bạn có chắc muốn nạp lại dữ liệu mẫu? Các công việc hiện tại sẽ được thay thế bằng bộ mẫu chuẩn.')) {
      try {
        const result = await resetToSampleData();
        onDataRestored(result);
        setMsg({ type: 'success', text: 'Đã nạp lại bộ dữ liệu mẫu thành công!' });
      } catch (err) {
        setMsg({ type: 'error', text: 'Lỗi khi đặt lại dữ liệu: ' + err.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sage-50 dark:bg-sage-950/60 text-sage-600 dark:text-sage-400 flex items-center justify-center border border-sage-200/60 dark:border-sage-900">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sao lưu & Quản lý Dữ liệu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lưu trữ offline an toàn trên trình duyệt & đồng bộ đa thiết bị
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message alert */}
        {msg && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
            <HardDrive className="w-4 h-4 text-sage-600" />
            <span>Công nghệ lưu trữ IndexedDB</span>
          </div>
          Toàn bộ công việc, danh sách con, thời gian và các hình ảnh/tài liệu đính kèm đều được lưu trữ trực tiếp trên thiết bị của bạn. Để chuyển sang điện thoại hoặc máy tính khác, chỉ cần xuất file JSON và nhập lại.
        </div>

        {/* Action Options */}
        <div className="mt-5 space-y-3">
          
          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 hover:border-sage-400 dark:hover:border-sage-600 shadow-soft hover:shadow-soft-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sage-50 dark:bg-sage-950 text-sage-600 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Xuất dữ liệu sao lưu (JSON)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tải file sao lưu đầy đủ kèm tài liệu và hình ảnh
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-sage-600 group-hover:underline">Xuất file</span>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 hover:border-sage-400 dark:hover:border-sage-600 shadow-soft hover:shadow-soft-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Khôi phục từ file sao lưu
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Nhập tệp JSON đã tải về trước đó từ thiết bị khác
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 group-hover:underline">Nhập file</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Reset to Samples */}
          <button
            onClick={handleResetSample}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 hover:border-amber-400 dark:hover:border-amber-600 shadow-soft hover:shadow-soft-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Nạp lại dữ liệu mẫu
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Khởi tạo bộ công việc và tài liệu mẫu chuẩn ban đầu
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-600 group-hover:underline">Đặt lại</span>
          </button>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
