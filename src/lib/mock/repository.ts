import { FileNode, BreadcrumbSegment, StorageUsage, ShareSettings } from "./types";
import { createInitialSeedNodes } from "./seed";
import { removeDiacritics } from "@/lib/utils/formatters";
import { FileKind, getFileKind } from "@/lib/utils/file-types";

const STORAGE_KEY = "cloudbox_mock_nodes_v2";

const DELETED_SAMPLE_IDS = new Set([
  "file-root-1",
  "file-root-2",
  "file-root-3",
  "file-root-4",
  "file-shared-1",
  "file-shared-2",
  "file-shared-3",
]);

export interface FilesRepository {
  listFolder(folderId: string | null): Promise<FileNode[]>;
  getBreadcrumbs(folderId: string | null): Promise<BreadcrumbSegment[]>;
  getNode(id: string): Promise<FileNode | null>;
  getRecentFiles(): Promise<FileNode[]>;
  getStarredFiles(): Promise<FileNode[]>;
  getSharedFiles(): Promise<FileNode[]>;
  getTrashFiles(): Promise<FileNode[]>;
  search(query: string): Promise<FileNode[]>;
  getStorageUsage(): Promise<StorageUsage>;

  createFolder(name: string, parentId: string | null, color?: string): Promise<FileNode>;
  createTextFile(name: string, content: string, parentId: string | null): Promise<FileNode>;
  createUploadedFile(
    file: { name: string; size: number; type?: string },
    parentId: string | null
  ): Promise<FileNode>;
  rename(id: string, newName: string): Promise<FileNode>;
  move(ids: string[], targetFolderId: string | null): Promise<void>;
  copy(ids: string[], targetFolderId: string | null): Promise<void>;
  trash(ids: string[]): Promise<void>;
  restore(ids: string[]): Promise<void>;
  deletePermanently(ids: string[]): Promise<void>;
  emptyTrash(): Promise<void>;
  toggleStar(id: string): Promise<boolean>;
  updateFolderColor(id: string, color: string): Promise<void>;
  updateShareSettings(id: string, settings: ShareSettings): Promise<ShareSettings>;
  resetToSeed(): Promise<void>;
}

// Simulated network delay (150ms - 300ms)
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export class LocalFilesRepository implements FilesRepository {
  private getNodes(): FileNode[] {
    if (typeof window === "undefined") {
      return createInitialSeedNodes().filter((n) => !DELETED_SAMPLE_IDS.has(n.id));
    }

    try {
      // Clean legacy v1 storage if present
      localStorage.removeItem("cloudbox_mock_nodes_v1");

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FileNode[];
        const cleaned = parsed.filter((n) => !DELETED_SAMPLE_IDS.has(n.id));
        if (cleaned.length !== parsed.length) {
          this.saveNodes(cleaned);
        }
        return cleaned;
      }
    } catch {}

    const seed = createInitialSeedNodes().filter((n) => !DELETED_SAMPLE_IDS.has(n.id));
    this.saveNodes(seed);
    return seed;
  }

  private saveNodes(nodes: FileNode[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    } catch {}
  }

  async listFolder(folderId: string | null): Promise<FileNode[]> {
    await delay(180);
    const nodes = this.getNodes();
    return nodes.filter(
      (node) => !node.is_trashed && node.parent_id === folderId
    );
  }

  async getBreadcrumbs(folderId: string | null): Promise<BreadcrumbSegment[]> {
    await delay(50);
    const crumbs: BreadcrumbSegment[] = [{ id: null, name: "Tệp của tôi" }];
    if (!folderId) return crumbs;

    const nodes = this.getNodes();
    const trail: BreadcrumbSegment[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = nodes.find((n) => n.id === currentId);
      if (!folder) break;
      trail.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parent_id;
    }

    return [...crumbs, ...trail];
  }

  async getNode(id: string): Promise<FileNode | null> {
    await delay(100);
    const nodes = this.getNodes();
    return nodes.find((n) => n.id === id) || null;
  }

  async getRecentFiles(): Promise<FileNode[]> {
    await delay(180);
    const nodes = this.getNodes();
    return nodes
      .filter((node) => !node.is_trashed && node.kind !== "folder")
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 20);
  }

  async getStarredFiles(): Promise<FileNode[]> {
    await delay(180);
    const nodes = this.getNodes();
    return nodes.filter((node) => !node.is_trashed && node.is_starred);
  }

  async getSharedFiles(): Promise<FileNode[]> {
    await delay(180);
    const nodes = this.getNodes();
    return nodes.filter(
      (node) => !node.is_trashed && !node.owner.isCurrentUser
    );
  }

  async getTrashFiles(): Promise<FileNode[]> {
    await delay(180);
    const nodes = this.getNodes();
    return nodes.filter((node) => node.is_trashed);
  }

  async search(query: string): Promise<FileNode[]> {
    await delay(150);
    const cleanQuery = removeDiacritics(query);
    if (!cleanQuery) return [];

    const nodes = this.getNodes();
    return nodes.filter((node) => {
      if (node.is_trashed) return false;
      const cleanName = removeDiacritics(node.name);
      return cleanName.includes(cleanQuery);
    });
  }

  async getStorageUsage(): Promise<StorageUsage> {
    await delay(100);
    const nodes = this.getNodes();
    const activeFiles = nodes.filter((n) => !n.is_trashed && n.kind !== "folder");

    let usedBytes = 0;
    const breakdown: Record<FileKind, number> = {
      folder: 0,
      image: 0,
      video: 0,
      audio: 0,
      document: 0,
      pdf: 0,
      spreadsheet: 0,
      archive: 0,
      code: 0,
      other: 0,
    };

    activeFiles.forEach((file) => {
      usedBytes += file.size;
      breakdown[file.kind] = (breakdown[file.kind] || 0) + file.size;
    });

    return {
      usedBytes,
      totalBytes: 200 * 1024 * 1024 * 1024, // 200 GB
      breakdown,
    };
  }

  async createFolder(
    name: string,
    parentId: string | null,
    color = "#F5A524"
  ): Promise<FileNode> {
    await delay(200);
    const nodes = this.getNodes();
    const now = new Date().toISOString();

    const newFolder: FileNode = {
      id: `folder-${Date.now()}`,
      name: name.trim() || "Thư mục không tên",
      kind: "folder",
      size: 0,
      mime_type: "application/vnd.cloudbox.folder",
      parent_id: parentId,
      item_count: 0,
      color,
      is_starred: false,
      is_trashed: false,
      created_at: now,
      updated_at: now,
      owner: {
        id: "user-me",
        name: "Nguyễn Tuấn Anh",
        email: "tuananh@cloudbox.io",
        isCurrentUser: true,
      },
      activities: [
        {
          id: `act-${Date.now()}`,
          action: "created",
          description: "Tạo thư mục mới",
          actor: "Nguyễn Tuấn Anh",
          timestamp: now,
        },
      ],
    };

    this.saveNodes([newFolder, ...nodes]);
    return newFolder;
  }

  async createTextFile(
    name: string,
    content: string,
    parentId: string | null
  ): Promise<FileNode> {
    await delay(200);
    const nodes = this.getNodes();
    const now = new Date().toISOString();
    const safeName = name.endsWith(".txt") || name.endsWith(".md") ? name : `${name}.txt`;

    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      name: safeName,
      kind: safeName.endsWith(".md") ? "code" : "document",
      size: new Blob([content]).size,
      mime_type: "text/plain",
      parent_id: parentId,
      is_starred: false,
      is_trashed: false,
      created_at: now,
      updated_at: now,
      owner: {
        id: "user-me",
        name: "Nguyễn Tuấn Anh",
        email: "tuananh@cloudbox.io",
        isCurrentUser: true,
      },
      content,
      activities: [
        {
          id: `act-${Date.now()}`,
          action: "created",
          description: "Tạo tệp văn bản mới",
          actor: "Nguyễn Tuấn Anh",
          timestamp: now,
        },
      ],
    };

    this.saveNodes([newFile, ...nodes]);
    return newFile;
  }

  async createUploadedFile(
    file: { name: string; size: number; type?: string },
    parentId: string | null
  ): Promise<FileNode> {
    await delay(100);
    const nodes = this.getNodes();
    const now = new Date().toISOString();
    const kind = getFileKind(file.type || "", file.name);

    const newFile: FileNode = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      kind,
      size: file.size,
      mime_type: file.type || "application/octet-stream",
      parent_id: parentId,
      is_starred: false,
      is_trashed: false,
      created_at: now,
      updated_at: now,
      owner: {
        id: "user-me",
        name: "Người dùng",
        email: "user@cloudbox.vn",
        isCurrentUser: true,
      },
      thumbnail_seed: `upload-${Date.now()}`,
      activities: [
        {
          id: `act-${Date.now()}`,
          action: "created",
          description: "Đã tải lên tệp tin mới",
          actor: "Bạn",
          timestamp: now,
        },
      ],
    };

    this.saveNodes([newFile, ...nodes]);
    return newFile;
  }

  async rename(id: string, newName: string): Promise<FileNode> {
    await delay(180);
    const nodes = this.getNodes();
    const index = nodes.findIndex((n) => n.id === id);
    if (index === -1) throw new Error("Không tìm thấy tệp hoặc thư mục");

    const now = new Date().toISOString();
    const updated = {
      ...nodes[index],
      name: newName.trim(),
      updated_at: now,
      activities: [
        ...(nodes[index].activities || []),
        {
          id: `act-${Date.now()}`,
          action: "renamed" as const,
          description: `Đổi tên thành "${newName.trim()}"`,
          actor: "Nguyễn Tuấn Anh",
          timestamp: now,
        },
      ],
    };

    nodes[index] = updated;
    this.saveNodes(nodes);
    return updated;
  }

  async move(ids: string[], targetFolderId: string | null): Promise<void> {
    await delay(200);
    const nodes = this.getNodes();
    const now = new Date().toISOString();

    const updatedNodes = nodes.map((n) => {
      if (ids.includes(n.id)) {
        return {
          ...n,
          parent_id: targetFolderId,
          updated_at: now,
          activities: [
            ...(n.activities || []),
            {
              id: `act-${Date.now()}`,
              action: "moved" as const,
              description: "Di chuyển tệp sang vị trí mới",
              actor: "Nguyễn Tuấn Anh",
              timestamp: now,
            },
          ],
        };
      }
      return n;
    });

    this.saveNodes(updatedNodes);
  }

  async copy(ids: string[], targetFolderId: string | null): Promise<void> {
    await delay(250);
    const nodes = this.getNodes();
    const now = new Date().toISOString();
    const copies: FileNode[] = [];

    ids.forEach((id) => {
      const original = nodes.find((n) => n.id === id);
      if (original) {
        copies.push({
          ...original,
          id: `copy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: `Bản sao của ${original.name}`,
          parent_id: targetFolderId,
          created_at: now,
          updated_at: now,
        });
      }
    });

    this.saveNodes([...copies, ...nodes]);
  }

  async trash(ids: string[]): Promise<void> {
    await delay(180);
    const nodes = this.getNodes();
    const now = new Date().toISOString();

    const updated = nodes.map((n) => {
      if (ids.includes(n.id)) {
        return {
          ...n,
          is_trashed: true,
          trashed_at: now,
        };
      }
      return n;
    });

    this.saveNodes(updated);
  }

  async restore(ids: string[]): Promise<void> {
    await delay(180);
    const nodes = this.getNodes();

    const updated = nodes.map((n) => {
      if (ids.includes(n.id)) {
        return {
          ...n,
          is_trashed: false,
          trashed_at: null,
        };
      }
      return n;
    });

    this.saveNodes(updated);
  }

  async deletePermanently(ids: string[]): Promise<void> {
    await delay(200);
    const nodes = this.getNodes();
    const filtered = nodes.filter((n) => !ids.includes(n.id));
    this.saveNodes(filtered);
  }

  async emptyTrash(): Promise<void> {
    await delay(250);
    const nodes = this.getNodes();
    const filtered = nodes.filter((n) => !n.is_trashed);
    this.saveNodes(filtered);
  }

  async toggleStar(id: string): Promise<boolean> {
    await delay(100);
    const nodes = this.getNodes();
    const node = nodes.find((n) => n.id === id);
    if (!node) return false;

    node.is_starred = !node.is_starred;
    this.saveNodes(nodes);
    return node.is_starred;
  }

  async updateFolderColor(id: string, color: string): Promise<void> {
    await delay(120);
    const nodes = this.getNodes();
    const node = nodes.find((n) => n.id === id);
    if (node && node.kind === "folder") {
      node.color = color;
      this.saveNodes(nodes);
    }
  }

  async updateShareSettings(
    id: string,
    settings: ShareSettings
  ): Promise<ShareSettings> {
    await delay(180);
    const nodes = this.getNodes();
    const node = nodes.find((n) => n.id === id);
    if (node) {
      node.share_settings = settings;
      this.saveNodes(nodes);
    }
    return settings;
  }

  async resetToSeed(): Promise<void> {
    await delay(200);
    const seed = createInitialSeedNodes();
    this.saveNodes(seed);
  }
}

export const repository = new LocalFilesRepository();
