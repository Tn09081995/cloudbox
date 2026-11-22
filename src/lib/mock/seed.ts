import { FileNode, NodeOwner } from "./types";

const CURRENT_USER: NodeOwner = {
  id: "user-me",
  name: "Nguyễn Tuấn Anh",
  email: "tuananh@cloudbox.io",
  isCurrentUser: true,
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
      item_count: 0,
      color: "#F5A524",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(30),
      updated_at: getRelativeDate(1.5),
      owner: CURRENT_USER,
    },
    {
      id: "folder-design",
      name: "Hình ảnh & Đồ họa",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 0,
      color: "#8B5CF6",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(25),
      updated_at: getDaysAgo(1, 14, 20),
      owner: CURRENT_USER,
    },
    {
      id: "folder-personal",
      name: "Cá nhân & Gia đình",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 0,
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
      item_count: 0,
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
      item_count: 0,
      color: "#3B82F6",
      is_starred: true,
      is_trashed: false,
      created_at: getDaysAgo(15),
      updated_at: getRelativeDate(0.5),
      owner: CURRENT_USER,
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
      item_count: 0,
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
      item_count: 0,
      color: "#10B981",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(20),
      updated_at: getDaysAgo(2),
      owner: CURRENT_USER,
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
      item_count: 0,
      color: "#EC4899",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(18),
      updated_at: getDaysAgo(4),
      owner: CURRENT_USER,
    },
    {
      id: "folder-design-specs",
      name: "Thiết kế & Prototype",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-design",
      item_count: 0,
      color: "#8B5CF6",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(14),
      updated_at: getDaysAgo(2),
      owner: CURRENT_USER,
    },

    // ==========================================
    // LEVEL 2: INSIDE "Sao lưu điện thoại" (folder-phone-backup)
    // ==========================================
    {
      id: "folder-camera",
      name: "Ảnh Camera (DCIM)",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-phone-backup",
      item_count: 0,
      color: "#10B981",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(15),
      updated_at: getRelativeDate(1),
      owner: CURRENT_USER,
    },
    {
      id: "folder-screenshots",
      name: "Ảnh chụp màn hình",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-phone-backup",
      item_count: 0,
      color: "#8B5CF6",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(12),
      updated_at: getRelativeDate(2),
      owner: CURRENT_USER,
    },
    {
      id: "folder-zalo",
      name: "Tệp Zalo & Tin nhắn",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: "folder-phone-backup",
      item_count: 0,
      color: "#06B6D4",
      is_starred: false,
      is_trashed: false,
      created_at: getDaysAgo(10),
      updated_at: getDaysAgo(1),
      owner: CURRENT_USER,
    },

    // ==========================================
    // TRASHED FOLDER SAMPLE
    // ==========================================
    {
      id: "folder-trash-3",
      name: "Thư mục dự án đã hủy",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: null,
      item_count: 0,
      color: "#64748B",
      is_starred: false,
      is_trashed: true,
      created_at: getDaysAgo(45),
      updated_at: getDaysAgo(8),
      owner: CURRENT_USER,
    },
  ];
}
