import { FileKind } from "@/lib/utils/file-types";

export interface NodeOwner {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isCurrentUser?: boolean;
}

export interface NodeVersion {
  id: string;
  versionNumber: number;
  name: string;
  size: number;
  updated_at: string;
  updated_by: string;
}

export interface NodeActivity {
  id: string;
  action: "created" | "edited" | "renamed" | "moved" | "shared" | "trashed";
  description: string;
  actor: string;
  timestamp: string;
}

export interface ShareSettings {
  isPublic: boolean;
  accessLevel: "view" | "download";
  hasPassword?: boolean;
  password?: string;
  expiresAt?: string | null;
  sharedWith: { email: string; name: string; role: "viewer" | "editor" }[];
}

export interface FileNode {
  id: string;
  name: string;
  kind: FileKind;
  size: number; // in bytes (0 for folders)
  mime_type: string;
  parent_id: string | null; // null represents Root / Tệp của tôi
  item_count?: number; // for folders: number of children
  color?: string; // for folders: custom hex color
  is_starred: boolean;
  is_trashed: boolean;
  trashed_at?: string | null;
  created_at: string; // ISO date
  updated_at: string; // ISO date
  owner: NodeOwner;
  content?: string; // for text / code files
  thumbnail_seed?: string; // seed for procedural SVG rendering
  share_settings?: ShareSettings;
  versions?: NodeVersion[];
  activities?: NodeActivity[];
}

export interface BreadcrumbSegment {
  id: string | null;
  name: string;
}

export interface StorageUsage {
  usedBytes: number;
  totalBytes: number;
  breakdown: Record<FileKind, number>;
}
