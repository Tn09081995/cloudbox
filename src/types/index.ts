import { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type FileRecord = Database["public"]["Tables"]["files"]["Row"];
export type ShareLink = Database["public"]["Tables"]["share_links"]["Row"];

export interface ShareLinkWithFile extends ShareLink {
  files: FileRecord;
}

export type ViewMode = "grid" | "list";
export type SortField = "name" | "created_at" | "size";
export type SortOrder = "asc" | "desc";

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "idle" | "uploading" | "completed" | "error" | "cancelled";
  errorMessage?: string;
  abortController?: AbortController;
}
