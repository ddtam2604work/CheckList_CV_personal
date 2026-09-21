# 🌿 CheckList CV Personal - Quản lý Công việc & Tài liệu Cá nhân

> Một website quản lý công việc và checklist cá nhân hiện đại với giao diện tông màu Sage dịu mắt, hỗ trợ theo dõi tiến độ bằng biểu đồ trực quan, tích hợp kho lưu trữ tài liệu & hình ảnh an toàn theo từng task trên nền tảng IndexedDB.

---

## ✨ Điểm nổi bật & Tính năng chính

### 1. 🌿 Giao diện Dịu mắt & Tinh tế (Calming Sage Theme)
- Phối màu **Sage Green** và **Cool Slate** nhẹ nhàng, giúp thư giãn mắt khi làm việc và học tập trong thời gian dài.
- Hỗ trợ đầy đủ **Chế độ Sáng (Light Mode)** và **Chế độ Tối (Dark Mode)** chuyển đổi êm dịu, không gây chói mắt.
- Responsive 100% trên điện thoại di động, máy tính bảng và màn hình máy tính.

### 2. ⏱️ Quản lý Thời hạn & Tiến độ Công việc
- Thiết lập chi tiết **Thời gian bắt đầu** và **Thời gian kết thúc (Deadline)**.
- Thẻ trạng thái thông minh: Tự động tính toán số ngày/giờ còn lại hoặc gắn nhãn **Quá hạn** màu sắc dịu.
- Tích hợp **Danh sách công việc con (Subtasks Checklist)** tự động đo lường và hiển thị % tiến độ hoàn thành kèm hiệu ứng chúc mừng (confetti).

### 3. 📊 Biểu đồ Phân tích Trực quan (Visual Analytics)
- Bảng tổng quan KPI: Tổng số việc, Đang làm, Đã xong, Quá hạn và Tỷ lệ phần trăm hoàn thành.
- **Biểu đồ tròn (Doughnut Chart):** Phân bổ trạng thái công việc.
- **Biểu đồ cột (Bar Chart):** Phân bổ công việc theo Mức độ ưu tiên (Khẩn cấp, Cao, Bình thường, Thấp) và theo từng Danh mục / Dự án.

### 4. 🗄️ Không gian Lưu trữ Tài liệu & Hình ảnh (Media & Document Vault)
- **Đính kèm trực tiếp vào từng Task:** Lưu trữ ảnh chụp màn hình, tài liệu CV, báo cáo PDF, ghi chú.
- **Công nghệ IndexedDB:** Dữ liệu lưu trực tiếp trên trình duyệt của bạn, không bị giới hạn 5MB như LocalStorage thông thường.
- **Kho lưu trữ tập trung (Central File Vault):** Tìm kiếm và duyệt tất cả tài liệu/ảnh trên toàn hệ thống, xem ảnh phóng to (Lightbox Preview), tải về máy hoặc nhảy ngay đến Task sở hữu tài liệu đó.

### 5. 🔄 Chế độ xem Đa dạng & Sao lưu Đa thiết bị
- **5 Chế độ xem:**
  1. *Danh sách (Checklist View)*
  2. *Bảng Kanban (Kanban Board)*
  3. *Dòng thời gian (Timeline & Lịch)*
  4. *Biểu đồ phân tích (Analytics)*
  5. *Kho tài liệu (Media Vault)*
- **Sao lưu & Đồng bộ:** Xuất/Nhập file sao lưu JSON an toàn để chuyển đổi giữa máy tính cá nhân, máy công ty và điện thoại di động mà không cần lo lắng về việc mất dữ liệu.

---

## 🛠️ Công nghệ Sử dụng

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS v3, Plus Jakarta Sans Font
- **Icons:** Lucide React
- **Biểu đồ:** Chart.js, React-Chartjs-2
- **Lưu trữ Cục bộ:** IndexedDB (`idb-keyval`)
- **Hiệu ứng:** Canvas Confetti

---

## 🚀 Hướng dẫn Cài đặt & Chạy Cục bộ

```bash
# Clone repository
git clone https://github.com/ddtam2604work/CheckList_CV_personal.git

# Di chuyển vào thư mục dự án
cd CheckList_CV_personal

# Cài đặt thư viện
npm install

# Khởi chạy server phát triển
npm run dev
```

---

## 🌐 Truy cập Trực tuyến qua GitHub Pages

Dự án đã được thiết lập sẵn **GitHub Actions** tự động biên dịch và triển khai lên GitHub Pages tại địa chỉ:

🔗 **`https://ddtam2604work.github.io/CheckList_CV_personal/`**

> **Lưu ý kích hoạt GitHub Pages:**
> 1. Truy cập vào kho lưu trữ trên GitHub: [ddtam2604work/CheckList_CV_personal](https://github.com/ddtam2604work/CheckList_CV_personal)
> 2. Vào **Settings** -> mục **Pages** ở menu bên trái.
> 3. Tại phần **Build and deployment** -> **Source**: Chọn **GitHub Actions** (hoặc chọn branch `gh-pages` / root).
> 4. Trang web sẽ sẵn sàng truy cập trên mọi thiết bị di động và máy tính!

---

*Phát triển bởi [ddtam2604work](https://github.com/ddtam2604work).*
