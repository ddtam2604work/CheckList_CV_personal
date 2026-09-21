# TRẠNG THÁI CÔNG VIỆC (TASK STATE)

- **Thời gian cập nhật:** 2026-09-21T12:06:40+07:00
- **Trạng thái:** HOÀN THÀNH 100% (Completed)
- **Mục tiêu task:** Xây dựng website checklist công việc với giao diện dịu mắt, biểu đồ thống kê, không gian lưu trữ tài liệu/ảnh, deploy GitHub Pages, nâng cấp module Lịch theo chuẩn Google Calendar và bổ sung tính năng quản lý Danh mục / Nhóm công việc.
- **Tiến độ chi tiết:**
  - [x] Khởi tạo dự án React 18 + Vite + Tailwind CSS với bảng màu Sage dịu mắt & Dark Mode.
  - [x] Dịch vụ lưu trữ IndexedDB bền vững (`idb-keyval`) cho task và file tài liệu/ảnh.
  - [x] Tính năng quản lý thời hạn bắt đầu/kết thúc và checklist con tự tính %.
  - [x] Biểu đồ phân tích trạng thái, ưu tiên và năng suất qua Chart.js.
  - [x] Kho lưu trữ tập trung (Media & Document Vault) với Image Lightbox và download.
  - [x] Nâng cấp Lịch & Timeline theo phong cách Google Calendar (Lưới Tháng 7x5, Tuần 7 cột, Lịch trình, nút Hôm nay).
  - [x] Khắc phục lỗi trang trắng trên GitHub Pages bằng base relative `./` và đóng gói universal assets.
  - [x] **[MỚI] Tích hợp Module Quản lý Danh mục & Nhóm công việc:**
    - Modal quản lý nhóm (`CategoryManagerModal`): Thêm nhóm mới, chọn màu đại diện, xem số lượng công việc theo từng nhóm, xóa nhóm.
    - Thêm nhanh danh mục inline ngay khi tạo task mới trong `TaskModal`.
    - Bộ lọc danh mục thông minh trong `TaskListView` với tùy chọn quản lý nhanh.
    - Lưu trữ danh mục lâu dài vào IndexedDB và tích hợp vào file sao lưu JSON.
  - [x] Build và deploy trực tiếp lên [ddtam2604work/CheckList_CV_personal](https://github.com/ddtam2604work/CheckList_CV_personal) hoạt động 100%.
