# ☁️ CloudBox — Ứng Dụng Lưu Trữ Đám Mây Cá Nhân (Front-end Phase 1)

> **CloudBox** là ứng dụng lưu trữ đám mây cá nhân hiện đại, thanh lịch và mượt mà, được thiết kế kết hợp sự tinh tế của **Linear/Notion** và tính trực quan, rõ ràng của **Google Drive**. Toàn bộ giao diện được xây dựng bằng **tiếng Việt (vi-VN)** chuẩn mực, chuẩn typography không bao giờ bị cắt dấu tiếng Việt.

---

## 🌟 Điểm Nổi Bật Của Giao Diện (UI/UX Highlights)

1. **Thẩm mỹ thiết kế (Aesthetic Target)**:
   - Tối giản, thanh thoát và tự tin. Tuyệt đối không dùng gradient tím lòe loẹt hay emoji làm icon.
   - Bộ token màu sắc chuyên nghiệp cho cả **Chế độ sáng (Light)** và **Chế độ tối (Dark)**.
   - Phông chữ **Be Vietnam Pro** (tự lưu trữ qua `next/font/google`) với `line-height ≥ 1.5` bảo đảm dấu tiếng Việt hiển thị hoàn hảo.

2. **Khắc phục triệt để các hạn chế của bản prototype cũ**:
   - **Nút "+ Mới" duy nhất**: Tích hợp menu dropdown thông minh tại sidebar (Tải tệp lên, Tải thư mục lên, Thư mục mới, Tệp văn bản mới).
   - **Lưới hiển thị tràn viền (Fluid Grid)**: `repeat(auto-fill, minmax(220px, 1fr))` lấp đầy màn hình, không bị khoảng trống bên phải.
   - **Hình thu nhỏ xem trước chân thực (Procedural SVG Thumbnails)**: Tỷ lệ 4:3 cho mọi loại file (ảnh gradient trừu tượng, video kèm huy hiệu play & thời lượng, PDF mô phỏng trang đầu, bảng tính mô phỏng ô dữ liệu, mã nguồn có syntax highlighting).
   - **Định dạng ngày tương đối**: Hiển thị thân thiện "Hôm nay, 09:13", "Hôm qua", "21 thg 11, 2026".
   - **Menu ba chấm (⋮) & Checkbox thông minh**: Chỉ xuất hiện khi rê chuột (hover) hoặc focus, kèm menu chuột phải (Context Menu) cho từng tệp, thư mục và vùng trống.
   - **Thanh đo dung lượng (Storage Meter)**: Luôn có vạch hiển thị tối thiểu, hiển thị "18,4 MB / 200 GB", hover hiển thị tooltip phân bổ dung lượng chi tiết.
   - **Thẻ thư mục phong phú**: Hiển thị "12 mục · Hôm qua", gắn sao nhanh và hỗ trợ bảng chọn 8 màu sắc tùy chỉnh.
   - **Chế độ xem danh sách (List View)**: Bảng ảo hóa mượt mà 60fps với `@tanstack/react-virtual`, header dính (sticky) có mũi tên sắp xếp đa chiều.
   - **Hệ thống phản hồi tức thì (Feedback Layer)**: Toast thông báo có nút **Hoàn tác (Undo)** 5 giây khi xóa/di chuyển/gắn sao, skeleton loading thanh lịch, hình minh họa SVG trống (Empty states) vẽ riêng không dùng emoji.

3. **Tính năng tương tác đầy đủ (Fully Interactive)**:
   - **Trình xem trước toàn màn hình (Preview Modal)**: Phóng to/thu nhỏ (zoom/pinch/wheel) và kéo ảnh, trình phát video kèm thanh điều khiển tùy biến, trình duyệt PDF theo trang, trình xem mã nguồn có số dòng và nút sao chép. Phím `←` / `→` chuyển tệp, `Esc` đóng.
   - **Bảng chi tiết (Details Panel)**: Rộng 340px trượt từ bên phải (bottom sheet trên mobile), gồm 3 tab: Chi tiết tệp tin, Nhật ký hoạt động (Activity) và Lịch sử phiên bản (Version History) với nút khôi phục mock.
   - **Quản lý tải lên (Upload Manager)**: Widget nổi góc dưới bên phải, hiển thị tốc độ, thời gian còn lại (ETA), tiến trình %, nút tạm dừng/tiếp tục/hủy và thử lại khi có lỗi mạng.
   - **Vùng kéo & thả (Drag Overlay)**: Khung viền nét đứt thanh lịch khi kéo tệp từ máy tính vào trình duyệt; các thư mục sáng lên làm đích thả riêng lẻ.
   - **Bảng lệnh nhanh (Command Palette - `Ctrl/⌘ + K`)**: Tìm kiếm tệp tin, thao tác tạo thư mục, đổi giao diện, nhảy nhanh đến các mục.
   - **Phím tắt toàn diện**:
     - `/`: Tìm kiếm tức thì
     - `N`: Tạo thư mục mới
     - `U`: Mở hộp thoại tải tệp lên
     - `F2`: Đổi tên mục đang chọn
     - `Delete / Backspace`: Chuyển mục đang chọn vào thùng rác
     - `Space`: Mở xem trước
     - `Ctrl/⌘ + A`: Chọn tất cả
     - `Esc`: Bỏ chọn / Đóng bảng điều khiển

4. **Trang chia sẻ công khai (`/s/[id]`)**:
   - Giao diện độc lập căn giữa cho người nhận liên kết.
   - Hỗ trợ đầy đủ 3 trạng thái: Bình thường (xem & tải xuống), Cần mật khẩu bảo vệ, và Liên kết đã hết hạn.

5. **Trang Cài đặt (`/settings`)**:
   - 5 tab hoàn chỉnh: Hồ sơ, Giao diện (Sáng / Tối / Hệ thống, mật độ Thoải mái / Gọn), Bảo mật (2FA, danh sách phiên đăng nhập), Dung lượng (biểu đồ phân bổ + top 5 tệp lớn nhất), Ứng dụng (Cài PWA, tải APK).
   - Nút **"Đặt lại dữ liệu mẫu"** khôi phục nhanh ~45 tệp tin ban đầu.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Ngôn ngữ**: TypeScript Strict Mode
- **Styling**: Tailwind CSS với bộ biến CSS tokens
- **UI Components**: Radix UI (shadcn/ui primitives), Lucide React
- **Hiệu ứng chuyển động**: `motion` (layout animations, cubic-bezier(0.2, 0.8, 0.2, 1))
- **Quản lý trạng thái UI**: `zustand`
- **Quản lý dữ liệu & Cache**: `@tanstack/react-query`
- **Ảo hóa danh sách**: `@tanstack/react-virtual`
- **Bảng lệnh**: `cmdk`
- **Thông báo**: `sonner` (hỗ trợ Undo toast)
- **Giao diện sáng/tối**: `next-themes`
- **Biểu mẫu & Xác thực**: `react-hook-form` + `zod`
- **Xử lý ngày tháng**: `date-fns` (vi locale)
- **Phông chữ**: `Be Vietnam Pro` (self-hosted via `next/font/google`)
- **Tầng dữ liệu**: `LocalFilesRepository` lưu trữ trong `localStorage` với độ trễ mô phỏng 150-300ms, không phụ thuộc backend hay dịch vụ bên ngoài.

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local Setup)

### 1. Cài đặt thư viện
```bash
npm install --legacy-peer-deps
```

### 2. Khởi động môi trường phát triển
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000). Hệ thống sẽ tự động chuyển hướng vào `/drive`.

### 3. Kiểm tra kiểm thử bản build
```bash
npm run build
```
Dự án được cấu hình nghiêm ngặt với 0 lỗi TypeScript và 0 lỗi ESLint.

---

## ☁️ Triển Khai Lên Vercel (Zero-Config Deployment)

CloudBox Phase 1 là **UI-only thuần túy**, hoạt động hoàn toàn trên tầng dữ liệu mô phỏng chuẩn mực trong trình duyệt:
- **KHÔNG** yêu cầu biến môi trường (Zero `.env` variables).
- **KHÔNG** yêu cầu kết nối cơ sở dữ liệu hay bộ nhớ bên ngoài.
- **KHÔNG** gọi API bên thứ ba.

### Các bước triển khai:
1. Đẩy mã nguồn lên kho lưu trữ GitHub của bạn:
   ```bash
   git add .
   git commit -m "feat: complete CloudBox Phase 1 front-end interface"
   git push origin main
   ```
2. Truy cập [Vercel Dashboard](https://vercel.com) và chọn **Import Project**.
3. Bấm **Deploy** mà không cần cấu hình thêm bất kỳ biến môi trường nào.
4. Nhận đường link live của ứng dụng và trải nghiệm tức thì!

---

## 📱 Khả Năng Thích Ứng (Responsive Matrix)

| Kích thước | Môi trường | Hành vi giao diện |
| :--- | :--- | :--- |
| **390px** | Mobile | Thanh điều hướng dưới đáy (Bottom Tab Bar), nút "+" nổi, thanh tìm kiếm thu gọn, bảng chi tiết hiển thị dạng bottom sheet. |
| **768px** | Tablet | Sidebar thu gọn dạng icon rail (72px), bố cục lưới tự co giãn 2-3 cột. |
| **1440px** | Laptop / Desktop | Sidebar mở rộng đầy đủ (264px), thanh top bar có tìm kiếm Command K, lưới tràn viền 5-6 cột. |
| **1920px** | Màn hình lớn | Lưới chất lượng cao tự động lấp đầy toàn bộ chiều rộng không giới hạn max-width. |

---

## 📄 Bản Quyền & Giấy Phép
Dự án thuộc quyền sở hữu của **CloudBox Inc. © 2026**.
Mọi thắc mắc hoặc yêu cầu đóng góp vui lòng mở Issue hoặc Pull Request.
