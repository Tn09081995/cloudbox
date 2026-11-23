"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  Search,
  Plus,
  HelpCircle,
  Settings,
  Sun,
  Moon,
  Laptop,
  Download,
  X,
  Share2,
  Trash2,
  Star,
  FolderInput,
  Cloud,
  Check,
  User,
  LogOut,
  Smartphone,
  Upload,
  FolderPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useAuthStore } from "@/lib/hooks/useAuthStore";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TopBar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const {
    setSidebarCollapsed,
    setMobileMenuOpen,
    setCommandPaletteOpen,
    selectedIds,
    clearSelection,
    setShareTargetId,
    setMoveTargetIds,
    setNewFolderOpen,
  } = useUiStore();

  const { trash, toggleStar } = useFileMutations();
  const [helpOpen, setHelpOpen] = useState(false);

  const isSelectionActive = selectedIds.length > 0;

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất khỏi tài khoản thành công!");
    router.push("/login");
  };

  const handleBatchTrash = async () => {
    try {
      await trash(selectedIds);
      toast.success(`Đã chuyển ${selectedIds.length} mục vào thùng rác`);
      clearSelection();
    } catch {
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  const handleBatchStar = async () => {
    try {
      for (const id of selectedIds) {
        await toggleStar(id);
      }
      toast.success(`Đã cập nhật dấu sao cho ${selectedIds.length} mục`);
      clearSelection();
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "CB";

  return (
    <TooltipProvider delayDuration={250}>
      <header className="h-16 w-full px-3 md:px-5 flex items-center justify-between gap-3 bg-background z-30 flex-shrink-0 transition-colors">
        {isSelectionActive ? (
          /* ======================================================== */
          /* SELECTION MODE BAR (Google Photos / Google Drive style) */
          /* ======================================================== */
          <div className="flex-1 flex items-center justify-between px-3 md:px-4 h-12 rounded-full bg-primary-soft text-primary-ink shadow-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearSelection}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-primary-ink transition-colors"
                title="Bỏ chọn tất cả"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="text-sm md:text-base font-semibold text-primary-ink">
                Đã chọn {selectedIds.length} mục
              </span>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Đang tải xuống ${selectedIds.length} tệp...`);
                }}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-primary-ink transition-colors"
                title="Tải xuống các mục đã chọn"
              >
                <Download className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedIds[0]) setShareTargetId(selectedIds[0]);
                }}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-primary-ink transition-colors"
                title="Chia sẻ"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setMoveTargetIds(selectedIds)}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-primary-ink transition-colors"
                title="Di chuyển"
              >
                <FolderInput className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleBatchStar}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-primary-ink transition-colors"
                title="Gắn dấu sao"
              >
                <Star className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleBatchTrash}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-semantic-danger transition-colors"
                title="Chuyển vào thùng rác"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STANDARD MATERIAL YOU TOP BAR */
          /* ======================================================== */
          <>
            {/* Left: ☰ Menu Toggle + CloudBox Logo */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setMobileMenuOpen(true);
                  } else {
                    setSidebarCollapsed((prev) => !prev);
                  }
                }}
                className="p-2 rounded-full text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                aria-label="Thu/mở menu điều hướng"
                title="Thu/mở menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link
                href="/drive"
                className="flex items-center gap-2.5 group select-none pr-2"
                aria-label="Trang chủ CloudBox"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                  <Cloud className="h-5 w-5 fill-primary text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground flex items-center">
                  Cloud<span className="text-primary font-extrabold">Box</span>
                </span>
              </Link>
            </div>

            {/* Center: Long pill search bar (Material You) */}
            <div className="flex-1 max-w-2xl px-2">
              <div
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-3 h-11 px-4 rounded-full bg-surface-2 hover:bg-surface-variant/80 border border-transparent text-muted hover:text-foreground transition-all duration-cb cursor-pointer shadow-xs"
                role="searchbox"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setCommandPaletteOpen(true);
                  }
                }}
              >
                <Search className="h-4 w-4 text-muted flex-shrink-0" />
                <span className="text-xs md:text-sm font-normal text-muted truncate flex-1">
                  Tìm trong CloudBox (Ctrl + K)
                </span>
              </div>
            </div>

            {/* Right: + Tải lên, Tải APK, Trợ giúp, Cài đặt, Theme, Avatar */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              {/* + Tải lên Pill Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-fg hover:opacity-95 shadow-xs font-medium text-xs transition-transform active:scale-95"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>Tải lên</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl bg-surface border border-border shadow-lg">
                  <DropdownMenuItem
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files.length > 0) {
                          toast.success(`Đã thêm ${files.length} tệp vào hàng đợi tải lên`);
                        }
                      };
                      input.click();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium"
                  >
                    <Upload className="h-4 w-4 text-primary" />
                    <span>Tải tệp lên</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.webkitdirectory = true;
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files.length > 0) {
                          toast.success(`Đã thêm thư mục với ${files.length} tệp`);
                        }
                      };
                      input.click();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium"
                  >
                    <Upload className="h-4 w-4 text-kind-folder" />
                    <span>Tải thư mục lên</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-border" />

                  <DropdownMenuItem
                    onClick={() => setNewFolderOpen(true)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium"
                  >
                    <FolderPlus className="h-4 w-4 text-kind-folder" />
                    <span>Thư mục mới</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tải APK Button (Android) */}
              <a
                href="/cloudbox.apk"
                download="CloudBox.apk"
                className="hidden lg:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-surface-2 hover:bg-surface-variant text-foreground text-[11px] font-medium border border-border/50 transition-colors"
                title="Tải ứng dụng Android APK"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span>Tải APK</span>
              </a>

              {/* Trợ giúp (Help) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setHelpOpen(true)}
                    className="p-2 h-9 w-9 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                    aria-label="Trợ giúp"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Trợ giúp & Hướng dẫn</TooltipContent>
              </Tooltip>

              {/* Cài đặt (Settings) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    className="p-2 h-9 w-9 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                    aria-label="Cài đặt"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">Cài đặt</TooltipContent>
              </Tooltip>

              {/* Chuyển sáng/tối (Theme toggle) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 h-9 w-9 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-2 transition-colors relative"
                    aria-label="Giao diện sáng/tối"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 p-1 rounded-2xl bg-surface border border-border shadow-lg">
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-xl cursor-pointer font-medium"
                  >
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Sáng</span>
                    {theme === "light" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-xl cursor-pointer font-medium"
                  >
                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Tối</span>
                    {theme === "dark" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-xl cursor-pointer font-medium"
                  >
                    <Laptop className="h-3.5 w-3.5 text-muted" />
                    <span>Hệ thống</span>
                    {theme === "system" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Avatar tròn có viền gradient (Google style) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-500 hover:scale-105 transition-transform ml-1 focus-visible:ring-2 focus-visible:ring-primary outline-none"
                    aria-label="Tài khoản cá nhân"
                  >
                    <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center overflow-hidden text-xs font-bold text-primary">
                      {user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl bg-surface border border-border shadow-xl font-sans">
                  <div className="px-3 py-2 border-b border-border/70 mb-1">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.name || "Người dùng"}</p>
                    <p className="text-[11px] text-muted truncate">{user?.email || "tuananh@cloudbox.vn"}</p>
                  </div>

                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium"
                  >
                    <User className="h-4 w-4 text-muted" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/backup")}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium"
                  >
                    <Smartphone className="h-4 w-4 text-muted" />
                    <span>Sao lưu từ điện thoại</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium"
                  >
                    <Settings className="h-4 w-4 text-muted" />
                    <span>Cài đặt ứng dụng</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-border" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium text-semantic-danger focus:text-semantic-danger"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}

        {/* Trợ giúp Dialog */}
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogContent className="max-w-md p-6 rounded-3xl bg-surface border border-border shadow-xl">
            <DialogHeader>
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <HelpCircle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Trợ giúp & Hướng dẫn sử dụng CloudBox
              </DialogTitle>
              <DialogDescription className="text-xs text-muted leading-relaxed">
                CloudBox là không gian lưu trữ cá nhân phong cách Material You, lấy cảm hứng từ Google Photos và Google Drive.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs text-muted">
              <div className="p-3 rounded-2xl bg-surface-2 space-y-1">
                <p className="font-semibold text-foreground">Phím tắt nhanh:</p>
                <p>• <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono text-[10px]">Ctrl + K</kbd> : Mở ô tìm kiếm & lệnh nhanh</p>
                <p>• <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono text-[10px]">Esc</kbd> : Đóng trình xem ảnh / hộp thoại</p>
                <p>• <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono text-[10px]">← / →</kbd> : Chuyển ảnh trong chế độ xem toàn màn hình</p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-2 space-y-1">
                <p className="font-semibold text-foreground">Thao tác chọn tệp:</p>
                <p>Di chuột lên thẻ ảnh hoặc tệp, tích vào ô tròn ở góc trên trái để chọn nhiều tệp và thanh công cụ sẽ tự động xuất hiện.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>
    </TooltipProvider>
  );
}
