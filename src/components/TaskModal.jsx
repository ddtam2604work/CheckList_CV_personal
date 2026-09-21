import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  Flag, 
  CheckSquare, 
  Paperclip, 
  Upload, 
  Trash2, 
  Plus, 
  Eye, 
  Download, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { fileToAttachment } from '../services/storageService';
import { formatFileSize, formatDateTime } from '../utils/helpers';

const CATEGORY_SUGGESTIONS = ['Sự nghiệp', 'Dự án CV', 'Học tập', 'Cá nhân', 'Sức khỏe', 'Tài chính'];

export default function TaskModal({ 
  isOpen, 
  onClose, 
  taskToEdit, 
  onSaveTask, 
  onPreviewImage,
  categories = [],
  onAddCategory
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dự án CV');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  const fileInputRef = useRef(null);

  const handleSaveNewCat = (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    const trimmed = newCatInput.trim();
    if (onAddCategory) {
      onAddCategory(trimmed);
    }
    setCategory(trimmed);
    setNewCatInput('');
    setIsAddingCat(false);
  };

  // Initialize or reset form when modal opens or taskToEdit changes
  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category || 'Dự án CV');
      setPriority(taskToEdit.priority || 'medium');
      setStatus(taskToEdit.status || 'todo');
      setStartDate(taskToEdit.startDate || '');
      setEndDate(taskToEdit.endDate || '');
      setSubtasks(taskToEdit.subtasks ? [...taskToEdit.subtasks] : []);
      setAttachments(taskToEdit.attachments ? [...taskToEdit.attachments] : []);
    } else {
      // Default dates for new task: now -> +3 days
      const now = new Date();
      const end = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      setTitle('');
      setDescription('');
      setCategory('Dự án CV');
      setPriority('medium');
      setStatus('todo');
      setStartDate(now.toISOString().slice(0, 16));
      setEndDate(end.toISOString().slice(0, 16));
      setSubtasks([]);
      setAttachments([]);
    }
    setErrorMsg('');
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  // Subtask handlers
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const item = {
      id: 'sub-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks([...subtasks, item]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const handleDeleteSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  // Attachment upload handler
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const newAtts = [];
      for (const file of files) {
        // max 15MB per file to maintain smooth IndexedDB performance
        if (file.size > 15 * 1024 * 1024) {
          alert(`Tệp ${file.name} lớn hơn 15MB. Vui lòng chọn tệp nhỏ hơn.`);
          continue;
        }
        const record = await fileToAttachment(file);
        newAtts.push(record);
      }
      setAttachments([...attachments, ...newAtts]);
    } catch (err) {
      console.error('Lỗi khi tải file:', err);
      alert('Đã xảy ra lỗi khi đọc tệp');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleDownloadAttachment = (att) => {
    const link = document.createElement('a');
    link.href = att.dataUrl;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Task
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề công việc');
      return;
    }

    const isEditing = taskToEdit && !taskToEdit._isNew;

    const taskData = {
      id: isEditing ? taskToEdit.id : 'task-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority,
      status,
      startDate,
      endDate,
      subtasks,
      attachments,
      createdAt: isEditing ? taskToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveTask(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {taskToEdit && !taskToEdit._isNew ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thiết lập thời hạn, danh sách checklist con và lưu trữ tài liệu liên quan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tiêu đề công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hoàn thiện hồ sơ CV & portfolio gửi nhà tuyển dụng..."
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all font-medium"
            />
          </div>

          {/* Category & Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-sage-600" />
                  <span>Danh mục / Nhóm</span>
                </label>
                {!isAddingCat && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(true)}
                    className="text-[11px] font-bold text-sage-600 dark:text-sage-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Thêm mới
                  </button>
                )}
              </div>

              {isAddingCat ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Tên nhóm mới..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNewCat(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewCat}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shrink-0"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  {category && !categories.some(c => c.name === category) && (
                    <option value={category}>{category}</option>
                  )}
                </select>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-amber-500" />
                <span>Mức độ ưu tiên</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-medium"
              >
                <option value="urgent">Khẩn cấp (Urgent)</option>
                <option value="high">Ưu tiên cao (High)</option>
                <option value="medium">Bình thường (Medium)</option>
                <option value="low">Thấp (Low)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Trạng thái</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-medium"
              >
                <option value="todo">Chưa làm</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="review">Chờ kiểm duyệt</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>

          </div>

          {/* Time Fields: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Thời gian bắt đầu</span>
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              />
            </div>

            {/* End Date (Deadline) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Thời gian kết thúc (Hạn chót)</span>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Mô tả chi tiết & Ghi chú
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập ghi chú thêm về yêu cầu, liên kết hoặc hướng dẫn thực hiện..."
              className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 leading-relaxed"
            />
          </div>

          {/* Subtask Checklist Section */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                <span>Danh sách công việc con (Checklist)</span>
              </label>
              {subtasks.length > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {subtasks.filter(s => s.completed).length}/{subtasks.length} hoàn thành
                </span>
              )}
            </div>

            {/* Subtasks List */}
            {subtasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {subtasks.map((st) => (
                  <div 
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/70 dark:border-slate-750 text-xs"
                  >
                    <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500/20 cursor-pointer accent-sage-600"
                      />
                      <span className={`break-words font-medium ${st.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Xóa việc con"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                placeholder="Thêm mục việc con cần làm (nhấn Enter)..."
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Attachments & Media Vault Section */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                  <span>Kho tài liệu & Hình ảnh đính kèm ({attachments.length})</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Lưu trữ an toàn trên IndexedDB, dễ dàng xem trước và tải xuống
                </p>
              </div>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-sage-700 dark:text-sage-300 bg-sage-100 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-900 hover:bg-sage-200/80 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Đang đọc...' : 'Tải tệp/ảnh lên'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Attachments Grid */}
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {attachments.map((att) => {
                  const isImage = att.type && att.type.startsWith('image/');
                  return (
                    <div
                      key={att.id}
                      className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 shadow-soft"
                    >
                      {/* Thumbnail or Icon */}
                      <div 
                        onClick={() => isImage && onPreviewImage(att)}
                        className={`w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden ${
                          isImage ? 'cursor-pointer hover:opacity-90' : ''
                        }`}
                      >
                        {isImage ? (
                          <img 
                            src={att.dataUrl} 
                            alt={att.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      {/* File Details */}
                      <div className="flex-1 min-w-0">
                        <div 
                          className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-sage-600"
                          title={att.name}
                          onClick={() => isImage ? onPreviewImage(att) : handleDownloadAttachment(att)}
                        >
                          {att.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{formatFileSize(att.size)}</span>
                          <span>•</span>
                          <span>{formatDateTime(att.uploadedAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {isImage && (
                          <button
                            type="button"
                            onClick={() => onPreviewImage(att)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Xem phóng to ảnh"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(att)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Tải tệp về máy"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Xóa tệp đính kèm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center cursor-pointer hover:border-sage-400 dark:hover:border-sage-600 transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kéo thả hoặc nhấn vào đây để tải ảnh chụp màn hình, tài liệu CV, báo cáo...
                </p>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-soft shadow-sage-600/30 transition-all active:scale-[0.98]"
            >
              {taskToEdit && !taskToEdit._isNew ? 'Lưu thay đổi' : 'Tạo công việc'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
