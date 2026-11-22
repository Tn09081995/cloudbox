"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Folder,
  FileText,
  FolderPlus,
  FilePlus,
  Sun,
  Moon,
  HardDrive,
  Clock,
  Star,
  Users,
  Trash2,
  Settings,
  LayoutGrid,
  List,
} from "lucide-react";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useSearchFiles, useRecentFiles } from "@/lib/hooks/useFiles";
import { useTheme } from "next-themes";
import { formatBytes } from "@/lib/utils/formatters";
import { FILE_KIND_CONFIGS } from "@/lib/utils/file-types";
import { vi } from "@/lib/i18n/vi";

export function CommandPalette() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setNewFolderOpen,
    setNewTextFileOpen,
    setViewMode,
  } = useUiStore();

  const [query, setQuery] = useState("");
  const { data: searchResults = [] } = useSearchFiles(query);
  const { data: recentFiles = [] } = useRecentFiles();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-cb">
      <div
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-dialog bg-surface border border-border shadow-2xl overflow-hidden font-sans z-10 animate-in zoom-in-95 duration-cb">
        <Command label="Tìm kiếm CloudBox" className="w-full">
          {/* Search Input Box */}
          <div className="flex items-center gap-3 px-4 border-b border-border h-14 bg-surface">
            <Search className="h-5 w-5 text-muted flex-shrink-0" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Tìm kiếm tệp tin, thư mục hoặc gõ lệnh..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
            />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-surface-2 text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-border/60">
            <Command.Empty className="py-8 text-center text-xs text-muted-foreground">
              {vi.search.noResults}
            </Command.Empty>

            {/* If user is typing query: Show search results */}
            {query.trim().length > 0 && searchResults.length > 0 && (
              <Command.Group heading={vi.search.filesHeading} className="p-1 text-xs font-semibold text-muted-foreground">
                {searchResults.map((node) => {
                  const cfg = FILE_KIND_CONFIGS[node.kind] || FILE_KIND_CONFIGS.other;
                  return (
                    <Command.Item
                      key={node.id}
                      onSelect={() => {
                        setCommandPaletteOpen(false);
                        if (node.kind === "folder") router.push(`/drive/${node.id}`);
                        else router.push(`/drive?preview=${node.id}`);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
                    >
                      <div
                        className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cfg.bgTile, color: cfg.color }}
                      >
                        {node.kind === "folder" ? (
                          <Folder className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="truncate flex-1">{node.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                        {node.kind === "folder" ? "Thư mục" : formatBytes(node.size)}
                      </span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* When query is empty, show recent files */}
            {query.trim().length === 0 && recentFiles.length > 0 && (
              <Command.Group heading={vi.search.recentSearches} className="p-1 text-xs font-semibold text-muted-foreground">
                {recentFiles.slice(0, 4).map((node) => (
                  <Command.Item
                    key={`recent-${node.id}`}
                    onSelect={() => {
                      setCommandPaletteOpen(false);
                      if (node.kind === "folder") router.push(`/drive/${node.id}`);
                      else router.push(`/drive?preview=${node.id}`);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate flex-1">{node.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                      {formatBytes(node.size)}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Quick Actions Group */}
            <Command.Group heading={vi.search.actionsHeading} className="p-1 text-xs font-semibold text-muted-foreground">
              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  setNewFolderOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <FolderPlus className="h-4 w-4 text-kind-folder" />
                <span>{vi.actions.newFolder}</span>
                <kbd className="ml-auto text-[10px] font-mono text-muted-foreground">N</kbd>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  setNewTextFileOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <FilePlus className="h-4 w-4 text-kind-document" />
                <span>{vi.actions.newTextFile}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  setViewMode("grid");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                <span>Chuyển sang chế độ xem Lưới</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  setViewMode("list");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <List className="h-4 w-4 text-muted-foreground" />
                <span>Chuyển sang chế độ xem Danh sách</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  setTheme("light");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Giao diện Sáng</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  setTheme("dark");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <Moon className="h-4 w-4 text-indigo-400" />
                <span>Giao diện Tối</span>
              </Command.Item>
            </Command.Group>

            {/* Jump to Navigation Sections */}
            <Command.Group heading="Điều hướng nhanh" className="p-1 text-xs font-semibold text-muted-foreground">
              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  router.push("/drive");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <HardDrive className="h-4 w-4 text-primary" />
                <span>Đi tới Tệp của tôi</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  router.push("/recent");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <Clock className="h-4 w-4 text-primary" />
                <span>Đi tới Gần đây</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  router.push("/starred");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <Star className="h-4 w-4 text-amber-500" />
                <span>Đi tới Đã gắn sao</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  router.push("/shared");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <Users className="h-4 w-4 text-primary" />
                <span>Đi tới Được chia sẻ</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  router.push("/trash");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
                <span>Đi tới Thùng rác</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  router.push("/settings");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs text-foreground hover:bg-surface-2 cursor-pointer font-medium"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Đi tới Cài đặt</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
