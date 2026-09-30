# TRẠNG THÁI CÔNG VIỆC (TASK STATE)

- **Thời gian cập nhật:** 2026-09-30T08:51:00+07:00
- **Trạng thái:** HOÀN THÀNH 100% (Completed)
- **Mục tiêu task:** Xây dựng tính năng "Lịch ra mắt sản phẩm" (Product Launch Calendar) tự động thông báo trước 2 ngày qua email `duytam262004@gmail.com`. Cho phép thêm sản phẩm với tên và thời gian ra mắt, có công cụ nạp dữ liệu mẫu thử nghiệm nhưng mặc định kho sạch sẽ (không chứa dữ liệu mẫu khi người dùng sử dụng).
- **Tiến độ chi tiết:**
  - [x] Khởi tạo dự án React 18 + Vite + Tailwind CSS với bảng màu Sage dịu mắt & Dark Mode.
  - [x] Dịch vụ lưu trữ IndexedDB bền vững (`idb-keyval`) cho task và file tài liệu/ảnh.
  - [x] Tính năng quản lý thời hạn bắt đầu/kết thúc và checklist con tự tính %.
  - [x] Biểu đồ phân tích trạng thái, ưu tiên và năng suất qua Chart.js.
  - [x] Kho lưu trữ tập trung (Media & Document Vault) với Image Lightbox và download.
  - [x] Nâng cấp Lịch & Timeline theo phong cách Google Calendar (Lưới Tháng 7x5, Tuần 7 cột, Lịch trình, nút Hôm nay).
  - [x] **[MỚI HOÀN THÀNH] Tích hợp Module Lịch Ra Mắt Sản Phẩm & Tự động Thông báo Email trước 2 ngày:**
    - **Dịch vụ Email thông báo (`emailService.js`)**: Gửi email tự động qua FormSubmit AJAX API tới `duytam262004@gmail.com` với bảng tóm tắt chuyên nghiệp (Tên sản phẩm, thời gian ra mắt, đếm ngược, nền tảng, ghi chú), tích hợp fallback `mailto:` và nút kiểm thử email trực tiếp.
    - **Cơ chế quét tự động trước 2 ngày (48 giờ)**: Hệ thống chạy background scanner định kỳ quét danh sách sản phẩm, nếu sản phẩm chạm mốc trước 2 ngày và chưa thông báo, hệ thống tự động kích hoạt gửi mail và cập nhật trạng thái `notified2DaysBefore: true` kèm thời điểm gửi.
    - **Modal thêm/sửa sản phẩm (`ProductModal.jsx`)**: Nhập tên sản phẩm (bắt buộc), ngày & giờ ra mắt (bắt buộc), nền tảng/phân loại, mô tả, email nhận mặc định `duytam262004@gmail.com`, có nút gửi thử email ngay trong modal.
    - **Giao diện Dashboard (`ProductLaunchView.jsx`)**: Tab "Lịch ra mắt" 🚀 trên ViewSwitcher, đồng hồ đếm ngược thời gian thực (Real-time Countdown Ticker), 4 thẻ KPI thống kê, bộ lọc theo trạng thái (Tất cả, Trong mốc 2 ngày, Đang chuẩn bị, Đã ra mắt), tìm kiếm nhanh.
    - **Tích hợp Trung tâm thông báo (`NotificationCenter.jsx`)**: Tự động sinh thông báo cảnh báo và icon Rocket khi sản phẩm nằm trong mốc trước 2 ngày hoặc ngày ra mắt, click chuyển thẳng tới sản phẩm.
    - **Tuyệt đối không có dữ liệu mẫu mặc định**: `loadProducts()` khởi tạo mảng rỗng `[]`, giao diện hiển thị Empty State thanh lịch, có nút nạp dữ liệu mẫu thử nghiệm và nút xóa sạch dữ liệu mẫu để giữ kho dữ liệu 100% sạch sẽ cho người dùng.
    - Đã kiểm thử qua Browser Subagent & build production bundle thành công 100%.
