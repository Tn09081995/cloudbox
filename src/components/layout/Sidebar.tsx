"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  HardDrive,
  Trash2,
  Settings,
  Upload,
  FolderPlus,
  X,
  Smartphone,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuotaUsageBar } from "@/components/quota/QuotaUsageBar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  usedBytes: number;
  quotaBytes: number;
  onOpenUpload: () => void;
  onOpenCreateFolder: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  usedBytes,
  quotaBytes,
  onOpenUpload,
  onOpenCreateFolder,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Tệp của tôi",
      href: "/drive",
      icon: HardDrive,
      active: pathname.startsWith("/drive"),
    },
    {
      title: "Thùng rác",
      href: "/trash",
      icon: Trash2,
      active: pathname === "/trash",
    },
    {
      title: "Cài đặt",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card px-4 py-5 shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-2 mb-6">
          <Link
            href="/drive"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
            onClick={onCloseMobile}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Cloud className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              CloudBox
            </span>
          </Link>
          {onCloseMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={onCloseMobile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-6">
          <Button
            onClick={() => {
              onOpenUpload();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full justify-center gap-2 rounded-xl shadow-md h-10 font-semibold"
          >
            <Upload className="h-4 w-4" />
            <span>Tải tệp lên</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              onOpenCreateFolder();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full justify-center gap-2 rounded-xl h-10"
          >
            <FolderPlus className="h-4 w-4 text-amber-500" />
            <span>Thư mục mới</span>
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  item.active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    item.active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Android App Download Banner */}
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent p-3 mt-4 mb-2">
          <div className="flex items-center gap-2 mb-1.5">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground">App Android (APK)</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
            Cài đặt trực tiếp lên điện thoại để đồng bộ ảnh và tệp nhanh chóng.
          </p>
          <a
            href="/cloudbox.apk"
            download="CloudBox.apk"
            className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Tải App APK</span>
          </a>
        </div>

        {/* Storage Quota Widget */}
        <div className="pt-3 border-t mt-auto">
          <QuotaUsageBar usedBytes={usedBytes} quotaBytes={quotaBytes} />
        </div>
      </aside>
    </>
  );
}
