# ☁️ CloudBox - Ứng Dụng Lưu Trữ Đám Mây Cá Nhân

> **CloudBox** là ứng dụng lưu trữ đám mây cá nhân hiện đại (tương tự Google Drive / Dropbox), được xây dựng với Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui và hệ thống cơ sở dữ liệu Supabase (Auth, Postgres, Storage).

---

## 🌟 Tính Năng Nổi Bật (Core Features)

1. **Xác thực người dùng (Authentication)**:
   - Đăng nhập/Đăng ký qua Email & Mật khẩu và **Google OAuth**.
   - Bảo vệ toàn bộ route riêng tư bằng Next.js Middleware.
   - Quản lý phiên và đăng xuất an toàn.

2. **Tải lên trực tiếp (Direct Upload)**:
   - Kéo & thả tệp tin hoặc chọn qua hộp thoại. Hỗ trợ tải nhiều tệp cùng lúc.
   - **Tải lên TRỰC TIẾP từ trình duyệt lên Supabase Storage** (vượt qua giới hạn 4.5MB Serverless request body của Vercel).
   - Thanh tiến trình (%) chi tiết cho từng tệp tin và tính năng **Hủy tải lên (Cancel)** tức thì.
   - Chuẩn hóa tên tệp và kiểm tra dung lượng còn trống trước khi tải.

3. **Quản lý Thư mục (Folders)**:
   - Tạo thư mục mới, đổi tên thư mục.
   - Hỗ trợ thư mục lồng nhau không giới hạn cấp độ.
   - Di chuyển thư mục (tự động ngăn chặn việc di chuyển vào chính nó hoặc thư mục con).
   - Thanh điều hướng đường dẫn (Breadcrumbs) trực quan.

4. **Quản lý Tệp tin (Files Management)**:
   - Chuyển đổi linh hoạt giữa chế độ **Lưới (Grid View)** và **Danh sách (List View)** (tự động lưu trạng thái).
   - Tìm kiếm tệp & thư mục theo tên theo thời gian thực.
   - Sắp xếp đa dạng: Tên (A-Z, Z-A), Ngày cập nhật (Mới nhất, Cũ nhất), Kích thước (Lớn → Nhỏ, Nhỏ → Lớn).
   - Tải xuống bằng **Signed URL** thời hạn ngắn bảo mật cao.

5. **Thùng rác & Tự động dọn dẹp (Trash & Auto-purge)**:
   - Xóa mềm (Soft delete) chuyển vào thùng rác.
   - Khôi phục (Restore) tệp và thư mục đã xóa bất kỳ lúc nào.
   - Xóa vĩnh viễn (Permanent delete) dọn dẹp dữ liệu trong Storage và cập nhật lại dung lượng đã dùng.
   - API Cronjob tự động dọn dẹp các tệp/thư mục trong thùng rác sau 30 ngày.

6. **Xem trước đa định dạng (In-app Preview)**:
   - Hỗ trợ xem trước trực tiếp trong modal:
     - **Hình ảnh**: PNG, JPG, JPEG, GIF, WebP, SVG,...
     - **Tài liệu PDF**: Trình xem PDF nhúng sẵn.
     - **Video**: MP4, WebM,...
     - **Âm thanh**: MP3, WAV, OGG,...
     - **Văn bản & Mã nguồn**: TXT, Markdown, JSON, JS, TS, HTML, CSS, Python, SQL,...
   - Mọi bản xem trước đều dùng URL ký mã bảo mật (Signed URL), bucket luôn ở chế độ riêng tư (Private).

7. **Chia sẻ công khai (Public File Sharing)**:
   - Tạo liên kết chia sẻ cho từng tệp tin với chuỗi token ngẫu nhiên độ dài cao (chống đoán mò).
   - Thiết lập thời gian hết hạn (1 ngày, 7 ngày, 30 ngày hoặc không bao giờ).
   - Khả năng **Thu hồi liên kết (Revoke)** bất kỳ lúc nào.
   - Trang công khai `/s/[token]` cho phép khách xem thông tin, xem trước và tải tệp xuống.

8. **Kiểm soát dung lượng lưu trữ (Storage Quota)**:
   - Mặc định 1 GB lưu trữ cho mỗi người dùng.
   - Thanh hiển thị mức dung lượng đã dùng / tổng dung lượng theo thời gian thực.
   - Khóa tính năng tải lên khi hết dung lượng.

9. **Giao diện & Trải nghiệm (UI/UX)**:
   - Giao diện 100% tiếng Việt thân thiện, hiện đại.
   - Hỗ trợ **Chế độ tối (Dark mode)** & Chế độ sáng (Light mode).
   - Tối ưu hiển thị responsive trên cả máy tính, máy tính bảng và điện thoại di động.
   - Thông báo Toast nhanh qua Sonner, hiệu ứng loading skeletons mượt mà.

---

## 🏗️ Cấu Trúc Thư Mục Dự Án

```
cloudbox/
├── .env.example                       # File mẫu biến môi trường
├── README.md                          # Hướng dẫn chi tiết tiếng Việt
├── package.json                       # Khai báo thư viện & scripts
├── supabase/
│   └── migrations/
│       ├── 20240101000000_init_schema.sql      # Schema Postgres, RLS & Triggers
│       └── 20240101000001_storage_policies.sql # Bucket 'cloudbox' & Storage RLS
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout (Theme, Sonner Toast)
    │   ├── page.tsx                   # Landing page
    │   ├── (auth)/
    │   │   ├── login/page.tsx         # Trang đăng nhập (Email / Google)
    │   │   └── register/page.tsx      # Trang đăng ký
    │   ├── auth/callback/route.ts     # Xử lý OAuth callback & xác nhận email
    │   ├── (dashboard)/
    │   │   ├── layout.tsx             # Dashboard Layout (Sidebar, Header, Context)
    │   │   ├── drive/
    │   │   │   ├── page.tsx           # Thư mục gốc
    │   │   │   └── [folderId]/page.tsx# Thư mục lồng nhau
    │   │   ├── trash/page.tsx         # Trang thùng rác
    │   │   └── settings/page.tsx      # Trang cài đặt & dung lượng
    │   ├── s/[token]/page.tsx         # Trang chia sẻ tệp công khai
    │   └── api/purge-trash/route.ts   # API auto-purge thùng rác
    ├── components/
    │   ├── ui/                        # Các component chuẩn shadcn/ui
    │   ├── layout/                    # Header, Sidebar, Breadcrumbs, ThemeToggle
    │   ├── upload/                    # UploadDropzone, UploadModal
    │   ├── files/                     # FileGrid, FileList, FileItem, Modals
    │   ├── preview/                   # PreviewModal (Ảnh, PDF, Video, Audio, Text)
    │   ├── share/                     # ShareModal
    │   └── quota/                     # QuotaUsageBar
    ├── context/
    │   └── DriveContext.tsx           # State management quản lý Drive toàn cục
    ├── lib/
    │   ├── supabase/                  # client.ts, server.ts, admin.ts, middleware.ts
    │   └── utils.ts                   # Định dạng bytes, ngày tháng, sanitize filename
    ├── types/                         # Database schema types & App types
    └── middleware.ts                  # Next.js route protection middleware
```

---

## 🚀 Hướng Dẫn Cài Đặt Từng Bước (Step-by-Step Setup)

### Bước 1: Tạo dự án Supabase
1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập (hoặc đăng ký tài khoản miễn phí).
2. Nhấn **New Project**, chọn Organization của bạn.
3. Điền các thông tin:
   - **Name**: `CloudBox` (hoặc tên bạn muốn)
   - **Database Password**: Nhập mật khẩu an toàn và ghi nhớ lại.
   - **Region**: Chọn khu vực gần bạn nhất (ví dụ: `Southeast Asia (Singapore)`).
4. Nhấn **Create new project** và đợi 1-2 phút để Supabase khởi tạo.

---

### Bước 2: Chạy Migrations trong Supabase
1. Tại trang quản trị Supabase của dự án, mở mục **SQL Editor** ở thanh menu bên trái.
2. Nhấn **New query**.
3. Mở file [supabase/migrations/20240101000000_init_schema.sql](file:///supabase/migrations/20240101000000_init_schema.sql), sao chép toàn bộ nội dung và dán vào SQL Editor.
4. Nhấn **Run** (hoặc `Ctrl + Enter`). Lệnh này sẽ tạo các bảng `profiles`, `folders`, `files`, `share_links`, kích hoạt Row Level Security (RLS) và cài đặt trigger tự động cập nhật dung lượng.
5. Tạo một query mới, mở file [supabase/migrations/20240101000001_storage_policies.sql](file:///supabase/migrations/20240101000001_storage_policies.sql), dán vào và nhấn **Run** để khởi tạo cấu hình và phân quyền cho Storage.

---

### Bước 3: Tạo Storage Bucket riêng tư (Private Bucket)
1. Tại Supabase Dashboard, chuyển đến mục **Storage**.
2. Kiểm tra xem bucket `cloudbox` đã xuất hiện chưa (từ migration ở Bước 2).
3. Nếu chưa có, nhấn **New bucket**:
   - **Bucket name**: `cloudbox`
   - **Public bucket**: **TẮT (Gạt sang OFF / Private)** *(Rất quan trọng để đảm bảo bảo mật tệp cá nhân)*
   - Nhấn **Save bucket**.

---

### Bước 4: Cấu hình Google OAuth (Tùy chọn cho tính năng Đăng nhập bằng Google)
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một dự án mới và vào **APIs & Services** > **Credentials**.
3. Chọn **Create Credentials** > **OAuth client ID** > Chọn loại **Web application**.
4. Trong mục **Authorized redirect URIs**, thêm URI sau (lấy từ Supabase):
   - Mở Supabase Dashboard > **Authentication** > **Providers** > **Google**.
   - Sao chép **Callback URL** (có dạng `https://<project-id>.supabase.co/auth/v1/callback`) và dán vào Google Cloud Console.
5. Sao chép **Client ID** và **Client Secret** từ Google Cloud Console dán vào cấu hình Google Provider trong Supabase và nhấn **Save**.
6. Trong Supabase Dashboard > **Authentication** > **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (hoặc URL Vercel khi deploy).
   - **Redirect URLs**: Thêm:
     - `http://localhost:3000/**`
     - `https://your-app-name.vercel.app/**` (khi đã deploy).

---

### Bước 5: Cấu hình biến môi trường cục bộ
1. Sao chép file `.env.example` thành `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Mở file `.env.local` và điền các khóa lấy từ Supabase Dashboard (**Project Settings** > **API**):
   ```env
   # Project URL
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co

   # Project API Keys > anon public
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

   # Project API Keys > service_role (Bảo mật, chỉ dùng server-side)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

   # URL ứng dụng
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

### Bước 6: Khởi chạy và kiểm thử trên môi trường cục bộ
1. Cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   ```
2. Khởi động server phát triển:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt tại địa chỉ [http://localhost:3000](http://localhost:3000).
4. Đăng ký tài khoản mới và bắt đầu trải nghiệm CloudBox!

---

### Bước 7: Triển khai lên Vercel (Deploy to Vercel)
1. Đẩy mã nguồn dự án lên GitHub / GitLab / Bitbucket của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: Initial commit for CloudBox personal cloud storage"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cloudbox.git
   git push -u origin main
   ```
2. Truy cập [https://vercel.com](https://vercel.com), nhấn **Add New...** > **Project**.
3. Chọn kho lưu trữ `cloudbox` vừa tải lên.
4. Trong phần **Environment Variables**, thêm 4 biến môi trường:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (đặt thành domain Vercel của bạn, vd: `https://cloudbox-app.vercel.app`)
5. Nhấn **Deploy** và đợi Vercel biên dịch xong.
6. **Bước bắt buộc cuối cùng**: Mở lại Supabase Dashboard > **Authentication** > **URL Configuration**, thêm domain Vercel vào:
   - **Site URL**: `https://your-app-name.vercel.app`
   - **Redirect URLs**: `https://your-app-name.vercel.app/**`
   *(Điều này giúp việc đăng nhập Google OAuth và link xác nhận email chuyển hướng chính xác về trang Vercel).*

---

## 🛡️ Cơ Chế Bảo Mật & Kỹ Thuật

- **Bảo mật lưu trữ**: Bucket Storage `cloudbox` được cấu hình `public = false`. Mọi thao tác tải xuống hoặc xem trước đều phải thông qua URL ký mã (Signed URL) có thời hạn ngắn (300 giây).
- **Phân tách dữ liệu**: Đường dẫn tệp tin trong Storage luôn tuân thủ cấu trúc `{user_id}/{folder_id_or_root}/{unique_id}_{filename}`, và chính sách Storage RLS chặn tuyệt đối việc người dùng truy cập hoặc can thiệp vào thư mục của người dùng khác.
- **Bảo vệ Service Role**: `SUPABASE_SERVICE_ROLE_KEY` chỉ được gọi tại các Server Component hoặc Route Handler nội bộ (như tạo link chia sẻ công khai và tự động dọn rác), tuyệt đối không bao giờ trả về client.
- **Tải lên trực tiếp vượt giới hạn**: Client tải lên trực tiếp tới Supabase Storage REST endpoint qua `XMLHttpRequest`, theo dõi thanh tiến trình mượt mà và không lo gặp lỗi 413 Payload Too Large (4.5MB) của Vercel Serverless.

---

## 📜 Giấy Phép & Đóng Góp
Dự án được xây dựng phục vụ nhu cầu lưu trữ cá nhân an toàn, ổn định và nhanh chóng. Mọi đóng góp cải tiến đều được hoan nghênh!
