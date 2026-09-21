import React, { useState, useMemo } from 'react';
import { 
  FolderArchive, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  FileCheck,
  FolderOpen,
  Calendar,
  Tag
} from 'lucide-react';
import { formatFileSize, formatDateTime } from '../utils/helpers';

export default function MediaVaultView({ 
  tasks, 
  onEditTask, 
  onPreviewImage,
  initialTaskId = null 
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'images', 'pdf', 'docs'
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || 'all');

  // Collect all attachments from all tasks
  const allAttachments = useMemo(() => {
    const list = [];
    tasks.forEach(task => {
      (task.attachments || []).forEach(att => {
        list.push({
          ...att,
          parentTaskId: task.id,
          parentTaskTitle: task.title,
          parentTaskCategory: task.category,
          parentTaskStatus: task.status,
        });
      });
    });
    return list;
  }, [tasks]);

  // Filter attachments
  const filteredAttachments = useMemo(() => {
    return allAttachments.filter(item => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchTask = item.parentTaskTitle.toLowerCase().includes(q);
        if (!matchName && !matchTask) return false;
      }

      // Filter by Task
      if (selectedTaskId !== 'all' && item.parentTaskId !== selectedTaskId) {
        return false;
      }

      // Filter by file type
      if (typeFilter === 'images') {
        return item.type && item.type.startsWith('image/');
      }
      if (typeFilter === 'pdf') {
        return item.type && item.type.includes('pdf');
      }
      if (typeFilter === 'docs') {
        return !item.type || (!item.type.startsWith('image/') && !item.type.includes('pdf'));
      }

      return true;
    });
  }, [allAttachments, search, typeFilter, selectedTaskId]);

  const handleDownload = (att) => {
    const link = document.createElement('a');
    link.href = att.dataUrl;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJumpToTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onEditTask(task);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Vault Header & Filter */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-sage-600" />
              <span>Kho Lưu Trữ Tài Liệu & Hình Ảnh Tập Trung</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tổng cộng {allAttachments.length} tệp được lưu giữ an toàn, gắn liền với các đầu việc
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-sage-50 dark:bg-sage-950/40 text-sage-700 dark:text-sage-300 font-semibold border border-sage-200/60 dark:border-sage-900">
              {allAttachments.filter(a => a.type?.startsWith('image/')).length} Ảnh
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-900">
              {allAttachments.filter(a => !a.type?.startsWith('image/')).length} Tài liệu
            </span>
          </div>
        </div>

        {/* Filter controls bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên file hoặc tên task..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            />
          </div>

          {/* Type tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'images', label: 'Hình ảnh' },
              { id: 'pdf', label: 'Tệp PDF' },
              { id: 'docs', label: 'Tài liệu khác' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-soft'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Task Dropdown */}
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sage-500/20 max-w-[200px] truncate"
          >
            <option value="all">Tất cả các công việc</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Attachments Grid */}
      {filteredAttachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAttachments.map((item) => {
            const isImage = item.type && item.type.startsWith('image/');
            const isPdf = item.type && item.type.includes('pdf');

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-soft-lg hover:border-sage-300 dark:hover:border-sage-700 transition-all flex flex-col"
              >
                {/* Visual Preview Area */}
                <div 
                  onClick={() => isImage ? onPreviewImage(item) : handleDownload(item)}
                  className="h-36 bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer relative overflow-hidden group-hover:opacity-95 transition-opacity"
                >
                  {isImage ? (
                    <img 
                      src={item.dataUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : isPdf ? (
                    <div className="flex flex-col items-center gap-1 text-rose-500">
                      <FileCheck className="w-10 h-10" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Tài liệu PDF</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <FileText className="w-10 h-10" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Tài liệu / Ghi chú</span>
                    </div>
                  )}

                  {/* Quick Preview pill overlay */}
                  {isImage && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-semibold">
                      <Eye className="w-4 h-4" />
                      <span>Xem ảnh</span>
                    </div>
                  )}
                </div>

                {/* File Metadata */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-sage-600"
                      title={item.name}
                      onClick={() => isImage ? onPreviewImage(item) : handleDownload(item)}
                    >
                      {item.name}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{formatFileSize(item.size)}</span>
                      <span>{formatDateTime(item.uploadedAt)}</span>
                    </div>

                    {/* Associated Task pill */}
                    <div 
                      onClick={() => handleJumpToTask(item.parentTaskId)}
                      className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-750 text-[11px] text-slate-600 dark:text-slate-400 hover:text-sage-700 dark:hover:text-sage-300 hover:border-sage-300 cursor-pointer flex items-center justify-between gap-1 group/task"
                      title={`Thuộc về công việc: ${item.parentTaskTitle}`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Tag className="w-3 h-3 text-sage-600 shrink-0" />
                        <span className="truncate font-medium">{item.parentTaskTitle}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover/task:text-sage-600 shrink-0" />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    {isImage && (
                      <button
                        type="button"
                        onClick={() => onPreviewImage(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/60 hover:bg-sage-100 border border-sage-200/60 dark:border-sage-900 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center shadow-soft">
          <div className="w-16 h-16 rounded-2xl bg-sage-50 dark:bg-sage-950/50 text-sage-600 dark:text-sage-400 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            Không có tài liệu hoặc hình ảnh nào
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Hãy mở một công việc và đính kèm hình ảnh hoặc tài liệu liên quan để lưu trữ lâu dài tại đây.
          </p>
        </div>
      )}

    </div>
  );
}
