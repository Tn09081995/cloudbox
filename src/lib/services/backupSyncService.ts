import { BackupDevice, AutoBackupConfig, BackupSyncLog } from "@/types/backup";
import { FileNode } from "@/lib/mock/types";
import { formatBytes } from "@/lib/utils/formatters";
import { toast } from "sonner";

export const DEFAULT_BACKUP_DEVICES: BackupDevice[] = [
  {
    id: "dev-iphone-16",
    name: "iPhone cá nhân",
    model: "iPhone 16 Pro Max",
    os: "iOS 18.2",
    type: "ios",
    isPrimary: true,
    status: "connected",
    batteryLevel: 92,
    network: "Wi-Fi 5G",
    storageUsed: "128/256 GB",
    syncedStats: {
      photos: 0,
      videos: 2,
      sizeString: "112 MB",
      lastSync: "Vừa xong",
    },
  },
  {
    id: "dev-samsung-s24",
    name: "Samsung Galaxy",
    model: "Samsung Galaxy S24 Ultra",
    os: "Android 14 (One UI 6.1)",
    type: "android",
    isPrimary: false,
    status: "idle",
    batteryLevel: 88,
    network: "Wi-Fi Văn phòng",
    storageUsed: "142/512 GB",
    syncedStats: {
      photos: 0,
      videos: 1,
      sizeString: "48 MB",
      lastSync: "Vừa xong",
    },
  },
];

export const DEFAULT_AUTO_BACKUP_CONFIG: AutoBackupConfig = {
  autoBackupOnWebChange: true, // Tự động cập nhật sao lưu khi web thay đổi
  autoBackupPhotos: true,
  wifiOnly: true,
  originalQuality: true,
  appFolders: true,
  freeUpSpace: false,
};

const STORAGE_KEYS = {
  DEVICES: "cloudbox_backup_devices_v1",
  CONFIG: "cloudbox_auto_backup_config_v1",
  HISTORY: "cloudbox_backup_sync_history_v1",
  NODES: "cloudbox_material_nodes_v1",
};

let debounceTimer: NodeJS.Timeout | null = null;
let lastToastTime = 0;

export class BackupSyncService {
  /**
   * Get current auto backup configuration
   */
  static getConfig(): AutoBackupConfig {
    if (typeof window === "undefined") return DEFAULT_AUTO_BACKUP_CONFIG;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (stored) {
        return { ...DEFAULT_AUTO_BACKUP_CONFIG, ...JSON.parse(stored) };
      }
    } catch {}
    return DEFAULT_AUTO_BACKUP_CONFIG;
  }

  /**
   * Update auto backup configuration
   */
  static saveConfig(updates: Partial<AutoBackupConfig>): AutoBackupConfig {
    const current = this.getConfig();
    const updated = { ...current, ...updates };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent("cloudbox:auto-backup-config-changed", { detail: updated })
        );
      } catch {}
    }
    return updated;
  }

  /**
   * Get linked devices from localStorage
   */
  static getDevices(): BackupDevice[] {
    if (typeof window === "undefined") return DEFAULT_BACKUP_DEVICES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
      if (stored) {
        return JSON.parse(stored) as BackupDevice[];
      } else {
        localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(DEFAULT_BACKUP_DEVICES));
        return DEFAULT_BACKUP_DEVICES;
      }
    } catch {}
    return DEFAULT_BACKUP_DEVICES;
  }

  /**
   * Save linked devices to localStorage
   */
  static saveDevices(devices: BackupDevice[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
      window.dispatchEvent(
        new CustomEvent("cloudbox:backup-devices-updated", { detail: devices })
      );
    } catch {}
  }

  /**
   * Get sync history logs
   */
  static getSyncHistory(): BackupSyncLog[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (stored) {
        return JSON.parse(stored) as BackupSyncLog[];
      }
    } catch {}
    return [];
  }

  /**
   * Calculate live active file statistics from web storage
   */
  static getLiveFileStats(): {
    photosCount: number;
    videosCount: number;
    documentsCount: number;
    totalBytes: number;
    totalSizeString: string;
  } {
    if (typeof window === "undefined") {
      return {
        photosCount: 0,
        videosCount: 2,
        documentsCount: 15,
        totalBytes: 1024 * 1024 * 150,
        totalSizeString: "150 MB",
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NODES);
      if (stored) {
        const nodes = JSON.parse(stored) as FileNode[];
        const activeFiles = nodes.filter(
          (n) => !n.is_trashed && !n.is_locked && n.kind !== "folder"
        );

        let photos = 0;
        let videos = 0;
        let docs = 0;
        let totalBytes = 0;

        for (const f of activeFiles) {
          totalBytes += f.size || 0;
          if (
            f.kind === "image" ||
            (f.mime_type && f.mime_type.startsWith("image/")) ||
            /\.(jpe?g|png|webp|gif|bmp|tiff|svg)$/i.test(f.name)
          ) {
            photos++;
          } else if (f.kind === "video" || (f.mime_type && f.mime_type.startsWith("video/"))) {
            videos++;
          } else {
            docs++;
          }
        }

        return {
          photosCount: photos,
          videosCount: videos,
          documentsCount: docs,
          totalBytes,
          totalSizeString: formatBytes(totalBytes),
        };
      }
    } catch {}

    return {
      photosCount: 0,
      videosCount: 2,
      documentsCount: 15,
      totalBytes: 1024 * 1024 * 150,
      totalSizeString: "150 MB",
    };
  }

  /**
   * Main function: Automatically trigger backup sync when web changes
   */
  static triggerAutoBackupSync(options?: {
    reason?: string;
    changeType?: "upload" | "delete" | "edit" | "sync" | "web_change";
    silent?: boolean;
    force?: boolean;
  }): Promise<{
    syncedDevices: number;
    photosCount: number;
    videosCount: number;
    documentsCount: number;
    totalSize: string;
  }> {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve({
          syncedDevices: 0,
          photosCount: 0,
          videosCount: 0,
          documentsCount: 0,
          totalSize: "0 B",
        });
        return;
      }

      const config = this.getConfig();
      if (!config.autoBackupOnWebChange && !options?.force) {
        resolve({
          syncedDevices: 0,
          photosCount: 0,
          videosCount: 0,
          documentsCount: 0,
          totalSize: "0 B",
        });
        return;
      }

      // Debounce multiple rapid web changes (e.g. bulk delete/upload)
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        const stats = this.getLiveFileStats();
        const devices = this.getDevices();

        const reason = options?.reason || "Web: Thay đổi tệp tin dữ liệu";
        const changeType = options?.changeType || "web_change";

        // Update all connected/idle devices
        const updatedDevices = devices.map((dev) => {
          return {
            ...dev,
            status: "connected" as const,
            syncedStats: {
              ...dev.syncedStats,
              photos: stats.photosCount,
              videos: stats.videosCount,
              sizeString: stats.totalSizeString,
              lastSync: "Vừa xong",
            },
          };
        });

        this.saveDevices(updatedDevices);

        // Record history log
        const now = new Date();
        const timeDisplay = now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const newLog: BackupSyncLog = {
          id: `log-${Date.now()}`,
          timestamp: now.toISOString(),
          timeDisplay,
          reason,
          changeType,
          photosCount: stats.photosCount,
          videosCount: stats.videosCount,
          documentsCount: stats.documentsCount,
          totalSize: stats.totalSizeString,
          devicesCount: updatedDevices.length,
        };

        try {
          const prevHistory = this.getSyncHistory();
          const nextHistory = [newLog, ...prevHistory].slice(0, 25);
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(nextHistory));
        } catch {}

        // Dispatch local custom event
        window.dispatchEvent(
          new CustomEvent("cloudbox:backup-synced", {
            detail: {
              log: newLog,
              stats,
              devicesCount: updatedDevices.length,
              timestamp: Date.now(),
            },
          })
        );

        // Broadcast to other tabs/windows
        try {
          if (typeof BroadcastChannel !== "undefined") {
            const channel = new BroadcastChannel("cloudbox_backup_channel");
            channel.postMessage({
              type: "BACKUP_SYNCED",
              log: newLog,
              timestamp: Date.now(),
            });
            channel.close();
          }
        } catch {}

        // User feedback toast (throttled to at most once every 4 seconds)
        const nowTime = Date.now();
        if (!options?.silent && nowTime - lastToastTime > 4000) {
          lastToastTime = nowTime;
          toast.success("CloudBox: Đã tự động cập nhật sao lưu khi Web thay đổi", {
            description: `Đồng bộ ${updatedDevices.length} thiết bị · ${stats.photosCount} ảnh, ${stats.videosCount} video, ${stats.documentsCount} tài liệu (${stats.totalSizeString})`,
            id: "cloudbox-auto-sync-toast",
            duration: 3500,
          });
        }

        resolve({
          syncedDevices: updatedDevices.length,
          photosCount: stats.photosCount,
          videosCount: stats.videosCount,
          documentsCount: stats.documentsCount,
          totalSize: stats.totalSizeString,
        });
      }, 250);
    });
  }
}
