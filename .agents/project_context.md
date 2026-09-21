# BỐI CẢNH DỰ ÁN (PROJECT CONTEXT)

## 1. TỔNG QUAN DỰ ÁN
- **Tên dự án:** CheckList CV Personal (Website Quản lý Công việc & Checklist Cá nhân)
- **Mục tiêu:** Cung cấp ứng dụng quản lý công việc và checklist cá nhân với giao diện dịu mắt, thẩm mỹ cao, trực quan hóa tiến độ bằng biểu đồ, tích hợp không gian lưu trữ tài liệu/hình ảnh gắn liền với từng task, hỗ trợ truy cập đa thiết bị và deploy lên GitHub Pages.
- **Repository:** `https://github.com/ddtam2604work/CheckList_CV_personal`

## 2. TECH STACK & KIẾN TRÚC
- **Framework:** React 18 (Vite, ES Modules)
- **Styling:** Tailwind CSS v3 (JIT, Dark Mode class, tông màu dịu mắt Sage & Slate, Typography Plus Jakarta Sans / Inter)
- **Icons:** Lucide React
- **Trực quan hóa:** Chart.js & React-Chartjs-2 (Doughnut, Bar, Timeline Analytics)
- **Lưu trữ dữ liệu:** IndexedDB (thông qua `localforage` hoặc `idb-keyval`) cho phép lưu trữ tài liệu, hình ảnh dung lượng lớn bền vững trên trình duyệt, không bị giới hạn 5MB của LocalStorage.
- **Tính năng mở rộng:** Backup/Restore JSON, Kanban Board, Calendar Timeline, Central File Explorer.
- **CI/CD & Hosting:** GitHub Actions tự động build & deploy lên GitHub Pages (`gh-pages`).

## 3. CÁC QUY ƯỚC & NGUYÊN TẮC
- Tối ưu trải nghiệm mắt (Calming palette: Sage Green `#5B8266`, Cool Slate `#3B4252`, Dark Navy `#0F172A`).
- Hỗ trợ 100% Dark Mode & Mobile Responsive.
- Bền vững dữ liệu: Tự động lưu offline, hỗ trợ Export/Import.
