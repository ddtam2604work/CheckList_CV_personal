import React from 'react';
import { X, Download, ZoomIn } from 'lucide-react';
import { formatFileSize, formatDateTime } from '../utils/helpers';

export default function ImageLightboxModal({ image, onClose }) {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between text-white pb-3 px-2">
          <div className="truncate max-w-md">
            <h3 className="text-sm font-semibold truncate">{image.name}</h3>
            <p className="text-[11px] text-slate-300">
              {formatFileSize(image.size)} • {formatDateTime(image.uploadedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs"
              title="Tải ảnh về máy"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải về</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-colors"
              title="Đóng xem trước"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image preview */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50 max-h-[80vh] flex items-center justify-center">
          <img 
            src={image.dataUrl} 
            alt={image.name} 
            className="max-h-[75vh] max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
