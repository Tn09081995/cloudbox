"use client";

import { useEffect, useState, useCallback } from "react";
import { BackupSyncService } from "@/lib/services/backupSyncService";
import { BackupSyncLog, AutoBackupConfig } from "@/types/backup";

export function useBackupAutoSync() {
  const [config, setConfig] = useState<AutoBackupConfig>(() =>
    BackupSyncService.getConfig()
  );
  const [lastSyncLog, setLastSyncLog] = useState<BackupSyncLog | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize and load latest sync log
  useEffect(() => {
    setConfig(BackupSyncService.getConfig());
    const history = BackupSyncService.getSyncHistory();
    if (history.length > 0) {
      setLastSyncLog(history[0]);
    }
  }, []);

  // Listen to file changes across the web application
  useEffect(() => {
    const handleFilesChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ reason?: string; action?: string }>;
      const reason = customEvent.detail?.reason || "Web: Thay đổi tệp tin dữ liệu";
      setIsSyncing(true);
      BackupSyncService.triggerAutoBackupSync({
        reason,
        changeType: "web_change",
      }).finally(() => {
        setIsSyncing(false);
      });
    };

    const handleBackupSynced = (e: Event) => {
      const customEvent = e as CustomEvent<{ log?: BackupSyncLog }>;
      if (customEvent.detail?.log) {
        setLastSyncLog(customEvent.detail.log);
      }
    };

    const handleConfigChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AutoBackupConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      }
    };

    // Cross-tab broadcast listener
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("cloudbox_backup_channel");
        channel.onmessage = (msg) => {
          if (msg.data?.type === "BACKUP_SYNCED" && msg.data?.log) {
            setLastSyncLog(msg.data.log);
          }
        };
      }
    } catch {}

    // Cross-tab localStorage storage listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cloudbox_material_nodes_v1") {
        BackupSyncService.triggerAutoBackupSync({
          reason: "Web: Đồng bộ tệp tin từ cửa sổ khác",
          changeType: "web_change",
          silent: true,
        });
      } else if (e.key === "cloudbox_auto_backup_config_v1" && e.newValue) {
        try {
          setConfig(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener("cloudbox:files-changed", handleFilesChanged);
    window.addEventListener("cloudbox:refresh-files", handleFilesChanged);
    window.addEventListener("cloudbox:backup-synced", handleBackupSynced);
    window.addEventListener("cloudbox:auto-backup-config-changed", handleConfigChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cloudbox:files-changed", handleFilesChanged);
      window.removeEventListener("cloudbox:refresh-files", handleFilesChanged);
      window.removeEventListener("cloudbox:backup-synced", handleBackupSynced);
      window.removeEventListener("cloudbox:auto-backup-config-changed", handleConfigChanged);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  const triggerManualSync = useCallback((reason = "Đồng bộ thủ công") => {
    setIsSyncing(true);
    return BackupSyncService.triggerAutoBackupSync({
      reason,
      changeType: "sync",
      force: true,
    }).finally(() => {
      setIsSyncing(false);
    });
  }, []);

  const setAutoBackupOnWebChange = useCallback((enabled: boolean) => {
    const updated = BackupSyncService.saveConfig({ autoBackupOnWebChange: enabled });
    setConfig(updated);
    if (enabled) {
      BackupSyncService.triggerAutoBackupSync({
        reason: "Bật tự động sao lưu khi Web thay đổi",
        changeType: "sync",
        force: true,
      });
    }
  }, []);

  return {
    config,
    isAutoBackupEnabled: config.autoBackupOnWebChange,
    lastSyncLog,
    isSyncing,
    triggerManualSync,
    setAutoBackupOnWebChange,
  };
}
