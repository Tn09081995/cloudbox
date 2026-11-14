"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Folder as FolderIcon,
  MoreVertical,
  FolderOpen,
  Edit3,
  FolderInput,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Folder, ViewMode } from "@/types";
import { formatDate } from "@/lib/utils";

interface FolderItemProps {
  folder: Folder;
  viewMode: ViewMode;
  isTrash?: boolean;
  onRename: (folder: Folder) => void;
  onMove: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  onRestore?: (folder: Folder) => void;
}

export function FolderItem({
  folder,
  viewMode,
  isTrash = false,
  onRename,
  onMove,
  onDelete,
  onRestore,
}: FolderItemProps) {
  const router = useRouter();

  const handleOpen = () => {
    if (!isTrash) {
      router.push(`/drive/${folder.id}`);
    }
  };

  const actionMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg opacity-80 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Tùy chọn</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isTrash ? (
          <>
            {onRestore && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(folder);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2 text-primary" />
                <span>Khôi phục</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Xóa vĩnh viễn</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleOpen();
              }}
            >
              <FolderOpen className="h-4 w-4 mr-2 text-amber-500" />
              <span>Mở thư mục</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename(folder);
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              <span>Đổi tên</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMove(folder);
              }}
            >
              <FolderInput className="h-4 w-4 mr-2" />
              <span>Di chuyển</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Chuyển vào thùng rác</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Grid view
  if (viewMode === "grid") {
    return (
      <div
        onClick={handleOpen}
        className="group relative flex items-center justify-between p-3.5 rounded-2xl border bg-card hover:bg-accent/40 hover:border-amber-400/50 hover:shadow-md transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <FolderIcon className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          </div>
          <span
            className="text-sm font-semibold text-foreground truncate"
            title={folder.name}
          >
            {folder.name}
          </span>
        </div>
        {actionMenu}
      </div>
    );
  }

  // List view
  return (
    <div
      onClick={handleOpen}
      className="group flex items-center justify-between px-4 py-3 rounded-xl border bg-card hover:bg-accent/40 hover:border-amber-400/50 transition-colors cursor-pointer select-none"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
          <FolderIcon className="h-4 w-4 text-amber-500 fill-amber-500/20" />
        </div>
        <span
          className="text-sm font-medium text-foreground truncate max-w-xs md:max-w-md lg:max-w-lg"
          title={folder.name}
        >
          {folder.name}
        </span>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <span className="hidden sm:inline-block text-xs text-muted-foreground w-20 text-right">
          Thư mục
        </span>
        <span className="hidden md:inline-block text-xs text-muted-foreground w-36 text-right">
          {formatDate(folder.created_at)}
        </span>
        {actionMenu}
      </div>
    </div>
  );
}
