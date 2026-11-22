export type FileKind =
  | "folder"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "pdf"
  | "spreadsheet"
  | "archive"
  | "code"
  | "other";

export interface FileKindConfig {
  kind: FileKind;
  label: string;
  color: string; // Hex icon color
  bgTile: string; // 12% tinted bg
}

export const FILE_KIND_CONFIGS: Record<FileKind, FileKindConfig> = {
  folder: {
    kind: "folder",
    label: "Thư mục",
    color: "#F5A524",
    bgTile: "rgba(245, 165, 36, 0.12)",
  },
  image: {
    kind: "image",
    label: "Hình ảnh",
    color: "#3B82F6",
    bgTile: "rgba(59, 130, 246, 0.12)",
  },
  video: {
    kind: "video",
    label: "Video",
    color: "#8B5CF6",
    bgTile: "rgba(139, 92, 246, 0.12)",
  },
  audio: {
    kind: "audio",
    label: "Âm thanh",
    color: "#EC4899",
    bgTile: "rgba(236, 72, 153, 0.12)",
  },
  document: {
    kind: "document",
    label: "Tài liệu",
    color: "#10B981",
    bgTile: "rgba(16, 185, 129, 0.12)",
  },
  pdf: {
    kind: "pdf",
    label: "Tệp PDF",
    color: "#EF4444",
    bgTile: "rgba(239, 68, 68, 0.12)",
  },
  spreadsheet: {
    kind: "spreadsheet",
    label: "Bảng tính",
    color: "#22C55E",
    bgTile: "rgba(34, 197, 94, 0.12)",
  },
  archive: {
    kind: "archive",
    label: "Tệp nén",
    color: "#F59E0B",
    bgTile: "rgba(245, 158, 11, 0.12)",
  },
  code: {
    kind: "code",
    label: "Mã nguồn",
    color: "#06B6D4",
    bgTile: "rgba(6, 182, 212, 0.12)",
  },
  other: {
    kind: "other",
    label: "Khác",
    color: "#64748B",
    bgTile: "rgba(100, 116, 139, 0.12)",
  },
};

export const FOLDER_COLOR_SWATCHES = [
  { name: "Hổ phách (Mặc định)", hex: "#F5A524" },
  { name: "Xanh dương", hex: "#3B82F6" },
  { name: "Tím thanh lịch", hex: "#8B5CF6" },
  { name: "Hồng nữ tính", hex: "#EC4899" },
  { name: "Xanh ngọc lục bảo", hex: "#10B981" },
  { name: "Đỏ nổi bật", hex: "#EF4444" },
  { name: "Xanh lam Cyan", hex: "#06B6D4" },
  { name: "Xám than chì", hex: "#64748B" },
];

export function getFileKind(mimeType: string, fileName: string): FileKind {
  if (mimeType === "application/vnd.cloudbox.folder" || mimeType.includes("folder")) {
    return "folder";
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "avif"].includes(ext)) {
    return "image";
  }

  if (mimeType.startsWith("video/") || ["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) {
    return "video";
  }

  if (mimeType.startsWith("audio/") || ["mp3", "wav", "m4a", "flac", "aac", "ogg"].includes(ext)) {
    return "audio";
  }

  if (mimeType === "application/pdf" || ext === "pdf") {
    return "pdf";
  }

  if (
    mimeType.includes("sheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv") ||
    ["xlsx", "xls", "csv", "tsv"].includes(ext)
  ) {
    return "spreadsheet";
  }

  if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    ["doc", "docx", "odt", "rtf"].includes(ext)
  ) {
    return "document";
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar") ||
    mimeType.includes("7z") ||
    ["zip", "rar", "tar", "gz", "7z"].includes(ext)
  ) {
    return "archive";
  }

  if (
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("json") ||
    mimeType.includes("html") ||
    mimeType.includes("css") ||
    mimeType.includes("python") ||
    ["js", "jsx", "ts", "tsx", "html", "css", "json", "py", "sql", "sh", "yml", "yaml", "md"].includes(ext)
  ) {
    return "code";
  }

  return "other";
}
