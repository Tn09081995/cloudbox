export interface BackupDevice {
  id: string;
  name: string;
  model: string;
  os: string;
  type: "ios" | "android" | "tablet" | "desktop";
  isPrimary: boolean;
  status: "connected" | "syncing" | "idle";
  batteryLevel: number;
  network: string;
  storageUsed: string;
  syncedStats: {
    photos: number;
    videos: number;
    sizeString: string;
    lastSync: string;
  };
}

export interface AutoBackupConfig {
  autoBackupOnWebChange: boolean; // Tự động cập nhật sao lưu khi web thay đổi
  autoBackupPhotos: boolean;
  wifiOnly: boolean;
  originalQuality: boolean;
  appFolders: boolean;
  freeUpSpace: boolean;
}

export interface BackupSyncLog {
  id: string;
  timestamp: string;
  timeDisplay: string;
  reason: string;
  changeType: "upload" | "delete" | "edit" | "sync" | "web_change";
  photosCount: number;
  videosCount: number;
  documentsCount: number;
  totalSize: string;
  devicesCount: number;
}
