import { Folder, FileRecord } from "@/types";

const INITIAL_FOLDERS: Folder[] = [
  {
    id: "demo-folder-1",
    owner_id: "demo-user",
    parent_id: null,
    name: "Tài liệu công việc",
    deleted_at: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "demo-folder-2",
    owner_id: "demo-user",
    parent_id: null,
    name: "Hình ảnh & Đồ họa",
    deleted_at: null,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "demo-folder-3",
    owner_id: "demo-user",
    parent_id: null,
    name: "Dự án CloudBox",
    deleted_at: null,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

const INITIAL_FILES: FileRecord[] = [
  {
    id: "demo-file-1",
    owner_id: "demo-user",
    folder_id: null,
    name: "Báo cáo tổng kết dự án.pdf",
    size: 1548576, // 1.5 MB
    mime_type: "application/pdf",
    storage_path: "demo/bao_cao.pdf",
    deleted_at: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "demo-file-2",
    owner_id: "demo-user",
    folder_id: null,
    name: "Giao_dien_CloudBox.png",
    size: 2840000, // 2.8 MB
    mime_type: "image/png",
    storage_path: "demo/giao_dien.png",
    deleted_at: null,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "demo-file-3",
    owner_id: "demo-user",
    folder_id: null,
    name: "Ghi chú ý tưởng phát triển.txt",
    size: 16400, // 16 KB
    mime_type: "text/plain",
    storage_path: "demo/ghi_chu.txt",
    deleted_at: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "demo-file-4",
    owner_id: "demo-user",
    folder_id: null,
    name: "Video_huong_dan_su_dung.mp4",
    size: 14500000, // 14.5 MB
    mime_type: "video/mp4",
    storage_path: "demo/video.mp4",
    deleted_at: null,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export function getDemoFolders(): Folder[] {
  if (typeof window === "undefined") return INITIAL_FOLDERS;
  try {
    const raw = localStorage.getItem("cloudbox_demo_folders");
    if (!raw) {
      localStorage.setItem("cloudbox_demo_folders", JSON.stringify(INITIAL_FOLDERS));
      return INITIAL_FOLDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FOLDERS;
  }
}

export function saveDemoFolders(folders: Folder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cloudbox_demo_folders", JSON.stringify(folders));
  } catch {
    // Ignore
  }
}

export function getDemoFiles(): FileRecord[] {
  if (typeof window === "undefined") return INITIAL_FILES;
  try {
    const raw = localStorage.getItem("cloudbox_demo_files");
    if (!raw) {
      localStorage.setItem("cloudbox_demo_files", JSON.stringify(INITIAL_FILES));
      return INITIAL_FILES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FILES;
  }
}

export function saveDemoFiles(files: FileRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cloudbox_demo_files", JSON.stringify(files));
  } catch {
    // Ignore
  }
}
