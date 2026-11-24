"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  User,
  Palette,
  ShieldCheck,
  HardDrive,
  Smartphone,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  QrCode,
  LogOut,
  Download,
  Camera,
  Trash2,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStorageUsage, useFileMutations, useFolderFiles } from "@/lib/hooks/useFiles";
import { useAuthStore } from "@/lib/hooks/useAuthStore";
import { formatBytes, formatRelativeDate } from "@/lib/utils/formatters";
import { FILE_KIND_CONFIGS } from "@/lib/utils/file-types";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";
import QRCode from "qrcode";

type SettingsTab = "profile" | "appearance" | "security" | "storage" | "apps";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { theme, setTheme } = useTheme();
  const { data: storage } = useStorageUsage();
  const { resetData, deleteAllPhotos } = useFileMutations();
  const { data: allNodes = [] } = useFolderFiles(null);
  const { user, updateProfile } = useAuthStore();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.name || "Nguyễn Minh Anh");
  const [email, setEmail] = useState(user?.email || "minhanh.nguyen@cloudbox.vn");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const role = "Cá nhân / Quản trị viên";
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever user in auth store changes
  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "NA";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Vui lòng chọn ảnh có dung lượng dưới 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        toast.info("Đã chọn ảnh mới. Hãy nhấn 'Lưu thay đổi' để hoàn tất.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Appearance State
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Security State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFaQrUrl, setTwoFaQrUrl] = useState<string>("");

  useEffect(() => {
    if (!show2FASetup) return;
    const otpUri = `otpauth://totp/CloudBox:${encodeURIComponent(email || "user@cloudbox.com")}?secret=JBSWY3DPEHPK3PXP&issuer=CloudBox`;
    QRCode.toDataURL(otpUri, { width: 160, margin: 1 })
      .then(setTwoFaQrUrl)
      .catch(() => {});
  }, [show2FASetup, email]);

  // Storage data
  const used = storage?.usedBytes || 18400000;
  const quota = storage?.totalBytes || 214748364800; // 200 GB
  const percentage = Math.max(1, Math.round((used / quota) * 100));

  // Find 5 largest files
  const largestFiles = [...allNodes]
    .filter((n) => n.kind !== "folder")
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    if (!email.trim()) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: fullName.trim(),
        email: email.trim(),
        avatar: avatar || undefined,
      });
      toast.success(vi.settings.profileSaved);
    } catch {
      toast.error("Có lỗi xảy ra khi lưu thông tin");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetData = async () => {
    if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu ban đầu không? Mọi thay đổi sẽ được làm mới.")) {
      try {
        await resetData();
        toast.success(vi.settings.resetSuccess);
      } catch {
        toast.error("Không thể đặt lại dữ liệu");
      }
    }
  };

  const handleDeleteAllPhotos = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ ảnh trên CloudBox không? Thư viện ảnh sẽ được dọn sạch hoàn toàn.")) {
      try {
        await deleteAllPhotos();
        toast.success("Đã xóa sạch tất cả ảnh trên toàn bộ hệ thống!");
      } catch {
        toast.error("Không thể xóa ảnh");
      }
    }
  };

  const handleLogoutOtherSessions = () => {
    toast.success("Đã đăng xuất khỏi tất cả 2 thiết bị khác thành công!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          {vi.settings.title}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {vi.settings.subtitle}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-primary text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <User className="h-4 w-4" />
          <span>{vi.settings.tabs.profile}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "appearance"
              ? "bg-primary text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>{vi.settings.tabs.appearance}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "security"
              ? "bg-primary text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{vi.settings.tabs.security}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("storage")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "storage"
              ? "bg-primary text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <HardDrive className="h-4 w-4" />
          <span>{vi.settings.tabs.storage}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("apps")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "apps"
              ? "bg-primary text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>{vi.settings.tabs.apps}</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-in fade-in duration-cb max-w-2xl">
          <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-6">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="h-16 w-16 rounded-full bg-primary-soft text-primary font-bold text-xl flex items-center justify-center border-2 border-primary/20 overflow-hidden flex-shrink-0">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Đổi ảnh đại diện"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-base text-foreground">
                  {fullName}
                </h3>
                <p className="text-xs text-muted-foreground">{email}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Thay đổi ảnh đại diện
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatar("");
                        toast.info("Đã gỡ ảnh đại diện. Nhấn 'Lưu thay đổi' để hoàn tất.");
                      }}
                      className="text-xs text-semantic-danger hover:underline font-medium flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Gỡ ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullname" className="text-xs font-semibold">
                  {vi.settings.fullName}
                </Label>
                <Input
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-btn text-xs h-9 bg-surface-2"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  {vi.settings.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-btn text-xs h-9 bg-surface-2"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold">
                  Vai trò / Gói dịch vụ
                </Label>
                <Input
                  id="role"
                  value={role}
                  disabled
                  className="rounded-btn text-xs h-9 bg-surface-2 opacity-80 cursor-not-allowed"
                />
              </div>

              <Button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold h-9 px-5 mt-2 shadow-xs"
              >
                {isSavingProfile ? "Đang lưu..." : vi.settings.saveChanges}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Appearance */}
      {activeTab === "appearance" && (
        <div className="space-y-6 animate-in fade-in duration-cb max-w-2xl">
          <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-6">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {vi.settings.theme}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Tùy chỉnh giao diện hiển thị phù hợp với thị giác của bạn
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center p-4 rounded-card border-2 transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary-soft/20 text-primary shadow-xs"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-surface-2"
                  }`}
                >
                  <Sun className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">{vi.settings.themeLight}</span>
                </button>

                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center p-4 rounded-card border-2 transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary-soft/20 text-primary shadow-xs"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-surface-2"
                  }`}
                >
                  <Moon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">{vi.settings.themeDark}</span>
                </button>

                {/* System Mode */}
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center p-4 rounded-card border-2 transition-all ${
                    theme === "system"
                      ? "border-primary bg-primary-soft/20 text-primary shadow-xs"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-surface-2"
                  }`}
                >
                  <Laptop className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">{vi.settings.themeSystem}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {vi.settings.density}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Khoảng cách giữa các hàng và thẻ tệp tin
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDensity("comfortable")}
                  className={`flex items-center gap-3 p-3.5 rounded-card border-2 text-left transition-all ${
                    density === "comfortable"
                      ? "border-primary bg-primary-soft/20 text-primary shadow-xs"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-surface-2"
                  }`}
                >
                  <div className="h-8 w-8 rounded-btn bg-surface flex items-center justify-center border font-bold">
                    C
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{vi.settings.densityComfortable}</p>
                    <p className="text-[11px] text-muted-foreground">Khoảng cách thoáng, dễ nhìn</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDensity("compact")}
                  className={`flex items-center gap-3 p-3.5 rounded-card border-2 text-left transition-all ${
                    density === "compact"
                      ? "border-primary bg-primary-soft/20 text-primary shadow-xs"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-surface-2"
                  }`}
                >
                  <div className="h-8 w-8 rounded-btn bg-surface flex items-center justify-center border font-bold">
                    G
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{vi.settings.densityCompact}</p>
                    <p className="text-[11px] text-muted-foreground">Hiển thị nhiều mục cùng lúc hơn</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-in fade-in duration-cb max-w-3xl">
          {/* 2FA Section */}
          <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {vi.settings.twoFactor}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bảo vệ tài khoản bằng mã xác thực 6 chữ số từ ứng dụng Google Authenticator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextState = !is2FAEnabled;
                  setIs2FAEnabled(nextState);
                  if (nextState) setShow2FASetup(true);
                  else setShow2FASetup(false);
                  toast.success(nextState ? "Đã bật xác thực 2 lớp" : "Đã tắt xác thực 2 lớp");
                }}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  is2FAEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    is2FAEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {show2FASetup && (
              <div className="p-4 rounded-btn bg-surface-2 border border-border space-y-3 mt-3 animate-in fade-in">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded bg-white p-2 border flex items-center justify-center shadow-xs">
                    {twoFaQrUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={twoFaQrUrl} alt="2FA QR Code" className="h-16 w-16 object-contain" />
                    ) : (
                      <QrCode className="h-16 w-16 text-black" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      Quét mã QR bằng ứng dụng Authenticator
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Hoặc nhập mã khóa bí mật thủ công:
                    </p>
                    <code className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded text-primary inline-block">
                      CLBX-7789-9941-KMXA
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Sessions Section */}
          <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {vi.settings.activeSessions}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Các thiết bị và trình duyệt hiện đang đăng nhập vào tài khoản của bạn
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogoutOtherSessions}
                className="text-xs font-semibold rounded-btn border-border hover:bg-surface-2"
              >
                <LogOut className="h-3.5 w-3.5 mr-1 text-semantic-danger" />
                <span>Đăng xuất thiết bị khác</span>
              </Button>
            </div>

            <div className="divide-y divide-border pt-1">
              {/* Session 1 */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-btn bg-primary-soft text-primary flex items-center justify-center">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        Windows 11 · Chrome 130
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-semantic-success/10 text-semantic-success font-bold">
                        Thiết bị này
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Hà Nội, Việt Nam · IP: 14.162.18.9 · Đang hoạt động
                    </p>
                  </div>
                </div>
              </div>

              {/* Session 2 */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-btn bg-surface-2 text-muted-foreground flex items-center justify-center">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      iPhone 15 Pro · Safari 18
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      TP. Hồ Chí Minh · IP: 113.190.22.5 · 2 giờ trước
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Storage */}
      {activeTab === "storage" && (
        <div className="space-y-6 animate-in fade-in duration-cb max-w-3xl">
          {/* Quota Overview Card */}
          <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {vi.settings.storageUsage}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gói cá nhân 200 GB tiêu chuẩn
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-foreground">
                {formatBytes(used)} / {formatBytes(quota)} ({percentage}%)
              </span>
            </div>

            {/* Segmented Breakdown Bar */}
            <div className="h-3.5 w-full rounded-full bg-surface-2 border border-border overflow-hidden flex">
              <div style={{ width: "45%" }} className="bg-blue-500" title="Hình ảnh: 8,4 MB" />
              <div style={{ width: "23%" }} className="bg-purple-500" title="Video: 4,2 MB" />
              <div style={{ width: "17%" }} className="bg-emerald-500" title="Tài liệu: 3,1 MB" />
              <div style={{ width: "15%" }} className="bg-amber-500" title="Tệp nén: 2,7 MB" />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-muted-foreground">Hình ảnh: 8,4 MB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500 flex-shrink-0" />
                <span className="text-muted-foreground">Video: 4,2 MB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-muted-foreground">Tài liệu: 3,1 MB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-muted-foreground">Tệp nén: 2,7 MB</span>
              </div>
            </div>
          </div>

          {/* Largest Files Card */}
          <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-4">
            <h3 className="font-semibold text-sm text-foreground">
              {vi.settings.largestFiles}
            </h3>
            <div className="divide-y divide-border">
              {largestFiles.map((file) => {
                const cfg = FILE_KIND_CONFIGS[file.kind] || FILE_KIND_CONFIGS.other;
                return (
                  <div
                    key={file.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cfg.bgTile, color: cfg.color }}
                      >
                        <span className="text-[9px] font-bold uppercase font-mono">
                          {file.name.split(".").pop()?.slice(0, 3) || "DAT"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {formatRelativeDate(file.updated_at)}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums font-semibold text-foreground flex-shrink-0">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Apps & PWA */}
      {activeTab === "apps" && (
        <div className="space-y-6 animate-in fade-in duration-cb max-w-2xl">
          <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-card bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">
                  Ứng dụng Android APK
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cài đặt trực tiếp ứng dụng CloudBox lên điện thoại Android để đồng bộ ảnh và tệp nhanh chóng.
                </p>
              </div>
            </div>

            <a
              href="/cloudbox.apk"
              download="CloudBox.apk"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn bg-primary text-white text-xs font-semibold hover:bg-primary-ink shadow-xs transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Tải file APK (Android)</span>
            </a>
          </div>

          <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-card bg-surface-2 text-foreground flex items-center justify-center flex-shrink-0">
                <Laptop className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">
                  Ứng dụng Web Tiến bộ (PWA)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cài đặt CloudBox trực tiếp vào thanh tác vụ máy tính hoặc màn hình chính điện thoại mà không cần tải qua chợ ứng dụng.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => toast.success("Biểu tượng cài đặt đã sẵn sàng trên thanh địa chỉ trình duyệt!")}
              variant="outline"
              className="rounded-btn text-xs font-semibold h-9"
            >
              Cài đặt PWA trên máy
            </Button>
          </div>
        </div>
      )}

      {/* Quick Action: Purge All Photos */}
      <div className="pt-6 border-t border-border max-w-2xl space-y-3">
        <div className="p-4 rounded-card bg-surface-2 border border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-btn bg-semantic-danger/10 text-semantic-danger flex items-center justify-center flex-shrink-0">
              <ImageOff className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Xóa tất cả ảnh trên CloudBox
              </p>
              <p className="text-[11px] text-muted-foreground">
                Dọn sạch hoàn toàn tất cả hình ảnh trong thư viện đám mây và đồng bộ 0 ảnh.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeleteAllPhotos}
            className="rounded-btn text-xs font-semibold text-semantic-danger border-semantic-danger/30 hover:bg-semantic-danger hover:text-white hover:border-semantic-danger transition-colors flex-shrink-0"
          >
            Xóa tất cả ảnh
          </Button>
        </div>

        {/* Global Reset Seed Data Action */}
        <div className="p-4 rounded-card bg-surface-2 border border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-btn bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {vi.settings.resetData}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {vi.settings.resetDesc}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetData}
            className="rounded-btn text-xs font-semibold hover:bg-semantic-danger hover:text-white hover:border-semantic-danger transition-colors flex-shrink-0"
          >
            {vi.settings.resetAction}
          </Button>
        </div>
      </div>
    </div>
  );
}
