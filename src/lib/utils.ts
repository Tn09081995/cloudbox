import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes into readable Vietnamese string: B, KB, MB, GB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format ISO date string into Vietnamese locale format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Sanitize filename to prevent directory traversal and remove problematic characters
 */
export function sanitizeFileName(name: string): string {
  // Remove path separators and illegal characters
  const clean = name
    .replace(/[/\\]/g, "")
    .replace(/[\x00-\x1f\x80-\x9f]/g, "")
    .trim();

  // Ensure it's not empty and reasonable length
  return clean.slice(0, 255) || "untitled";
}

/**
 * Get category icon / preview type for MIME type or file extension
 */
export type FileCategory = "image" | "pdf" | "video" | "audio" | "text" | "archive" | "code" | "document" | "other";

export function getFileCategory(mimeType: string, fileName = ""): FileCategory {
  const mime = mimeType.toLowerCase();
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) {
    return "image";
  }
  if (mime === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  if (mime.startsWith("video/") || ["mp4", "webm", "mkv", "mov", "avi"].includes(ext)) {
    return "video";
  }
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(ext)) {
    return "audio";
  }
  if (
    mime.startsWith("text/") ||
    ["txt", "md", "csv", "tsv", "log", "rtf"].includes(ext)
  ) {
    return "text";
  }
  if (
    ["json", "js", "ts", "jsx", "tsx", "html", "css", "scss", "py", "sql", "sh", "bat", "xml", "yaml", "yml"].includes(ext)
  ) {
    return "code";
  }
  if (
    ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext) ||
    mime.includes("zip") ||
    mime.includes("compressed") ||
    mime.includes("tar")
  ) {
    return "archive";
  }
  if (
    ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp"].includes(ext) ||
    mime.includes("officedocument") ||
    mime.includes("msword") ||
    mime.includes("ms-excel")
  ) {
    return "document";
  }

  return "other";
}
