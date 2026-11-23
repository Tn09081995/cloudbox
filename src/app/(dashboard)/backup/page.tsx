"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  RefreshCw,
  Plus,
  Wifi,
  Battery,
  HardDrive,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Camera,
  FolderSync,
  QrCode,
  ArrowRight,
  ExternalLink,
  Trash2,
  Star,
  Copy,
  Check,
  MoreVertical,
  Laptop,
  Tablet,
  Sparkles,
  Edit2,
  Pencil,
  History,
  Zap,
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";
import { BackupDevice, BackupSyncLog } from "@/types/backup";
import { BackupSyncService } from "@/lib/services/backupSyncService";
import { useBackupAutoSync } from "@/lib/hooks/useBackupAutoSync";

export type { BackupDevice };

export default function MobileBackupPage() {
  const {
    isAutoBackupEnabled,
    lastSyncLog,
    isSyncing: isAutoSyncing,
    triggerManualSync,
    setAutoBackupOnWebChange,
  } = useBackupAutoSync();

  const [devices, setDevices] = useState<BackupDevice[]>(() =>
    BackupSyncService.getDevices()
  );
  const [syncHistory, setSyncHistory] = useState<BackupSyncLog[]>(() =>
    BackupSyncService.getSyncHistory()
  );
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"qr" | "scanner" | "manual">("qr");
  const [lanIp, setLanIp] = useState<string>("");
  const [qrTargetUrl, setQrTargetUrl] = useState<string>("");

  // Editing device modal state
  const [editingDevice, setEditingDevice] = useState<BackupDevice | null>(null);
  const [editName, setEditName] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editOs, setEditOs] = useState("");
  const [editType, setEditType] = useState<"ios" | "android" | "tablet" | "desktop">("ios");
  const [editStorageUsed, setEditStorageUsed] = useState("");
  const [editBatteryLevel, setEditBatteryLevel] = useState(90);
  const [editNetwork, setEditNetwork] = useState("");

  // Quick preset model for 1-touch pairing
  const [quickModelPreset, setQuickModelPreset] = useState("iPhone 16 Pro Max");

  // New device form state
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceModel, setNewDeviceModel] = useState("iPhone 16 Pro");
  const [newDeviceOs, setNewDeviceOs] = useState("iOS 18.3");
  const [newDeviceType, setNewDeviceType] = useState<"ios" | "android" | "tablet" | "desktop">("ios");
  const [isLinking, setIsLinking] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pairingCode, setPairingCode] = useState("CLBX-MOBILE-8842");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Backup configuration toggle states
  const [autoBackupPhotos, setAutoBackupPhotos] = useState(() => BackupSyncService.getConfig().autoBackupPhotos);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [originalQuality, setOriginalQuality] = useState(true);
  const [appFolders, setAppFolders] = useState(true);
  const [freeUpSpace, setFreeUpSpace] = useState(false);

  // Sync devices and history on live event
  useEffect(() => {
    const refreshData = () => {
      setDevices(BackupSyncService.getDevices());
      setSyncHistory(BackupSyncService.getSyncHistory());
    };

    window.addEventListener("cloudbox:backup-synced", refreshData);
    window.addEventListener("cloudbox:backup-devices-updated", refreshData);

    return () => {
      window.removeEventListener("cloudbox:backup-synced", refreshData);
      window.removeEventListener("cloudbox:backup-devices-updated", refreshData);
    };
  }, []);

  const saveDevices = (updated: BackupDevice[]) => {
    BackupSyncService.saveDevices(updated);
    setDevices(updated);
  };

  // Sync a single device
  const handleSyncDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;

    setSyncingDeviceId(deviceId);
    toast.info(`Đang kiểm tra thư viện từ ${target.name}...`);
    triggerManualSync(`Đồng bộ thiết bị ${target.name}`).finally(() => {
      setSyncingDeviceId(null);
      toast.success(`Đã đồng bộ thiết bị ${target.name} với dữ liệu Web mới nhất!`);
    });
  };

  // Sync all devices
  const handleSyncAll = () => {
    setIsSyncingAll(true);
    toast.info("Đang bắt đầu đồng bộ toàn bộ thiết bị đã liên kết...");
    triggerManualSync("Đồng bộ toàn bộ thiết bị đã liên kết").finally(() => {
      setIsSyncingAll(false);
      toast.success(vi.mobileBackup.syncedJustNow);
    });
  };

  // Set device as primary
  const handleSetPrimary = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;

    const updated = devices.map((d) => ({
      ...d,
      isPrimary: d.id === deviceId,
    }));
    saveDevices(updated);
    toast.success(`Đã đặt "${target.name}" làm thiết bị sao lưu chính!`);
  };

  // Unlink device
  const handleUnlinkDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;

    if (confirm(`Bạn có chắc chắn muốn ngắt kết nối thiết bị "${target.name}" không?`)) {
      const updated = devices.filter((d) => d.id !== deviceId);
      // If we removed the primary device and there are remaining devices, make the first one primary
      if (target.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      saveDevices(updated);
      toast.success(vi.mobileBackup.unlinkedSuccess);
    }
  };

  // Manual link submission
  const handleAddDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newDeviceName.trim() || newDeviceModel;
    setIsLinking(true);

    setTimeout(() => {
      const newDev: BackupDevice = {
        id: `dev-${Date.now()}`,
        name,
        model: newDeviceModel,
        os: newDeviceOs,
        type: newDeviceType,
        isPrimary: devices.length === 0,
        status: "connected",
        batteryLevel: Math.floor(Math.random() * 20) + 80,
        network: "Wi-Fi (Đã xác thực)",
        storageUsed: "64/256 GB",
        syncedStats: {
          photos: 0,
          videos: 0,
          sizeString: "0 MB",
          lastSync: "Vừa xong",
        },
      };

      saveDevices([newDev, ...devices]);
      setIsLinking(false);
      setConnectModalOpen(false);
      setNewDeviceName("");
      toast.success(`Đã liên kết thành công thiết bị "${name}"!`);
    }, 600);
  };

  // Handle successful device pairing from any source (QR, mobile, or manual)
  const handleOnDevicePaired = (pairedDev: BackupDevice) => {
    setDevices((prev) => {
      if (prev.some((d) => d.id === pairedDev.id || (d.name === pairedDev.name && d.model === pairedDev.model))) {
        return prev;
      }
      const updated = [pairedDev, ...prev];
      try {
        localStorage.setItem("cloudbox_backup_devices_v1", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsLinking(false);
    setConnectModalOpen(false);
    toast.success(`Đã liên kết thành công thiết bị "${pairedDev.name}"!`);
  };

  // Generate real, 100% scannable QR Code whenever modal opens or code changes
  useEffect(() => {
    if (!connectModalOpen) return;
    let isMounted = true;

    async function generateCode() {
      let host = typeof window !== "undefined" ? window.location.origin : "";
      if (
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ) {
        try {
          const res = await fetch("/api/network-ip");
          if (res.ok) {
            const data = await res.json();
            if (data.lanIp && data.lanIp !== "localhost") {
              setLanIp(data.lanIp);
              host = `http://${data.lanIp}:${window.location.port || 3000}`;
            }
          }
        } catch {}
      }

      const pairUrl = `${host}/backup/pair?code=${encodeURIComponent(pairingCode)}`;
      if (isMounted) setQrTargetUrl(pairUrl);

      QRCode.toDataURL(pairUrl, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: "M",
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          if (isMounted) setQrDataUrl(url);
        })
        .catch((err) => {
          console.error("Lỗi tạo mã QR", err);
        });
    }

    generateCode();

    return () => {
      isMounted = false;
    };
  }, [connectModalOpen, pairingCode]);

  // Real-time synchronization when QR modal is open
  useEffect(() => {
    if (!connectModalOpen || modalTab !== "qr") return;

    // 1. BroadcastChannel for same browser tabs
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("cloudbox_pair_channel");
        bc.onmessage = (event) => {
          if (event.data?.type === "PAIRED" && event.data?.code === pairingCode && event.data?.device) {
            handleOnDevicePaired(event.data.device);
          }
        };
      }
    } catch {}

    // 2. Poll API route every 1500ms for mobile QR scanning
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/backup/pair?code=${encodeURIComponent(pairingCode)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "paired" && data.device) {
            handleOnDevicePaired(data.device);
          }
        }
      } catch {}
    }, 1500);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [connectModalOpen, modalTab, pairingCode]);

  // Open edit device info dialog
  const handleOpenEdit = (device: BackupDevice) => {
    setEditingDevice(device);
    setEditName(device.name);
    setEditModel(device.model);
    setEditOs(device.os);
    setEditType(device.type);
    setEditStorageUsed(device.storageUsed);
    setEditBatteryLevel(device.batteryLevel);
    setEditNetwork(device.network);
  };

  // Save edited device info
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;

    const updated = devices.map((d) => {
      if (d.id === editingDevice.id) {
        return {
          ...d,
          name: editName.trim() || d.name,
          model: editModel.trim() || d.model,
          os: editOs.trim() || d.os,
          type: editType,
          storageUsed: editStorageUsed.trim() || d.storageUsed,
          batteryLevel: editBatteryLevel,
          network: editNetwork.trim() || d.network,
        };
      }
      return d;
    });

    saveDevices(updated);
    setEditingDevice(null);
    toast.success(`Đã cập nhật chính xác thông tin thiết bị "${editName}"!`);
  };

  // Simulated QR scan pairing / 1-touch pairing with EXACT chosen model
  const handleSimulateScanPairing = async () => {
    setIsLinking(true);
    toast.info(`Đang xác thực liên kết thiết bị ${quickModelPreset}...`);

    let type: "ios" | "android" | "tablet" = "ios";
    let os = "iOS 18.2";
    let storage = "128/256 GB";

    if (quickModelPreset.includes("iPhone")) {
      type = "ios";
      os = "iOS 18.2";
      storage = "128/256 GB";
    } else if (quickModelPreset.includes("iPad")) {
      type = "tablet";
      os = "iPadOS 18.1";
      storage = "256/512 GB";
    } else if (quickModelPreset.includes("Samsung")) {
      type = "android";
      os = "Android 14 (One UI 6.1)";
      storage = "142/512 GB";
    } else if (quickModelPreset.includes("Xiaomi")) {
      type = "android";
      os = "Xiaomi HyperOS (Android 14)";
      storage = "86/256 GB";
    } else {
      type = "android";
      os = "Android 14";
      storage = "64/128 GB";
    }

    const newDev: BackupDevice = {
      id: `dev-${Date.now()}`,
      name: `${quickModelPreset} của tôi`,
      model: quickModelPreset,
      os,
      type,
      isPrimary: devices.length === 0,
      status: "connected",
      batteryLevel: 92,
      network: "Wi-Fi 5G",
      storageUsed: storage,
      syncedStats: {
        photos: 24,
        videos: 3,
        sizeString: "320 MB",
        lastSync: "Vừa xong",
      },
    };

    try {
      await fetch("/api/backup/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pairingCode, device: newDev }),
      });
    } catch {}

    setTimeout(() => {
      handleOnDevicePaired(newDev);
    }, 600);
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard?.writeText(pairingCode);
    setCopiedCode(true);
    toast.success("Đã sao chép mã liên kết vào bộ nhớ tạm!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const refreshPairingCode = () => {
    const code = `CLBX-MOBILE-${Math.floor(1000 + Math.random() * 9000)}`;
    setPairingCode(code);
    toast.info("Đã tạo mã liên kết mới!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Smartphone className="h-6 w-6 text-primary" />
            <span>{vi.mobileBackup.title}</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {vi.mobileBackup.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-btn text-xs font-semibold gap-1.5 h-9 border-primary/30 text-primary hover:bg-primary-soft"
          >
            <Link href="/photos">
              <ImageIcon className="h-4 w-4" />
              <span>Xem ảnh đã sao lưu</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setConnectModalOpen(true)}
            className="rounded-btn text-xs font-semibold gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" />
            <span>{vi.mobileBackup.addDeviceBtn}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold gap-1.5 h-9 shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingAll ? "animate-spin" : ""}`} />
            <span>{isSyncingAll ? vi.mobileBackup.syncing : vi.mobileBackup.syncNow}</span>
          </Button>
        </div>
      </div>

      {/* Real-time Auto-Sync Status Card */}
      <div className="p-4 md:p-5 rounded-2xl bg-surface border border-primary/25 shadow-xs relative overflow-hidden transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isAutoBackupEnabled
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Zap className={`h-5 w-5 ${isAutoSyncing || isSyncingAll ? "animate-pulse" : ""}`} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Tự động cập nhật sao lưu khi Web thay đổi
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                    isAutoBackupEnabled
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/25"
                      : "bg-surface-2 text-muted-foreground border border-border"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAutoBackupEnabled ? "bg-emerald-500 animate-ping" : "bg-muted-foreground"
                    }`}
                  />
                  {isAutoBackupEnabled ? "Đang đồng bộ thời gian thực" : "Đã tạm dừng"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Khi bạn tải lên, chỉnh sửa, đổi tên hoặc xóa tệp tin trên trang web CloudBox, hệ thống sẽ tự động cập nhật ngay sang tất cả {devices.length} thiết bị liên kết mà không cần thao tác tay.
              </p>
              {lastSyncLog && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                  <span className="font-semibold text-foreground">Lần cập nhật gần nhất:</span>
                  <span className="font-mono text-primary font-bold">{lastSyncLog.timeDisplay}</span>
                  <span>•</span>
                  <span className="font-medium text-foreground">{lastSyncLog.reason}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">
                    {lastSyncLog.photosCount} ảnh, {lastSyncLog.videosCount} video ({lastSyncLog.totalSize})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:self-center flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSyncAll()}
              disabled={isSyncingAll || isAutoSyncing}
              className="rounded-pill text-xs h-9 px-3 gap-1.5 border-border bg-surface hover:bg-surface-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingAll || isAutoSyncing ? "animate-spin text-primary" : ""}`} />
              <span>{isSyncingAll || isAutoSyncing ? "Đang cập nhật..." : "Đồng bộ tức thì"}</span>
            </Button>
            <Switch
              checked={isAutoBackupEnabled}
              onCheckedChange={(val) => setAutoBackupOnWebChange(val)}
              aria-label="Bật/Tắt tự động cập nhật sao lưu khi Web thay đổi"
            />
          </div>
        </div>
      </div>

      {/* Linked Devices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
            {vi.mobileBackup.devicesHeading} ({devices.length})
          </h2>
          <button
            type="button"
            onClick={() => setConnectModalOpen(true)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Liên kết thêm</span>
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="p-8 rounded-card bg-surface border border-dashed border-border text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Chưa có thiết bị nào được liên kết
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Liên kết điện thoại của bạn để tự động sao lưu ảnh, video và tệp tin lên CloudBox an toàn.
            </p>
            <Button
              onClick={() => setConnectModalOpen(true)}
              className="rounded-btn bg-primary text-white text-xs font-semibold h-8 px-4"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              <span>Liên kết thiết bị đầu tiên</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => {
              const isDeviceSyncing = syncingDeviceId === device.id || isSyncingAll;
              return (
                <div
                  key={device.id}
                  className={`p-5 rounded-card bg-surface border shadow-card space-y-4 transition-all ${
                    device.isPrimary
                      ? "border-primary/40 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-card flex items-center justify-center flex-shrink-0 ${
                          device.isPrimary
                            ? "bg-primary-soft text-primary"
                            : "bg-surface-2 text-muted-foreground"
                        }`}
                      >
                        {device.type === "ios" || device.type === "android" ? (
                          <Smartphone className="h-6 w-6" />
                        ) : device.type === "tablet" ? (
                          <Tablet className="h-6 w-6" />
                        ) : (
                          <Laptop className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground">
                            {device.name}
                          </h3>
                          {device.isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                              {vi.mobileBackup.primaryDevice}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {device.model} · {device.os}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          device.status === "connected"
                            ? "text-semantic-success bg-semantic-success/10"
                            : "text-muted-foreground bg-muted"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{device.status === "connected" ? "Đang kết nối" : "Chờ đồng bộ"}</span>
                      </span>

                      {/* Device Action Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-1 h-7 w-7 rounded-btn hover:bg-surface-2 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                            aria-label="Thao tác thiết bị"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 p-1 rounded-card bg-surface border border-border shadow-lg font-sans"
                        >
                          <DropdownMenuItem
                            onClick={() => handleSyncDevice(device.id)}
                            disabled={isDeviceSyncing}
                            className="flex items-center gap-2 text-xs px-2.5 py-2 rounded-btn cursor-pointer font-medium"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isDeviceSyncing ? "animate-spin" : ""}`} />
                            <span>Đồng bộ ngay</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(device)}
                            className="flex items-center gap-2 text-xs px-2.5 py-2 rounded-btn cursor-pointer font-medium"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-primary" />
                            <span>Chỉnh sửa thông tin</span>
                          </DropdownMenuItem>

                          {!device.isPrimary && (
                            <DropdownMenuItem
                              onClick={() => handleSetPrimary(device.id)}
                              className="flex items-center gap-2 text-xs px-2.5 py-2 rounded-btn cursor-pointer font-medium"
                            >
                              <Star className="h-3.5 w-3.5 text-amber-500" />
                              <span>{vi.mobileBackup.setPrimary}</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator className="my-1 bg-border" />

                          <DropdownMenuItem
                            onClick={() => handleUnlinkDevice(device.id)}
                            className="flex items-center gap-2 text-xs px-2.5 py-2 rounded-btn cursor-pointer font-medium text-semantic-danger focus:text-semantic-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>{vi.mobileBackup.unlinkDevice}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Quick Specs */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-btn bg-surface-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Battery className="h-4 w-4 text-emerald-500" />
                      <span className="font-mono">{device.batteryLevel}% Pin</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Wifi className="h-4 w-4 text-primary" />
                      <span className="truncate">{device.network}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                      <HardDrive className="h-4 w-4 text-amber-500" />
                      <span className="font-mono">{device.storageUsed}</span>
                    </div>
                  </div>

                  {/* Backup Stats */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Dữ liệu đã sao lưu:</span>
                      <Link
                        href="/photos"
                        className="font-bold text-primary hover:underline font-mono inline-flex items-center gap-1"
                        title="Bấm để xem ảnh và video đã sao lưu"
                      >
                        <span>
                          {device.syncedStats.photos.toLocaleString("vi-VN")} ảnh · {device.syncedStats.videos} video
                        </span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Lần đồng bộ gần nhất:</span>
                      <span className="font-semibold text-foreground">
                        {device.syncedStats.lastSync}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-1 flex items-center justify-between">
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2.5 text-[11px] rounded-btn font-semibold gap-1 text-primary hover:bg-primary/10"
                    >
                      <Link href="/photos">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Xem ảnh đã sao lưu</span>
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSyncDevice(device.id)}
                      disabled={isDeviceSyncing}
                      className="h-7 px-3 text-[11px] rounded-btn font-semibold gap-1.5"
                    >
                      <RefreshCw className={`h-3 w-3 ${isDeviceSyncing ? "animate-spin" : ""}`} />
                      <span>{isDeviceSyncing ? "Đang đồng bộ..." : "Đồng bộ thiết bị này"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Synced Albums & Folders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
            {vi.mobileBackup.foldersHeading}
          </h2>
          <Link
            href="/photos"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Mở Thư viện Ảnh & Video</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/photos"
            className="p-4 rounded-card bg-surface border border-border hover:border-primary/50 hover:shadow-card-hover transition-all group"
          >
            <div className="h-9 w-9 rounded-btn bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Camera className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Ảnh Camera (DCIM)
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Tự động sao lưu ảnh chụp
            </p>
          </Link>

          <Link
            href="/photos"
            className="p-4 rounded-card bg-surface border border-border hover:border-primary/50 hover:shadow-card-hover transition-all group"
          >
            <div className="h-9 w-9 rounded-btn bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Video className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Video điện thoại
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Video độ phân giải cao & 4K
            </p>
          </Link>

          <Link
            href="/photos"
            className="p-4 rounded-card bg-surface border border-border hover:border-primary/50 hover:shadow-card-hover transition-all group"
          >
            <div className="h-9 w-9 rounded-btn bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Ảnh chụp màn hình
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Screenshots từ thiết bị
            </p>
          </Link>

          <Link
            href="/drive"
            className="p-4 rounded-card bg-surface border border-border hover:border-primary/50 hover:shadow-card-hover transition-all group"
          >
            <div className="h-9 w-9 rounded-btn bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FolderSync className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Tệp Zalo & Tin nhắn
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Hình ảnh & tệp tin gửi nhận
            </p>
          </Link>
        </div>
      </div>

      {/* Auto Backup Configuration Toggles */}
      <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-6">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {vi.mobileBackup.settingsHeading}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tùy biến các quy tắc và điều kiện đồng bộ để tối ưu pin và dữ liệu di động
          </p>
        </div>

        <div className="divide-y divide-border">
          {/* Toggle 0: Auto backup when web changes */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground">
                  Tự động cập nhật sao lưu khi web thay đổi
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tự động đồng bộ hóa hai chiều tức thì sang tất cả thiết bị đã liên kết khi có bất kỳ thay đổi nào trên trang web CloudBox (tải tệp lên, chỉnh sửa, đổi tên, xóa tệp).
              </p>
            </div>
            <Switch
              checked={isAutoBackupEnabled}
              onCheckedChange={(val) => {
                setAutoBackupOnWebChange(val);
                toast.success(
                  val
                    ? "Đã bật tự động cập nhật sao lưu khi Web thay đổi"
                    : "Đã tắt tự động cập nhật sao lưu khi Web thay đổi"
                );
              }}
            />
          </div>

          {/* Toggle 1: Auto backup photos & videos */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground">
                {vi.mobileBackup.autoBackupPhotos}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {vi.mobileBackup.autoBackupPhotosDesc}
              </p>
            </div>
            <Switch
              checked={autoBackupPhotos}
              onCheckedChange={(val) => {
                setAutoBackupPhotos(val);
                BackupSyncService.saveConfig({ autoBackupPhotos: val });
                toast.success(val ? "Đã bật tự động sao lưu ảnh & video mới" : "Đã tắt tự động sao lưu ảnh & video");
              }}
            />
          </div>

          {/* Toggle 2: Wi-Fi only */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground">
                {vi.mobileBackup.wifiOnly}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {vi.mobileBackup.wifiOnlyDesc}
              </p>
            </div>
            <Switch
              checked={wifiOnly}
              onCheckedChange={(val) => {
                setWifiOnly(val);
                toast.success(val ? "Đã bật chế độ chỉ sao lưu qua Wi-Fi" : "Đã cho phép dùng 4G/5G");
              }}
            />
          </div>

          {/* Toggle 3: Original Quality */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground">
                {vi.mobileBackup.originalQuality}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {vi.mobileBackup.originalQualityDesc}
              </p>
            </div>
            <Switch
              checked={originalQuality}
              onCheckedChange={(val) => {
                setOriginalQuality(val);
                toast.success(val ? "Đã chọn chất lượng gốc" : "Đã chọn nén tiết kiệm bộ nhớ");
              }}
            />
          </div>

          {/* Toggle 4: App Folders (Zalo / Telegram) */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground">
                {vi.mobileBackup.appFolders}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {vi.mobileBackup.appFoldersDesc}
              </p>
            </div>
            <Switch
              checked={appFolders}
              onCheckedChange={(val) => {
                setAppFolders(val);
                toast.success(val ? "Đã bật sao lưu tệp Zalo & tin nhắn" : "Đã tắt sao lưu ứng dụng");
              }}
            />
          </div>

          {/* Toggle 5: Free up phone space */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground">
                {vi.mobileBackup.freeUpSpace}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {vi.mobileBackup.freeUpSpaceDesc}
              </p>
            </div>
            <Switch
              checked={freeUpSpace}
              onCheckedChange={(val) => {
                setFreeUpSpace(val);
                toast.success(val ? "Đã bật dọn dẹp bộ nhớ máy" : "Đã tắt dọn dẹp");
              }}
            />
          </div>
        </div>
      </div>

      {/* Auto Backup Live Activity History */}
      <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span>Nhật ký cập nhật sao lưu tự động (Thời gian thực)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hệ thống tự động ghi lại mỗi khi có thay đổi trên Web và tiến hành đồng bộ sang các thiết bị
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-surface-2 px-3 py-1 rounded-full border border-border">
            {syncHistory.length} sự kiện
          </span>
        </div>

        {syncHistory.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground bg-surface-2/40 rounded-2xl border border-dashed border-border">
            Chưa có sự kiện sao lưu. Bất kỳ khi nào bạn tải lên, sửa hoặc xóa tệp trên Web, nhật ký tự động cập nhật tại đây.
          </div>
        ) : (
          <div className="divide-y divide-border/60 max-h-64 overflow-y-auto pr-1">
            {syncHistory.slice(0, 10).map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{log.reason}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Đã đồng bộ {log.photosCount} ảnh · {log.videosCount} video · {log.documentsCount} tài liệu ({log.totalSize})
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-mono font-medium text-foreground block">
                    {log.timeDisplay}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {log.devicesCount} thiết bị liên kết
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect New Device Dialog (QR Code & Manual Link) */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="max-w-lg p-6 rounded-dialog bg-surface border border-border shadow-xl font-sans">
          <DialogHeader className="text-center sm:text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <QrCode className="h-6 w-6" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {vi.mobileBackup.connectModalTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {vi.mobileBackup.connectModalDesc}
            </DialogDescription>
          </DialogHeader>

          {/* Segmented Mode Selector (3 Tabs) */}
          <div className="grid grid-cols-3 p-1 rounded-btn bg-surface-2 border border-border my-2">
            <button
              type="button"
              onClick={() => setModalTab("qr")}
              className={`py-1.5 text-xs font-semibold rounded-btn transition-colors ${
                modalTab === "qr"
                  ? "bg-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mã QR điện thoại
            </button>
            <button
              type="button"
              onClick={() => setModalTab("scanner")}
              className={`py-1.5 text-xs font-semibold rounded-btn transition-colors ${
                modalTab === "scanner"
                  ? "bg-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Camera quét mã
            </button>
            <button
              type="button"
              onClick={() => setModalTab("manual")}
              className={`py-1.5 text-xs font-semibold rounded-btn transition-colors ${
                modalTab === "manual"
                  ? "bg-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Nhập thủ công
            </button>
          </div>

          {modalTab === "qr" ? (
            <div className="space-y-4">
              {/* Real 100% Scannable QR Code */}
              <div className="p-4 rounded-2xl bg-surface-2 border border-border flex flex-col items-center justify-center space-y-3">
                <div className="h-52 w-52 rounded-2xl bg-white p-2.5 border border-border flex items-center justify-center shadow-md">
                  {qrDataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrDataUrl}
                      alt="Mã QR liên kết CloudBox"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-[11px]">Đang tạo mã QR thật...</span>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-1.5 w-full">
                  <span className="text-xs font-semibold text-foreground block">
                    Quét bằng Camera điện thoại, Zalo hoặc Google Lens
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {lanIp
                      ? `Điện thoại cùng Wi-Fi sẽ kết nối qua: ${qrTargetUrl}`
                      : "Mã QR tiêu chuẩn quốc tế, có thể quét trực tiếp bằng bất kỳ ứng dụng chụp ảnh nào."}
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <code className="text-xs font-mono font-bold bg-surface px-3 py-1 rounded border border-border text-primary inline-block">
                      {pairingCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyCodeToClipboard}
                      className="p-1.5 h-8 w-8 rounded-btn bg-surface border border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                      title="Sao chép mã"
                    >
                      {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={refreshPairingCode}
                      className="p-1.5 h-8 w-8 rounded-btn bg-surface border border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                      title="Tạo mã mới"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Quick Steps */}
              <div className="space-y-1.5 text-xs text-muted-foreground bg-surface-2/60 p-3 rounded-2xl border border-border/60">
                <p className="font-semibold text-foreground">3 bước liên kết đơn giản:</p>
                <p>1. Hướng camera điện thoại (iPhone, Samsung, Zalo, Google Lens) vào mã QR.</p>
                <p>2. Chạm vào liên kết hiển thị trên điện thoại để mở trang xác nhận liên kết.</p>
                <p>3. Bấm &quot;Xác nhận liên kết&quot; - máy tính này sẽ tự động kết nối sau 1 giây.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-col gap-2">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Chọn đúng mẫu điện thoại của bạn để liên kết:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "iPhone 16 Pro Max",
                      "iPhone 15 Pro",
                      "Samsung Galaxy S24 Ultra",
                      "Xiaomi 14 Ultra",
                      "Google Pixel 8 Pro",
                    ].map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setQuickModelPreset(model)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                          quickModelPreset === model
                            ? "bg-primary text-white border-primary font-bold shadow-xs"
                            : "bg-surface text-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSimulateScanPairing}
                  disabled={isLinking}
                  className="w-full h-10 rounded-pill bg-primary text-white hover:bg-primary/90 text-xs font-semibold gap-2 shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isLinking ? "Đang liên kết thiết bị..." : `Xác nhận liên kết ${quickModelPreset} (1 chạm)`}</span>
                </Button>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>Mở trực tiếp trên trình duyệt:</span>
                  <Link
                    href={`/backup/pair?code=${pairingCode}`}
                    target="_blank"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Mở trang liên kết này</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : modalTab === "scanner" ? (
            <div className="space-y-4">
              {/* Camera Scanner Viewfinder Graphic */}
              <div className="relative h-60 w-full rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                {/* Viewfinder brackets */}
                <div className="relative w-44 h-44 border-2 border-dashed border-emerald-500/60 rounded-xl flex items-center justify-center">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                  {/* Animated laser scan line */}
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce shadow-[0_0_8px_#34d399]" />

                  <Camera className="h-10 w-10 text-emerald-400/40 animate-pulse" />
                </div>

                <div className="absolute bottom-3 inset-x-0 text-center px-4">
                  <span className="text-xs text-slate-300 font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                    Đang hướng camera tìm mã QR CloudBox...
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground bg-surface-2/60 p-3 rounded-2xl border border-border/60">
                <p className="font-semibold text-foreground">Cách quét mã:</p>
                <p>• Hướng camera của máy tính hoặc điện thoại vào mã QR trên màn hình đối diện.</p>
                <p>• Giữ mã nằm trọn trong khung ngắm màu xanh.</p>
              </div>

              <Button
                type="button"
                onClick={handleSimulateScanPairing}
                disabled={isLinking}
                className="w-full h-10 rounded-pill bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold gap-2 shadow-sm"
              >
                <Camera className="h-4 w-4" />
                <span>{isLinking ? "Đang nhận diện..." : "Chụp & Nhận diện mã ngay lập tức"}</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAddDeviceSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="dev-name" className="text-xs font-semibold">
                  {vi.mobileBackup.deviceNameLabel}
                </Label>
                <Input
                  id="dev-name"
                  placeholder="VD: iPhone 16 Pro của tôi, Galaxy S25"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="rounded-btn text-xs h-9 bg-surface-2"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dev-model" className="text-xs font-semibold">
                    Dòng máy
                  </Label>
                  <Input
                    id="dev-model"
                    value={newDeviceModel}
                    onChange={(e) => setNewDeviceModel(e.target.value)}
                    className="rounded-btn text-xs h-9 bg-surface-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dev-os" className="text-xs font-semibold">
                    {vi.mobileBackup.deviceOsLabel}
                  </Label>
                  <Input
                    id="dev-os"
                    value={newDeviceOs}
                    onChange={(e) => setNewDeviceOs(e.target.value)}
                    className="rounded-btn text-xs h-9 bg-surface-2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loại thiết bị</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: "ios" as const, label: "iPhone", icon: Smartphone },
                    { type: "android" as const, label: "Android", icon: Smartphone },
                    { type: "tablet" as const, label: "iPad/Tablet", icon: Tablet },
                    { type: "desktop" as const, label: "Máy tính", icon: Laptop },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setNewDeviceType(item.type)}
                        className={`p-2.5 rounded-btn border text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                          newDeviceType === item.type
                            ? "border-primary bg-primary-soft/20 text-primary font-bold shadow-xs"
                            : "border-border hover:border-primary/40 text-muted-foreground bg-surface-2"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConnectModalOpen(false)}
                  className="rounded-btn text-xs h-9 px-4"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isLinking}
                  className="rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold h-9 px-5 shadow-xs"
                >
                  {isLinking ? "Đang lưu..." : "Xác nhận liên kết"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Device Info Dialog */}
      <Dialog open={!!editingDevice} onOpenChange={(open) => !open && setEditingDevice(null)}>
        <DialogContent className="max-w-md rounded-3xl bg-surface border-border p-6 shadow-2xl font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              <span>Chỉnh sửa thông tin thiết bị</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tùy chỉnh lại tên gọi, mẫu máy, hệ điều hành và dung lượng hiển thị cho đúng với thiết bị của bạn.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold text-foreground">
                Tên thiết bị (Gợi nhớ):
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="VD: iPhone của Tuấn, Galaxy S24..."
                className="h-10 rounded-pill text-xs bg-surface-2 border-border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-model" className="text-xs font-semibold text-foreground">
                  Mẫu máy (Model):
                </Label>
                <Input
                  id="edit-model"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  placeholder="iPhone 16 Pro Max, Pixel 8..."
                  className="h-10 rounded-pill text-xs bg-surface-2 border-border"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-os" className="text-xs font-semibold text-foreground">
                  Hệ điều hành (OS):
                </Label>
                <Input
                  id="edit-os"
                  value={editOs}
                  onChange={(e) => setEditOs(e.target.value)}
                  placeholder="iOS 18.2, Android 15..."
                  className="h-10 rounded-pill text-xs bg-surface-2 border-border"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-type" className="text-xs font-semibold text-foreground">
                  Loại thiết bị:
                </Label>
                <select
                  id="edit-type"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as "ios" | "android" | "tablet" | "desktop")}
                  className="w-full h-10 px-3 rounded-pill text-xs bg-surface-2 border border-border text-foreground outline-none"
                >
                  <option value="ios">iPhone (Apple iOS)</option>
                  <option value="android">Điện thoại Android</option>
                  <option value="tablet">Máy tính bảng (iPad / Tablet)</option>
                  <option value="desktop">Máy tính để bàn / Laptop</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-storage" className="text-xs font-semibold text-foreground">
                  Dung lượng hiển thị:
                </Label>
                <Input
                  id="edit-storage"
                  value={editStorageUsed}
                  onChange={(e) => setEditStorageUsed(e.target.value)}
                  placeholder="128/256 GB, 64/128 GB..."
                  className="h-10 rounded-pill text-xs bg-surface-2 border-border font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-battery" className="text-xs font-semibold text-foreground">
                  Mức pin (%):
                </Label>
                <Input
                  id="edit-battery"
                  type="number"
                  min="1"
                  max="100"
                  value={editBatteryLevel}
                  onChange={(e) => setEditBatteryLevel(Number(e.target.value) || 90)}
                  className="h-10 rounded-pill text-xs bg-surface-2 border-border font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-network" className="text-xs font-semibold text-foreground">
                  Tên mạng kết nối:
                </Label>
                <Input
                  id="edit-network"
                  value={editNetwork}
                  onChange={(e) => setEditNetwork(e.target.value)}
                  placeholder="Wi-Fi 5G, 4G LTE..."
                  className="h-10 rounded-pill text-xs bg-surface-2 border-border"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingDevice(null)}
                className="rounded-btn text-xs h-9 px-4"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold h-9 px-5 shadow-xs"
              >
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
