import { format, isToday, isYesterday } from "date-fns";
import { vi as viLocale } from "date-fns/locale";

/**
 * Format bytes to human readable string with Vietnamese decimal comma.
 * E.g., 14500000 -> "13,8 MB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  if (!bytes || isNaN(bytes)) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = (bytes / Math.pow(k, i)).toFixed(dm);

  // Replace dot with comma for Vietnamese notation
  const formattedValue = value.replace(".", ",");
  return `${formattedValue} ${sizes[i]}`;
}

/**
 * Format relative date:
 * - Today: "Hôm nay, 09:13"
 * - Yesterday: "Hôm qua" (or "Hôm qua, 14:20")
 * - Within this year: "21 thg 11, 2026"
 */
export function formatRelativeDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  if (isToday(d)) {
    return `Hôm nay, ${format(d, "HH:mm")}`;
  }

  if (isYesterday(d)) {
    return `Hôm qua, ${format(d, "HH:mm")}`;
  }

  return format(d, "d 'thg' M, yyyy", { locale: viLocale });
}

/**
 * Short date formatting for tables
 */
export function formatShortDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  if (isToday(d)) {
    return `Hôm nay, ${format(d, "HH:mm")}`;
  }

  if (isYesterday(d)) {
    return "Hôm qua";
  }

  return format(d, "d 'thg' M, yyyy", { locale: viLocale });
}

/**
 * Remove Vietnamese accents/diacritics for search
 * E.g., "Tài liệu" -> "tai lieu"
 */
export function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
