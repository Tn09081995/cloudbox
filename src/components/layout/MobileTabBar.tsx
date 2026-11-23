"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardDrive,
  Clock,
  Image as ImageIcon,
  Settings,
  Plus,
  Upload,
  FolderPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { toast } from "sonner";

export function MobileTabBar() {
  const pathname = usePathname();
  const { setNewFolderOpen } = useUiStore();

  const tabs = [
    {
      href: "/drive",
      label: "Tệp",
      icon: HardDrive,
      active: pathname.startsWith("/drive"),
    },
    {
      href: "/photos",
      label: "Ảnh",
      icon: ImageIcon,
      active: pathname === "/photos",
    },
    {
      href: "/recent",
      label: "Gần đây",
      icon: Clock,
      active: pathname === "/recent",
    },
    {
      href: "/settings",
      label: "Cài đặt",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  return (
    <>
      {/* Mobile Floating Action Button (FAB) at bottom-right */}
      <div className="md:hidden fixed bottom-16 right-4 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-14 w-14 rounded-2xl bg-primary text-white shadow-fab flex items-center justify-center hover:bg-primary-ink active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Tạo mới hoặc tải lên"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52 p-1.5 rounded-2xl bg-surface border border-border shadow-xl font-sans mb-2">
            <DropdownMenuItem
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files.length > 0) {
                    toast.success(`Đã thêm ${files.length} tệp`);
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
              onClick={() => setNewFolderOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl cursor-pointer font-medium"
            >
              <FolderPlus className="h-4 w-4 text-kind-folder" />
              <span>Thư mục mới</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border px-3 py-1 flex items-center justify-around shadow-sm select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[11px] transition-colors ${
                tab.active
                  ? "text-primary font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <div
                className={`px-3.5 py-0.5 rounded-full mb-0.5 transition-colors ${
                  tab.active ? "bg-nav-active text-primary" : ""
                }`}
              >
                <Icon className="h-4 w-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
