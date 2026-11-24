# ☁️ CloudBox — Lưu Trữ Đám Mây Cá Nhân (Phong Cách Material You / Google Drive & Photos)

> **CloudBox** là ứng dụng lưu trữ đám mây cá nhân hiện đại với giao diện **tiếng Việt (vi-VN)**, mang ngôn ngữ thiết kế **Material You** tinh tế của **Google Photos & Google Drive**. Sử dụng dữ liệu mẫu phong phú và lưu trữ trạng thái bền vững qua `localStorage`, phân tách lớp dữ liệu rõ ràng (`services/`, `hooks/`) sẵn sàng kết nối API thật.

---

## 🌟 Điểm Nổi Bật Của Giao Diện (Material You UI/UX)

1. **Ngôn ngữ thiết kế Google Material You**:
   - Nền ngoài xám xanh nhạt (`#F0F4F9` / Dark `#131314`).
   - Vùng nội dung chính là thẻ trắng `#FFFFFF` (Dark `#1E1F20`) bo góc lớn 24px (`rounded-[24px]`), cuộn độc lập.
   - Nút bo tròn hoàn toàn (`rounded-full` pill), chuyển động mượt mà 150–200ms ease-out.
   - Phông chữ **Roboto / Google Sans** chuẩn mực, không cắt dấu tiếng Việt.

2. **Thanh trên thông minh (TopBar & Selection Mode)**:
   - Nút menu (☰) đóng/mở sidebar.
   - Logo CloudBox (đám mây + chữ CloudBox) độc quyền.
   - Ô tìm kiếm bo tròn dài ở giữa (placeholder *"Tìm trong CloudBox"*).
   - Nút "+ Tải lên", Trợ giúp, Cài đặt, Chuyển sáng/tối, Nút "Tải APK" (bản Android), Avatar tròn viền gradient Google.
   - **Chế độ chọn tệp**: Khi chọn ≥1 tệp, thanh trên tự động chuyển thành thanh chọn hành động (Số lượng đã chọn, Tải xuống, Chia sẻ, Gắn dấu sao, Di chuyển, Xóa).

3. **Sidebar trái dạng cột icon mở rộng**:
   - Dạng icon rail 72px, mở rộng kèm nhãn chữ khi hover hoặc bấm ☰.
   - Mục đang chọn có nền pill xanh nhạt (`bg-nav-active`).
   - Đầy đủ các mục: **Tệp của tôi**, **Gần đây**, **Có gắn dấu sao**, **Ảnh & Video**, **Tài liệu**, **Thư mục khóa**, **Thùng rác**.
   - Thanh đo dung lượng (ví dụ: *12,4 GB / 200 GB*) và nút *"Mua thêm dung lượng"*.

4. **Trang "Tệp của tôi" (`/drive`)**:
   - **Hàng thẻ kỷ niệm (Memories Carousel)** ở đầu trang: Thẻ ảnh bìa bo góc 16px cuộn ngang mượt mà với nút mũi tên tròn.
   - **Thư mục**: Các chip bo tròn kèm icon thư mục và menu ba chấm.
   - **Tệp tin nhóm theo ngày**: Tiêu đề tháng lớn (*"Tháng 11"*, font-weight 400), tiêu đề ngày nhỏ bên dưới (*"Thứ Hai, ngày 23 tháng 11"*), lưới thẻ tệp tin và icon màu theo loại tài liệu chuẩn Material You.

5. **Tương tác toàn diện**:
   - **Hộp kiểm tròn (Circular Checkbox)** ở góc thẻ khi hover.
   - **Kéo & thả**: Lớp phủ *"Thả tệp để tải lên"* khi kéo tệp vào trang.
   - **Xem trước Lightbox**: Toàn màn hình nền tối, phím `←`/`→` chuyển ảnh, phím `Esc` đóng, phóng to/thu nhỏ ảnh.
   - **Thư mục đã khóa (`/locked`)**: Bảo mật bằng mã PIN ẩn khỏi tìm kiếm và thư viện chung.
   - **Snackbar & Toast có nút "Hoàn tác"** sau khi xóa hoặc di chuyển.

---

## 🛠️ Công Nghệ (Tech Stack)

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Ngôn ngữ**: TypeScript Strict Mode
- **Styling**: Tailwind CSS + Material You Tokens
- **Icon**: Lucide React (nét mảnh, bo tròn giống Material Symbols)
- **Quản lý dữ liệu**: `@tanstack/react-query` + `LocalFilesRepository`
- **Quản lý trạng thái UI**: `zustand`
- **Thông báo**: `sonner` (hỗ trợ Undo toast)
- **Giao diện sáng/tối**: `next-themes`
- **Phông chữ**: Roboto / Google Sans via `next/font/google`

---

## 🚀 Hướng Dẫn Chạy & Cài Đặt

### 1. Cài đặt thư viện
```bash
npm install --legacy-peer-deps
```

### 2. Chạy môi trường phát triển (Dev)
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

### 3. Kiểm tra bản build sản xuất
```bash
npm run build
```

---

## ☁️ Triển Khai Lên Vercel (Zero-Config)

Ứng dụng sẵn sàng deploy lên Vercel không cần biến môi trường:
1. Đẩy mã nguồn lên GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Google Material You style CloudBox"
   git push origin main
   ```
2. Truy cập [vercel.com](https://vercel.com), bấm **Add New Project**, chọn kho lưu trữ `cloudbox`.
3. Bấm **Deploy**. Vercel sẽ tự động build và xuất bản trang web.
