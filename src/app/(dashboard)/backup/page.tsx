"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

export default function MobileBackupPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  // Backup configuration toggle states
  const [autoBackup, setAutoBackup] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [originalQuality, setOriginalQuality] = useState(true);
  const [appFolders, setAppFolders] = useState(true);
  const [freeUpSpace, setFreeUpSpace] = useState(false);

  // Simulated sync trigger
  const handleSync = () => {
    setIsSyncing(true);
    toast.info("Đang kiểm tra thư viện ảnh từ iPhone 15 Pro...");

    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Đã đồng bộ 4 ảnh mới từ điện thoại lên CloudBox thành công!");
    }, 1200);
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
            onClick={handleSync}
            disabled={isSyncing}
            className="rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold gap-1.5 h-9 shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? vi.mobileBackup.syncing : vi.mobileBackup.syncNow}</span>
          </Button>
        </div>
      </div>

      {/* Linked Devices Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
          {vi.mobileBackup.devicesHeading} (2)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Device 1: iPhone 15 Pro Max */}
          <div className="p-5 rounded-card bg-surface border border-primary/30 ring-1 ring-primary/20 shadow-card space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-card bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">
                      iPhone 15 Pro Max
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      Thiết bị chính
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">iOS 18.2 · Tên máy: Minh Anh&apos;s iPhone</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-[11px] font-semibold text-semantic-success bg-semantic-success/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đang kết nối</span>
              </span>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-btn bg-surface-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Battery className="h-4 w-4 text-emerald-500" />
                <span className="font-mono">88% Pin</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wifi className="h-4 w-4 text-primary" />
                <span className="truncate">FPT-5G</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                <HardDrive className="h-4 w-4 text-amber-500" />
                <span className="font-mono">148/256 GB</span>
              </div>
            </div>

            {/* Backup Stats */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Dữ liệu đã sao lưu:</span>
                <span className="font-bold text-foreground font-mono">
                  2.450 ảnh · 182 video (14,2 GB)
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Lần đồng bộ gần nhất:</span>
                <span className="font-semibold text-foreground">
                  Hôm nay lúc 15:20
                </span>
              </div>
            </div>
          </div>

          {/* Device 2: Samsung Galaxy S24 Ultra */}
          <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-card bg-surface-2 text-muted-foreground flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Samsung Galaxy S24 Ultra
                  </h3>
                  <p className="text-xs text-muted-foreground">One UI 7.0 · Android 15</p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                Chờ đồng bộ
              </span>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-btn bg-surface-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Battery className="h-4 w-4 text-emerald-500" />
                <span className="font-mono">94% Pin</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wifi className="h-4 w-4 text-primary" />
                <span className="truncate">Nhà riêng</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                <HardDrive className="h-4 w-4 text-amber-500" />
                <span className="font-mono">92/512 GB</span>
              </div>
            </div>

            {/* Backup Stats */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Dữ liệu đã sao lưu:</span>
                <span className="font-bold text-foreground font-mono">
                  820 ảnh · 45 video (4,6 GB)
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Lần đồng bộ gần nhất:</span>
                <span className="font-semibold text-foreground">
                  Hôm qua lúc 22:10
                </span>
              </div>
            </div>
          </div>
        </div>
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
              2.150 ảnh · 12,4 GB
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
              182 video · 8,6 GB
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
              380 ảnh · 1,2 GB
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
              410 tệp · 2,8 GB
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

      {/* Connect New Device Dialog (QR Code) */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-dialog bg-surface border border-border shadow-xl font-sans">
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

          {/* QR Code Graphic Mockup */}
          <div className="p-4 my-2 rounded-card bg-surface-2 border border-border flex flex-col items-center justify-center space-y-3">
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

            <div className="text-center space-y-1">
              <span className="text-[11px] text-muted-foreground block">
                Mã liên kết xác thực nhanh:
              </span>
              <code className="text-xs font-mono font-bold bg-muted px-2.5 py-1 rounded text-primary inline-block">
                CLBX-MOBILE-8842
              </code>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground pt-1">
            <p className="font-semibold text-foreground">3 bước đơn giản:</p>
            <p>1. Cài đặt ứng dụng CloudBox (file APK trên Android hoặc PWA trên iOS Safari).</p>
            <p>2. Mở ứng dụng và chọn &quot;Quét mã liên kết nhanh&quot;.</p>
            <p>3. Cấp quyền truy cập Ảnh và bắt đầu sao lưu tự động.</p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={() => {
                setConnectModalOpen(false);
                toast.success("Đã sẵn sàng kết nối thiết bị mới!");
              }}
              className="w-full h-9 rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold"
            >
              Hoàn tất
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
