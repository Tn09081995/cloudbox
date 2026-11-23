"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardDrive,
  Clock,
  Star,
  Image as ImageIcon,
  FileText,
  Lock,
  Trash2,
  Plus,
  Cloud,
  FolderPlus,
  Upload,
  X,
  Sparkles,
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
import { useStorageUsage } from "@/lib/hooks/useFiles";
import { formatBytes } from "@/lib/utils/formatters";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const {
    sidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    setNewFolderOpen,
    setNewTextFileOpen,
  } = useUiStore();

  const isExpanded = !sidebarCollapsed || isHovered;

  const { data: storage } = useStorageUsage();
  const [buyStorageOpen, setBuyStorageOpen] = useState(false);

  // Storage calculation
  const used = storage?.usedBytes || 12400000000; // 12,4 GB
  const quota = storage?.totalBytes || 214748364800; // 200 GB
  const percentage = Math.min(100, Math.max(6, Math.round((used / quota) * 100)));

  const navItems = [
    {
      href: "/drive",
      label: "Tệp của tôi",
      icon: HardDrive,
      active: pathname === "/drive" || pathname.startsWith("/drive/"),
    },
    {
      href: "/recent",
      label: "Gần đây",
      icon: Clock,
      active: pathname === "/recent",
    },
    {
      href: "/starred",
      label: "Có gắn dấu sao",
      icon: Star,
      active: pathname === "/starred",
    },
    {
      href: "/photos",
      label: "Ảnh & Video",
      icon: ImageIcon,
      active: pathname === "/photos",
    },
    {
      href: "/documents",
      label: "Tài liệu",
      icon: FileText,
      active: pathname === "/documents",
    },
    {
      href: "/locked",
      label: "Thư mục khóa",
      icon: Lock,
      active: pathname === "/locked",
    },
    {
      href: "/trash",
      label: "Thùng rác",
      icon: Trash2,
      active: pathname === "/trash",
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      {/* ======================================================== */}
      {/* DESKTOP / TABLET SIDEBAR */}
      {/* ======================================================== */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-out bg-background select-none ${
          isExpanded ? "w-[240px] xl:w-[260px] shadow-sm" : "w-[72px]"
        } ${className}`}
      >
        <div className="flex-1 flex flex-col justify-between p-3 overflow-y-auto overflow-x-hidden">
          <div className="space-y-4">
            {/* Google Drive "+ Mới" Pill Button */}
            <div className="pt-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-3 rounded-full bg-surface hover:bg-surface-2 text-foreground border border-border/60 shadow-md hover:shadow-lg transition-all duration-cb active:scale-95 ${
                      !isExpanded
                        ? "h-12 w-12 justify-center mx-auto"
                        : "h-12 px-5 w-full font-medium"
                    }`}
                    title="Tạo mới hoặc tải lên"
                  >
                    <Plus className="h-5 w-5 text-primary stroke-[2.5] flex-shrink-0" />
                    {isExpanded && (
                      <span className="text-sm font-semibold tracking-tight">
                        Mới
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={!isExpanded ? "center" : "start"}
                  side={!isExpanded ? "right" : "bottom"}
                  className="w-56 p-1.5 rounded-2xl bg-surface border border-border shadow-xl font-sans"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files.length > 0) {
                          toast.success(`Đã thêm ${files.length} tệp để tải lên`);
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

                  <DropdownMenuItem
                    onClick={() => setNewTextFileOpen(true)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium"
                  >
                    <FileText className="h-4 w-4 text-kind-document" />
                    <span>Tệp văn bản mới</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Navigation List (Material You Pill items) */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const linkContent = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 h-10 px-3.5 rounded-full text-xs font-medium transition-colors ${
                      !isExpanded ? "justify-center px-0 w-10 mx-auto" : "w-full"
                    } ${
                      item.active
                        ? "bg-nav-active text-nav-active-foreground font-semibold"
                        : "text-foreground hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${item.active ? "text-primary stroke-[2.5]" : ""}`} />
                    {isExpanded && <span className="truncate">{item.label}</span>}
                  </Link>
                );

                if (!isExpanded) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" className="font-sans text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </nav>
          </div>

          {/* Bottom Section: Divider, Storage Meter & Mua thêm dung lượng */}
          <div className="pt-4 space-y-3">
            <hr className="border-border/60" />

            {!isExpanded ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setBuyStorageOpen(true)}
                    className="w-10 h-10 mx-auto rounded-full bg-surface hover:bg-surface-2 flex items-center justify-center text-primary transition-colors"
                  >
                    <Cloud className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {formatBytes(used)} / {formatBytes(quota)}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="px-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Dung lượng</span>
                  <span className="text-foreground font-mono text-[11px]">
                    {formatBytes(used)} / {formatBytes(quota)}
                  </span>
                </div>

                {/* Material Thin Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-surface-variant overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Đã sử dụng {percentage}% bộ nhớ
                </p>

                {/* Mua thêm dung lượng Pill Button */}
                <button
                  type="button"
                  onClick={() => setBuyStorageOpen(true)}
                  className="w-full mt-1 py-1.5 px-3 rounded-full border border-primary/40 text-primary hover:bg-primary-soft/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Mua thêm dung lượng</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE DRAWER */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-72 max-w-[85vw] bg-surface h-full flex flex-col p-4 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <Link
                href="/drive"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Cloud className="h-4 w-4 fill-primary text-primary" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  Cloud<span className="text-primary">Box</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full text-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 h-11 px-4 rounded-full text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-nav-active text-nav-active-foreground font-semibold"
                        : "text-foreground hover:bg-surface-2 text-muted"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${item.active ? "text-primary stroke-[2.5]" : ""}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Storage Info */}
            <div className="p-3 rounded-2xl bg-surface-2 space-y-2 border border-border/50 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span>Dung lượng</span>
                <span className="font-mono text-[11px]">
                  {formatBytes(used)} / {formatBytes(quota)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mua thêm dung lượng Dialog */}
      <Dialog open={buyStorageOpen} onOpenChange={setBuyStorageOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-surface border border-border shadow-xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Cloud className="h-5 w-5 fill-primary text-primary" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Nâng cấp gói dung lượng CloudBox
            </DialogTitle>
            <DialogDescription className="text-xs text-muted leading-relaxed">
              Nhận thêm dung lượng lưu trữ an toàn cho ảnh, video và toàn bộ tệp tin của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-4 rounded-2xl border-2 border-primary bg-primary-soft/20 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">Gói Tiêu Chuẩn 200 GB</p>
                <p className="text-muted">Đang sử dụng · Miễn phí theo tài khoản</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold">
                Hiện tại
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-surface-2 hover:border-primary/50 transition-colors flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">Gói Mở Rộng 2 TB (2.000 GB)</p>
                <p className="text-muted">45.000 đ / tháng · Sao lưu không giới hạn</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toast.success("Đã chọn gói 2 TB! Tính năng thanh toán sẽ mở trong giai đoạn sau.");
                  setBuyStorageOpen(false);
                }}
                className="px-3 py-1.5 rounded-full bg-primary text-white font-semibold text-xs hover:bg-primary-ink"
              >
                Nâng cấp
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
