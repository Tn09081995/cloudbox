"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardDrive,
  Clock,
  Star,
  Users,
  Trash2,
  Settings,
  ChevronRight,
  ChevronDown,
  Folder,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { CloudBoxLogo } from "./CloudBoxLogo";
import { NewMenuButton } from "./NewMenuButton";
import { StorageMeter } from "./StorageMeter";
import { InstallAppCard } from "./InstallAppCard";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { vi } from "@/lib/i18n/vi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FolderItem {
  id: string;
  name: string;
  color?: string;
  children?: FolderItem[];
}

// Sample folder hierarchy for tree view in sidebar
const MOCK_FOLDER_TREE: FolderItem[] = [
  {
    id: "folder-work",
    name: "Tài liệu công việc",
    color: "#F5A524",
    children: [
      { id: "folder-projects", name: "Dự án CloudBox", color: "#3B82F6" },
      { id: "folder-contracts", name: "Hợp đồng & Pháp lý", color: "#10B981" },
    ],
  },
  {
    id: "folder-design",
    name: "Hình ảnh & Đồ họa",
    color: "#8B5CF6",
    children: [
      { id: "folder-brand", name: "Bộ nhận diện thương hiệu", color: "#EC4899" },
    ],
  },
  {
    id: "folder-personal",
    name: "Cá nhân & Gia đình",
    color: "#06B6D4",
  },
];

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useUiStore();

  const [folderTreeOpen, setFolderTreeOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "folder-work": true,
  });

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const navItems = [
    {
      href: "/drive",
      label: vi.nav.myDrive,
      icon: HardDrive,
      hasTree: true,
      active: pathname.startsWith("/drive"),
    },
    {
      href: "/recent",
      label: vi.nav.recent,
      icon: Clock,
      active: pathname === "/recent",
    },
    {
      href: "/starred",
      label: vi.nav.starred,
      icon: Star,
      active: pathname === "/starred",
    },
    {
      href: "/shared",
      label: vi.nav.shared,
      icon: Users,
      active: pathname === "/shared",
    },
    {
      href: "/trash",
      label: vi.nav.trash,
      icon: Trash2,
      active: pathname === "/trash",
    },
    {
      href: "/settings",
      label: vi.nav.settings,
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-surface border-r border-border transition-all duration-cb select-none ${
        sidebarCollapsed ? "w-[72px]" : "w-[264px]"
      } ${className}`}
    >
      {/* Header: Logo & Collapse Button */}
      <div
        className={`h-16 flex items-center justify-between border-b border-border/60 flex-shrink-0 ${
          sidebarCollapsed ? "px-3 justify-center" : "px-4"
        }`}
      >
        <CloudBoxLogo collapsed={sidebarCollapsed} />
        <div className="flex items-center gap-1">
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className={`hidden md:flex p-1.5 rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors ${
              sidebarCollapsed ? "mt-2" : ""
            }`}
            aria-label={sidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Primary Action Button: + Mới */}
      <div className={`p-3 flex-shrink-0 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
        <NewMenuButton collapsed={sidebarCollapsed} />
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
        <TooltipProvider delayDuration={150}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.active;

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`relative flex items-center justify-center h-10 w-10 mx-auto rounded-btn transition-colors group ${
                        isItemActive
                          ? "bg-primary-soft text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                      }`}
                      aria-label={item.label}
                    >
                      {isItemActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />
                      )}
                      <Icon className="h-4 w-4 stroke-[2]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={item.href}>
                <div className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-btn text-sm transition-all duration-cb ${
                      isItemActive
                        ? "bg-primary-soft text-primary font-medium shadow-none"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-2 font-normal"
                    }`}
                  >
                    {isItemActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />
                    )}
                    <Icon className="h-4 w-4 flex-shrink-0 stroke-[2]" />
                    <span className="truncate flex-1">{item.label}</span>

                    {item.hasTree && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFolderTreeOpen((prev) => !prev);
                        }}
                        className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                        aria-label="Mở rộng danh sách thư mục"
                      >
                        {folderTreeOpen ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </Link>
                </div>

                {/* Sub-tree for "Tệp của tôi" */}
                {item.hasTree && folderTreeOpen && (
                  <div className="ml-4 pl-2 my-1 border-l border-border/80 space-y-0.5">
                    {MOCK_FOLDER_TREE.map((folder) => {
                      const isFolderExpanded = !!expandedFolders[folder.id];
                      const hasSub = folder.children && folder.children.length > 0;
                      return (
                        <div key={folder.id}>
                          <Link
                            href={`/drive/${folder.id}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-btn text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors group"
                          >
                            {hasSub ? (
                              <button
                                type="button"
                                onClick={(e) => toggleFolder(folder.id, e)}
                                className="p-0.5 text-muted-foreground hover:text-foreground"
                              >
                                {isFolderExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                            ) : (
                              <span className="w-4" />
                            )}
                            <Folder
                              className="h-3.5 w-3.5 flex-shrink-0 fill-current"
                              style={{ color: folder.color || "#F5A524" }}
                            />
                            <span className="truncate">{folder.name}</span>
                          </Link>

                          {hasSub && isFolderExpanded && (
                            <div className="ml-5 pl-2 my-0.5 border-l border-border/60 space-y-0.5">
                              {folder.children?.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/drive/${sub.id}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center gap-2 px-2 py-1 rounded-btn text-[11px] text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                                >
                                  <Folder
                                    className="h-3 w-3 flex-shrink-0 fill-current"
                                    style={{ color: sub.color || "#3B82F6" }}
                                  />
                                  <span className="truncate">{sub.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Bottom Area: Storage meter & dismissible install app card */}
      <div
        className={`p-3 space-y-2 border-t border-border/60 flex-shrink-0 ${
          sidebarCollapsed ? "px-2" : "px-3"
        }`}
      >
        <InstallAppCard collapsed={sidebarCollapsed} />
        <StorageMeter collapsed={sidebarCollapsed} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 max-w-[280px] w-full bg-surface shadow-2xl h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
