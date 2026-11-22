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
  Trash2,
  Star,
  Copy,
  Check,
  MoreVertical,
  Laptop,
  Tablet,
  Sparkles,
} from "lucide-react";
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

const DEFAULT_DEVICES: BackupDevice[] = [
  {
    id: "dev-iphone-15",
    name: "Minh Anh's iPhone",
    model: "iPhone 15 Pro Max",
    os: "iOS 18.2",
    type: "ios",
    isPrimary: true,
    status: "connected",
    batteryLevel: 88,
    network: "FPT-5G",
    storageUsed: "148/256 GB",
    syncedStats: {
      photos: 2450,
      videos: 182,
      sizeString: "14,2 GB",
      lastSync: "Hôm nay lúc 15:20",
    },
  },
  {
    id: "dev-samsung-s24",
    name: "Galaxy S24 Cá nhân",
    model: "Samsung Galaxy S24 Ultra",
    os: "Android 15 (One UI 7.0)",
    type: "android",
    isPrimary: false,
    status: "idle",
    batteryLevel: 94,
    network: "Wi-Fi Nhà riêng",
    storageUsed: "92/512 GB",
    syncedStats: {
      photos: 820,
      videos: 45,
      sizeString: "4,6 GB",
      lastSync: "Hôm qua lúc 22:10",
    },
  },
];

export default function MobileBackupPage() {
  const [devices, setDevices] = useState<BackupDevice[]>(DEFAULT_DEVICES);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"qr" | "manual">("qr");

  // New device form state
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceModel, setNewDeviceModel] = useState("iPhone 16 Pro");
  const [newDeviceOs, setNewDeviceOs] = useState("iOS 18.3");
  const [newDeviceType, setNewDeviceType] = useState<"ios" | "android" | "tablet" | "desktop">("ios");
  const [isLinking, setIsLinking] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pairingCode, setPairingCode] = useState("CLBX-MOBILE-8842");

  // Backup configuration toggle states
  const [autoBackup, setAutoBackup] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [originalQuality, setOriginalQuality] = useState(true);
  const [appFolders, setAppFolders] = useState(true);
  const [freeUpSpace, setFreeUpSpace] = useState(false);

  // Load persisted devices on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cloudbox_backup_devices_v1");
      if (stored) {
        setDevices(JSON.parse(stored));
      } else {
        localStorage.setItem("cloudbox_backup_devices_v1", JSON.stringify(DEFAULT_DEVICES));
      }
    } catch {}
  }, []);

  const saveDevices = (updated: BackupDevice[]) => {
    setDevices(updated);
    try {
      localStorage.setItem("cloudbox_backup_devices_v1", JSON.stringify(updated));
    } catch {}
  };

  // Sync a single device
  const handleSyncDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;

    setSyncingDeviceId(deviceId);
    toast.info(`Đang kiểm tra thư viện từ ${target.name}...`);

    setTimeout(() => {
      const addedPhotos = Math.floor(Math.random() * 4) + 1;
      const updated = devices.map((d) => {
        if (d.id === deviceId) {
          return {
            ...d,
            status: "connected" as const,
            syncedStats: {
              ...d.syncedStats,
              photos: d.syncedStats.photos + addedPhotos,
              lastSync: "Vừa xong",
            },
          };
        }
        return d;
      });
      saveDevices(updated);
      setSyncingDeviceId(null);
      toast.success(`Đã đồng bộ ${addedPhotos} ảnh mới từ ${target.name} lên CloudBox!`);
    }, 1000);
  };

  // Sync all devices
  const handleSyncAll = () => {
    setIsSyncingAll(true);
    toast.info("Đang bắt đầu đồng bộ toàn bộ thiết bị đã liên kết...");

    setTimeout(() => {
      const updated = devices.map((d) => ({
        ...d,
        status: "connected" as const,
        syncedStats: {
          ...d.syncedStats,
          photos: d.syncedStats.photos + 3,
          lastSync: "Vừa xong",
        },
      }));
      saveDevices(updated);
      setIsSyncingAll(false);
      toast.success(vi.mobileBackup.syncedJustNow);
    }, 1200);
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

  // Simulated QR scan pairing
  const handleSimulateScanPairing = () => {
    setIsLinking(true);
    toast.info("Đang xử lý bắt tay xác thực từ thiết bị di động...");

    setTimeout(() => {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const isApple = Math.random() > 0.5;
      const newDev: BackupDevice = {
        id: `dev-${Date.now()}`,
        name: isApple ? `iPhone ${randomId}` : `Galaxy Ultra ${randomId}`,
        model: isApple ? "Apple iPhone 16 Pro" : "Samsung Galaxy S25",
        os: isApple ? "iOS 18.3" : "Android 15",
        type: isApple ? "ios" : "android",
        isPrimary: devices.length === 0,
        status: "connected",
        batteryLevel: 92,
        network: "5G High-Speed",
        storageUsed: "112/512 GB",
        syncedStats: {
          photos: 12,
          videos: 2,
          sizeString: "185 MB",
          lastSync: "Vừa xong",
        },
      };

      saveDevices([newDev, ...devices]);
      setIsLinking(false);
      setConnectModalOpen(false);
      toast.success(vi.mobileBackup.pairSuccess);
    }, 800);
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

        <div className="flex items-center gap-2.5">
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
                      <span className="font-bold text-foreground font-mono">
                        {device.syncedStats.photos.toLocaleString("vi-VN")} ảnh · {device.syncedStats.videos} video ({device.syncedStats.sizeString})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Lần đồng bộ gần nhất:</span>
                      <span className="font-semibold text-foreground">
                        {device.syncedStats.lastSync}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="pt-1 flex items-center justify-end">
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
            href="/drive"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Mở trong Tệp của tôi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/drive"
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
            href="/drive"
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
            href="/drive"
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
              checked={autoBackup}
              onCheckedChange={(val) => {
                setAutoBackup(val);
                toast.success(val ? "Đã bật tự động sao lưu ảnh" : "Đã tắt tự động sao lưu ảnh");
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

          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 p-1 rounded-btn bg-surface-2 border border-border my-2">
            <button
              type="button"
              onClick={() => setModalTab("qr")}
              className={`py-1.5 text-xs font-semibold rounded-btn transition-colors ${
                modalTab === "qr"
                  ? "bg-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {vi.mobileBackup.qrPairTab}
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
              {vi.mobileBackup.manualPairTab}
            </button>
          </div>

          {modalTab === "qr" ? (
            <div className="space-y-4">
              {/* QR Code Graphic Mockup */}
              <div className="p-4 rounded-card bg-surface-2 border border-border flex flex-col items-center justify-center space-y-3">
                <div className="h-44 w-44 rounded-xl bg-white p-3 border flex items-center justify-center shadow-xs">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                    {/* Simulated QR Code matrix */}
                    <rect x="10" y="10" width="24" height="24" fill="#0F172A" />
                    <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                    <rect x="18" y="18" width="8" height="8" fill="#0F172A" />

                    <rect x="66" y="10" width="24" height="24" fill="#0F172A" />
                    <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                    <rect x="74" y="18" width="8" height="8" fill="#0F172A" />

                    <rect x="10" y="66" width="24" height="24" fill="#0F172A" />
                    <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                    <rect x="18" y="74" width="8" height="8" fill="#0F172A" />

                    <rect x="40" y="15" width="6" height="6" fill="#0F172A" />
                    <rect x="50" y="25" width="6" height="6" fill="#0F172A" />
                    <rect x="42" y="38" width="16" height="6" fill="#2563EB" />
                    <rect x="45" y="48" width="10" height="10" fill="#0F172A" />
                    <rect x="65" y="45" width="8" height="8" fill="#0F172A" />
                    <rect x="25" y="45" width="8" height="8" fill="#0F172A" />
                    <rect x="45" y="70" width="12" height="6" fill="#0F172A" />
                    <rect x="65" y="70" width="15" height="15" fill="#0F172A" />
                  </svg>
                </div>

                <div className="text-center space-y-1.5 w-full">
                  <span className="text-[11px] text-muted-foreground block">
                    Mã liên kết xác thực nhanh (hiệu lực 10 phút):
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs font-mono font-bold bg-muted px-3 py-1 rounded text-primary inline-block">
                      {pairingCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyCodeToClipboard}
                      className="p-1 h-7 w-7 rounded-btn hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                      title="Sao chép mã"
                    >
                      {copiedCode ? <Check className="h-3.5 w-3.5 text-semantic-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={refreshPairingCode}
                      className="p-1 h-7 w-7 rounded-btn hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                      title="Tạo mã mới"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">3 bước đơn giản:</p>
                <p>1. Cài đặt ứng dụng CloudBox (file APK trên Android hoặc PWA trên iOS Safari).</p>
                <p>2. Mở ứng dụng và chọn &quot;Quét mã liên kết nhanh&quot;.</p>
                <p>3. Cấp quyền truy cập Ảnh và bắt đầu sao lưu tự động.</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleSimulateScanPairing}
                  disabled={isLinking}
                  className="w-full h-9 rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isLinking ? "Đang liên kết thiết bị..." : vi.mobileBackup.simulatePairing}</span>
                </Button>
              </div>
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
    </div>
  );
}
