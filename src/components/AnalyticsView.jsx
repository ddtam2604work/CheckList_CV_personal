import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Award
} from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function AnalyticsView({ tasks, isDark }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const review = tasks.filter(t => t.status === 'review').length;
  const todo = tasks.filter(t => t.status === 'todo').length;

  const now = new Date();
  const overdue = tasks.filter(t => {
    if (t.status === 'completed' || !t.endDate) return false;
    return new Date(t.endDate) < now;
  }).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Doughnut Chart Data (Trạng thái công việc)
  const doughnutData = {
    labels: ['Chưa làm', 'Đang thực hiện', 'Chờ duyệt', 'Đã hoàn thành', 'Quá hạn'],
    datasets: [
      {
        data: [todo, inProgress, review, completed, overdue],
        backgroundColor: [
          '#94a3b8', // slate
          '#5f876f', // sage
          '#a855f7', // purple
          '#10b981', // emerald
          '#f43f5e', // rose
        ],
        borderColor: isDark ? '#1e293b' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Group by Category for Bar Chart
  const categoryCounts = {};
  tasks.forEach(t => {
    const cat = t.category || 'Chung';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryLabels = Object.keys(categoryCounts);
  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Số lượng công việc',
        data: categoryLabels.map(k => categoryCounts[k]),
        backgroundColor: '#5f876f',
        borderRadius: 8,
      },
    ],
  };

  // Group by Priority for Bar Chart
  const priorityData = {
    labels: ['Khẩn cấp', 'Ưu tiên cao', 'Bình thường', 'Thấp'],
    datasets: [
      {
        label: 'Phân bố ưu tiên',
        data: [
          tasks.filter(t => t.priority === 'urgent').length,
          tasks.filter(t => t.priority === 'high').length,
          tasks.filter(t => t.priority === 'medium').length,
          tasks.filter(t => t.priority === 'low').length,
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#94a3b8'],
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: isDark ? '#94a3b8' : '#64748b' },
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)' }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: isDark ? '#94a3b8' : '#64748b' },
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)' }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Insight Highlight Card */}
      <div className="bg-gradient-to-r from-sage-600 to-sage-800 text-white rounded-3xl p-6 sm:p-8 shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-3">
            <Award className="w-3.5 h-3.5 text-sage-200" />
            <span>Tổng quan hiệu suất công việc</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hiệu suất đạt {completionRate}%
          </h2>
          <p className="text-sage-100 text-xs sm:text-sm max-w-xl mt-1 leading-relaxed">
            Bạn đã hoàn thành xuất sắc {completed} trên tổng số {total} công việc được giao. 
            {overdue > 0 
              ? ` Hiện có ${overdue} công việc quá hạn cần ưu tiên xử lý sớm.` 
              : ' Tất cả công việc đang trong tiến độ kiểm soát tốt!'}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-24 h-24 rounded-full border-4 border-white/20 flex flex-col items-center justify-center backdrop-blur-sm bg-white/10">
            <span className="text-2xl font-black">{completionRate}%</span>
            <span className="text-[10px] text-sage-200 uppercase font-semibold">Tỷ lệ xong</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Donut Chart: Trạng thái công việc */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sage-600" />
                <span>Phân bổ theo trạng thái</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tỷ lệ công việc theo giai đoạn thực hiện
              </p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            {total > 0 ? (
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: isDark ? '#cbd5e1' : '#475569',
                        boxWidth: 12,
                        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
                      }
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-xs text-slate-400">Chưa có dữ liệu công việc</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Phân bố theo Mức độ ưu tiên */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Phân bổ theo mức độ ưu tiên</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mức độ khẩn cấp và trọng tâm của các đầu việc
              </p>
            </div>
          </div>
          <div className="h-64">
            {total > 0 ? (
              <Bar data={priorityData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Phân bố theo Danh mục */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sage-600" />
                <span>Số lượng công việc theo Danh mục / Dự án</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thống kê khối lượng công việc được phân bổ theo từng lĩnh vực
              </p>
            </div>
          </div>
          <div className="h-64">
            {categoryLabels.length > 0 ? (
              <Bar data={categoryData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Chưa có danh mục nào</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
