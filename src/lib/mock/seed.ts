import { FileNode, NodeOwner } from "./types";

const CURRENT_USER: NodeOwner = {
  id: "user-me",
  name: "Nguyễn Tuấn Anh",
  email: "tuananh@cloudbox.io",
  isCurrentUser: true,
};

const USER_MINH_ANH: NodeOwner = {
  id: "user-minhanh",
  name: "Nguyễn Minh Anh",
  email: "minhanh.nguyen@techcorp.vn",
  isCurrentUser: false,
};

const USER_QUOC_BAO: NodeOwner = {
  id: "user-quocbao",
  name: "Trần Quốc Bảo",
  email: "bao.tran@designlab.io",
  isCurrentUser: false,
};

// Relative date helper so "Hôm nay" & "Hôm qua" always show up realistically
function getRelativeDate(hoursAgo: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - Math.floor(hoursAgo * 60));
  return d.toISOString();
}

function getDaysAgo(days: number, hour = 10, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function createInitialSeedNodes(): FileNode[] {
  return [
    // ==========================================
    // ROOT LEVEL FOLDERS (Parent: null)
    // ==========================================
    {
      id: "folder-work",
      name: "Tài liệu công việc",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 8,
      color: "#F5A524",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(30),
      updated_at: getRelativeDate(1.5), // Today
      owner: CURRENT_USER,
    },
    {
      id: "folder-design",
      name: "Hình ảnh & Đồ họa",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 6,
      color: "#8B5CF6",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(25),
      updated_at: getDaysAgo(1, 14, 20), // Yesterday
      owner: CURRENT_USER,
    },
    {
      id: "folder-personal",
      name: "Cá nhân & Gia đình",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 5,
      color: "#06B6D4",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(40),
      updated_at: getDaysAgo(3),
      owner: CURRENT_USER,
    },
    {
      id: "folder-finance",
      name: "Tài chính & Hóa đơn",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 4,
      color: "#10B981",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(60),
      updated_at: getDaysAgo(7),
      owner: CURRENT_USER,
    },
    {
      id: "folder-phone-backup",
      name: "Sao lưu điện thoại",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 3,
      color: "#3B82F6",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(15),
      updated_at: getRelativeDate(0.5),
      owner: CURRENT_USER,
    },

    // ==========================================
    // ROOT LEVEL FILES
    // ==========================================
    {
      id: "file-root-1",
      name: "Báo cáo tổng kết quý 4.pdf",
      kind: "pdf",
      size: 3840000, // 3,7 MB
      mime_type: "application/pdf",
      parent_id: null,
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(5),
      updated_at: getRelativeDate(0.8), // Today, e.g. 09:13
      owner: CURRENT_USER,
      thumbnail_seed: "pdf-report-q4",
      versions: [
        {
          id: "v2",
          versionNumber: 2,
          name: "Báo cáo tổng kết quý 4.pdf",
          size: 3840000,
          updated_at: getRelativeDate(0.8),
          updated_by: "Nguyễn Tuấn Anh",
        },
        {
          id: "v1",
          versionNumber: 1,
          name: "Báo cáo sơ bộ quý 4.pdf",
          size: 3420000,
          updated_at: getDaysAgo(2),
          updated_by: "Nguyễn Tuấn Anh",
        },
      ],
      activities: [
        {
          id: "act-1",
          action: "edited",
          description: "Đã cập nhật số liệu bảng doanh thu",
          actor: "Nguyễn Tuấn Anh",
          timestamp: getRelativeDate(0.8),
        },
        {
          id: "act-2",
          action: "created",
          description: "Tạo tệp mới",
          actor: "Nguyễn Tuấn Anh",
          timestamp: getDaysAgo(5),
        },
      ],
    },
    {
      id: "file-root-2",
      name: "Ghi chú chiến lược sản phẩm 2026.md",
      kind: "code",
      size: 14200, // 14,2 KB
      mime_type: "text/markdown",
      parent_id: null,
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(10),
      updated_at: getRelativeDate(3.2), // Today
      owner: CURRENT_USER,
      content: `# Chiến lược Sản phẩm CloudBox 2026

## 1. Định hướng cốt lõi
- Trải nghiệm lưu trữ cá nhân tinh tế, thoáng đạt và tập trung cao độ.
- Tốc độ phản hồi dưới 150ms cho mọi thao tác giao diện.
- Đồng bộ mượt mà giữa máy tính và thiết bị di động.

## 2. Kế hoạch Quý 1
- Hoàn thiện Design System với bảng màu trung tính.
- Nâng cấp bộ xem trước hình ảnh, PDF và video độ phân giải cao.
- Hỗ trợ phím tắt toàn diện cho người dùng chuyên nghiệp.`,
    },
    {
      id: "file-root-3",
      name: "Ảnh chụp màn hình kiến trúc hệ thống.png",
      kind: "image",
      size: 2740000, // 2,6 MB
      mime_type: "image/png",
      parent_id: null,
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(1, 16, 45), // Yesterday
      updated_at: getDaysAgo(1, 16, 45),
      owner: CURRENT_USER,
      thumbnail_seed: "img-arch-system",
    },
    {
      id: "file-root-4",
      name: "Kế hoạch ngân sách dự án.xlsx",
      kind: "spreadsheet",
      size: 1850000, // 1,8 MB
      mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      parent_id: null,
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(1, 11, 10), // Yesterday
      updated_at: getDaysAgo(1, 11, 10),
      owner: CURRENT_USER,
      thumbnail_seed: "sheet-budget-2026",
    },

    // ==========================================
    // LEVEL 2: INSIDE "Tài liệu công việc" (folder-work)
    // ==========================================
    {
      id: "folder-projects",
      name: "Dự án CloudBox",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-work",
      item_count: 5,
      color: "#3B82F6",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(28),
      updated_at: getRelativeDate(2),
      owner: CURRENT_USER,
    },
    {
      id: "folder-contracts",
      name: "Hợp đồng & Pháp lý",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-work",
      item_count: 3,
      color: "#10B981",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(20),
      updated_at: getDaysAgo(2),
      owner: CURRENT_USER,
    },
    {
      id: "file-work-1",
      name: "Biên bản cuộc họp ban giám đốc.docx",
      kind: "document",
      size: 840000, // 820 KB
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      parent_id: "folder-work",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(4),
      updated_at: getDaysAgo(1, 15, 0), // Yesterday
      owner: CURRENT_USER,
      thumbnail_seed: "doc-minutes-meeting",
    },
    {
      id: "file-work-2",
      name: "Đề xuất cải tiến hiệu suất Q1.pdf",
      kind: "pdf",
      size: 2150000,
      mime_type: "application/pdf",
      parent_id: "folder-work",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(6),
      updated_at: getDaysAgo(3),
      owner: CURRENT_USER,
      thumbnail_seed: "pdf-perf-proposal",
    },
    {
      id: "file-work-3",
      name: "Danh sách đối tác chiến lược.xlsx",
      kind: "spreadsheet",
      size: 1120000,
      mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      parent_id: "folder-work",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(15),
      updated_at: getDaysAgo(4),
      owner: CURRENT_USER,
      thumbnail_seed: "sheet-partners-list",
    },

    // ==========================================
    // LEVEL 3: INSIDE "Dự án CloudBox" (folder-projects)
    // ==========================================
    {
      id: "folder-design-specs",
      name: "Thiết kế & Prototype",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-projects",
      item_count: 4,
      color: "#8B5CF6",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(18),
      updated_at: getRelativeDate(4),
      owner: CURRENT_USER,
    },
    {
      id: "file-proj-1",
      name: "Kế hoạch ra mắt phiên bản 1.0.pdf",
      kind: "pdf",
      size: 4200000,
      mime_type: "application/pdf",
      parent_id: "folder-projects",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(8),
      updated_at: getRelativeDate(1.2), // Today
      owner: CURRENT_USER,
      thumbnail_seed: "pdf-launch-plan",
    },
    {
      id: "file-proj-2",
      name: "Video giới thiệu tính năng mới.mp4",
      kind: "video",
      size: 28400000, // 27,1 MB
      mime_type: "video/mp4",
      parent_id: "folder-projects",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(3),
      updated_at: getDaysAgo(1, 10, 0), // Yesterday
      owner: CURRENT_USER,
      thumbnail_seed: "video-feature-demo",
    },
    {
      id: "file-proj-3",
      name: "Cấu hình hạ tầng CloudBox.json",
      kind: "code",
      size: 8900,
      mime_type: "application/json",
      parent_id: "folder-projects",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(12),
      updated_at: getDaysAgo(5),
      owner: CURRENT_USER,
      content: `{
  "app": "CloudBox",
  "version": "1.0.0",
  "region": "ap-southeast-1",
  "storage": {
    "provider": "virtual-mock",
    "quotaGB": 200,
    "encryption": "AES-256-GCM"
  },
  "features": {
    "diacriticSearch": true,
    "virtualizedList": true,
    "dragAndDrop": true
  }
}`,
    },
    {
      id: "file-proj-4",
      name: "Gói mã nguồn giao diện v1.0.zip",
      kind: "archive",
      size: 15600000, // 14,8 MB
      mime_type: "application/zip",
      parent_id: "folder-projects",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(2),
      updated_at: getDaysAgo(2),
      owner: CURRENT_USER,
      thumbnail_seed: "zip-frontend-src",
    },

    // ==========================================
    // LEVEL 2: INSIDE "Hình ảnh & Đồ họa" (folder-design)
    // ==========================================
    {
      id: "folder-brand",
      name: "Bộ nhận diện thương hiệu",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-design",
      item_count: 4,
      color: "#EC4899",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(22),
      updated_at: getDaysAgo(2),
      owner: CURRENT_USER,
    },
    {
      id: "file-design-1",
      name: "Logo CloudBox Vector Chuẩn.svg",
      kind: "image",
      size: 48000, // 48 KB
      mime_type: "image/svg+xml",
      parent_id: "folder-design",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(14),
      updated_at: getRelativeDate(5),
      owner: CURRENT_USER,
      thumbnail_seed: "img-cloudbox-logo",
    },
    {
      id: "file-design-2",
      name: "Ảnh banner trang chủ 4K.jpg",
      kind: "image",
      size: 4850000, // 4,6 MB
      mime_type: "image/jpeg",
      parent_id: "folder-design",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(7),
      updated_at: getDaysAgo(1, 16, 0), // Yesterday
      owner: CURRENT_USER,
      thumbnail_seed: "img-hero-banner",
    },
    {
      id: "file-design-3",
      name: "Bộ icon tính năng 48x48.png",
      kind: "image",
      size: 920000,
      mime_type: "image/png",
      parent_id: "folder-design",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(9),
      updated_at: getDaysAgo(3),
      owner: CURRENT_USER,
      thumbnail_seed: "img-feature-icons",
    },
    {
      id: "file-design-4",
      name: "Bản vẽ phối cảnh văn phòng.jpg",
      kind: "image",
      size: 3650000,
      mime_type: "image/jpeg",
      parent_id: "folder-design",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(16),
      updated_at: getDaysAgo(6),
      owner: CURRENT_USER,
      thumbnail_seed: "img-office-render",
    },
    {
      id: "file-design-5",
      name: "Nhạc nền clip giới thiệu.mp3",
      kind: "audio",
      size: 5800000, // 5,5 MB
      mime_type: "audio/mpeg",
      parent_id: "folder-design",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(11),
      updated_at: getDaysAgo(4),
      owner: CURRENT_USER,
      thumbnail_seed: "audio-intro-music",
    },

    // ==========================================
    // LEVEL 2: INSIDE "Cá nhân & Gia đình" (folder-personal)
    // ==========================================
    {
      id: "file-pers-1",
      name: "Hộ chiếu & Căn cước công dân.pdf",
      kind: "pdf",
      size: 2400000,
      mime_type: "application/pdf",
      parent_id: "folder-personal",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(45),
      updated_at: getDaysAgo(15),
      owner: CURRENT_USER,
      thumbnail_seed: "pdf-id-passport",
    },
    {
      id: "file-pers-2",
      name: "Ảnh gia đình du lịch Đà Nẵng.jpg",
      kind: "image",
      size: 6100000,
      mime_type: "image/jpeg",
      parent_id: "folder-personal",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(20),
      updated_at: getDaysAgo(20),
      owner: CURRENT_USER,
      thumbnail_seed: "img-family-trip",
    },
    {
      id: "file-pers-3",
      name: "Sổ tay công thức nấu ăn.md",
      kind: "code",
      size: 22000,
      mime_type: "text/markdown",
      parent_id: "folder-personal",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(35),
      updated_at: getDaysAgo(10),
      owner: CURRENT_USER,
      content: `# Sổ tay Công thức Ẩm thực

## 1. Phở bò gia truyền
- Nước dùng hầm từ xương ống bò trong 12 tiếng.
- Gia vị thơm: hoa hồi, quế, thảo quả, gừng nướng, hành củ nướng.
- Thưởng thức kèm bánh phở tươi, hành hoa và chanh ớt tươi.`,
    },

    // ==========================================
    // LEVEL 2: INSIDE "Tài chính & Hóa đơn" (folder-finance)
    // ==========================================
    {
      id: "file-fin-1",
      name: "Hóa đơn tiền điện & nước tháng 11.pdf",
      kind: "pdf",
      size: 650000,
      mime_type: "application/pdf",
      parent_id: "folder-finance",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(18),
      updated_at: getDaysAgo(18),
      owner: CURRENT_USER,
      thumbnail_seed: "pdf-utility-bills",
    },
    {
      id: "file-fin-2",
      name: "Sao kê tài khoản ngân hàng Q3.pdf",
      kind: "pdf",
      size: 1450000,
      mime_type: "application/pdf",
      parent_id: "folder-finance",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(30),
      updated_at: getDaysAgo(30),
      owner: CURRENT_USER,
      thumbnail_seed: "pdf-bank-statement",
    },
    {
      id: "file-fin-3",
      name: "Bảng theo dõi thu chi cá nhân 2026.xlsx",
      kind: "spreadsheet",
      size: 890000,
      mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      parent_id: "folder-finance",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(40),
      updated_at: getRelativeDate(6), // Today
      owner: CURRENT_USER,
      thumbnail_seed: "sheet-expense-tracker",
    },

    // ==========================================
    // ITEMS SHARED WITH ME (Owner is other mock people)
    // ==========================================
    {
      id: "file-shared-1",
      name: "Tài liệu kỹ thuật hệ thống phân tán.pdf",
      kind: "pdf",
      size: 5120000,
      mime_type: "application/pdf",
      parent_id: null,
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(7),
      updated_at: getRelativeDate(2.5), // Today
      owner: USER_MINH_ANH,
      thumbnail_seed: "pdf-dist-systems",
    },
    {
      id: "file-shared-2",
      name: "Bộ icon giao diện UI Kit 2026.fig",
      kind: "other",
      size: 18200000, // 17,3 MB
      mime_type: "application/x-figma",
      parent_id: null,
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(4),
      updated_at: getDaysAgo(1, 13, 0), // Yesterday
      owner: USER_QUOC_BAO,
      thumbnail_seed: "other-uikit-figma",
    },
    {
      id: "file-shared-3",
      name: "Báo cáo nghiên cứu thị trường Đông Nam Á.docx",
      kind: "document",
      size: 2900000,
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      parent_id: null,
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(10),
      updated_at: getDaysAgo(3),
      owner: USER_MINH_ANH,
      thumbnail_seed: "doc-market-research",
    },

    // ==========================================
    // PHONE BACKUP FOLDERS & FILES
    // ==========================================
    {
      id: "folder-camera",
      name: "Ảnh Camera (DCIM)",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-phone-backup",
      item_count: 2,
      color: "#10B981",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(15),
      updated_at: getRelativeDate(0.5),
      owner: CURRENT_USER,
    },
    {
      id: "folder-screenshots",
      name: "Ảnh chụp màn hình",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-phone-backup",
      item_count: 1,
      color: "#8B5CF6",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(15),
      updated_at: getRelativeDate(1.2),
      owner: CURRENT_USER,
    },
    {
      id: "folder-zalo",
      name: "Tệp Zalo & Tin nhắn",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-phone-backup",
      item_count: 1,
      color: "#06B6D4",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(10),
      updated_at: getDaysAgo(1),
      owner: CURRENT_USER,
    },
    {
      id: "file-phone-img-1",
      name: "IMG_20261122_142015.jpg",
      kind: "image",
      size: 4400000, // 4,2 MB
      mime_type: "image/jpeg",
      parent_id: "folder-camera",
      is_starred: true,
      is_trashed: false,
      created_at: getRelativeDate(1),
      updated_at: getRelativeDate(1),
      owner: CURRENT_USER,
      thumbnail_seed: "camera-photo-sun",
    },
    {
      id: "file-phone-vid-1",
      name: "VID_20261122_110530.mp4",
      kind: "video",
      size: 19400000, // 18,5 MB
      mime_type: "video/mp4",
      parent_id: "folder-camera",
      is_starred: false,
      is_trashed: false,
      created_at: getRelativeDate(4),
      updated_at: getRelativeDate(4),
      owner: CURRENT_USER,
      thumbnail_seed: "camera-video-park",
    },
    {
      id: "file-phone-screen-1",
      name: "ScreenShot_2026-11-22_0915.png",
      kind: "image",
      size: 1850000, // 1,8 MB
      mime_type: "image/png",
      parent_id: "folder-screenshots",
      is_starred: false,
      is_trashed: false,
      created_at: getRelativeDate(6),
      updated_at: getRelativeDate(6),
      owner: CURRENT_USER,
      thumbnail_seed: "screenshot-mobile",
    },
    {
      id: "file-phone-zalo-1",
      name: "Tai_lieu_hop_noi_bo.docx",
      kind: "document",
      size: 1250000, // 1,2 MB
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      parent_id: "folder-zalo",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(1),
      updated_at: getDaysAgo(1),
      owner: CURRENT_USER,
      thumbnail_seed: "zalo-meeting-doc",
    },

    // ==========================================
    // ITEMS IN TRASH (is_trashed: true)
    // ==========================================
    {
      id: "file-trash-1",
      name: "Bản nháp kế hoạch cũ (bỏ).docx",
      kind: "document",
      size: 420000,
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      parent_id: null,
      is_starred: false,
      is_trashed: true,
      trashed_at: getDaysAgo(1, 9, 0),
      created_at: getDaysAgo(20),
      updated_at: getDaysAgo(5),
      owner: CURRENT_USER,
      thumbnail_seed: "doc-draft-old",
    },
    {
      id: "file-trash-2",
      name: "Ảnh chụp màn hình lỗi giao diện cũ.png",
      kind: "image",
      size: 1350000,
      mime_type: "image/png",
      parent_id: null,
      is_starred: false,
      is_trashed: true,
      trashed_at: getDaysAgo(3),
      created_at: getDaysAgo(12),
      updated_at: getDaysAgo(12),
      owner: CURRENT_USER,
      thumbnail_seed: "img-old-bug",
    },
    {
      id: "folder-trash-3",
      name: "Thư mục dự án đã hủy",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 2,
      color: "#64748B",
      is_starred: false,
      is_trashed: true,
      trashed_at: getDaysAgo(4),
      created_at: getDaysAgo(50),
      updated_at: getDaysAgo(25),
      owner: CURRENT_USER,
    },
  ];
}
