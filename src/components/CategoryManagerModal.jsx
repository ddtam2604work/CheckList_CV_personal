import React, { useState } from 'react';
import { X, Tag, Plus, Trash2, Check, FolderKanban } from 'lucide-react';

const COLOR_OPTIONS = [
  { id: 'sage', label: 'Sage', bg: 'bg-sage-100 text-sage-800 border-sage-300 dark:bg-sage-950/70 dark:text-sage-300' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300' },
];

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  tasks,
  onAddCategory,
  onDeleteCategory
}) {
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState('sage');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), selectedColor);
    setNewCatName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sage-50 dark:bg-sage-950/60 text-sage-600 dark:text-sage-400 flex items-center justify-center border border-sage-200/60 dark:border-sage-900">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quản lý Danh mục & Nhóm
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tạo và sắp xếp các nhóm công việc theo nhu cầu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleAdd} className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-750">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tạo nhóm / danh mục mới
          </label>
          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ví dụ: Thiết kế UI, Marketing, Dự án AI..."
              className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>
          </div>

          {/* Color palette selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Màu đại diện:</span>
            <div className="flex items-center gap-1.5">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setSelectedColor(col.id)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    col.id === 'sage' ? 'bg-sage-500' :
                    col.id === 'emerald' ? 'bg-emerald-500' :
                    col.id === 'blue' ? 'bg-blue-500' :
                    col.id === 'purple' ? 'bg-purple-500' :
                    col.id === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                >
                  {selectedColor === col.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Categories List */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Danh sách danh mục hiện có ({categories.length})
          </label>
          <div className="space-y-2 max-h-[45vh] overflow-y-auto">
            {categories.map((cat) => {
              const taskCount = tasks.filter(t => t.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 text-xs shadow-soft"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      cat.color === 'emerald' ? 'bg-emerald-500' :
                      cat.color === 'blue' ? 'bg-blue-500' :
                      cat.color === 'purple' ? 'bg-purple-500' :
                      cat.color === 'amber' ? 'bg-amber-500' :
                      cat.color === 'rose' ? 'bg-rose-500' : 'bg-sage-500'
                    }`} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {taskCount} công việc
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Xóa danh mục"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hoàn tất
          </button>
        </div>

      </div>
    </div>
  );
}
