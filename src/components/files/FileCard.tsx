"use client";

import React from "react";
import {
  Share2,
  Download,
  MoreVertical,
  Star,
  Edit2,
  FolderInput,
  Copy,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileNode } from "@/lib/mock/types";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { formatBytes, formatRelativeDate } from "@/lib/utils/formatters";
import { FILE_KIND_CONFIGS } from "@/lib/utils/file-types";
import { FileThumbnail } from "./FileThumbnail";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface FileCardProps {
  file: FileNode;
  onPreview?: (file: FileNode) => void;
  onShare?: (file: FileNode) => void;
  onRename?: (file: FileNode) => void;
  onMove?: (file: FileNode) => void;
  onDelete?: (file: FileNode) => void;
  isTrash?: boolean;
  onRestore?: (file: FileNode) => void;
}

export function FileCard({
  file,
  onPreview,
  onShare,
  onRename,
  onMove,
  onDelete,
  isTrash = false,
  onRestore,
}: FileCardProps) {
  const { isSelected, selectItem } = useUiStore();
  const { toggleStar, copy } = useFileMutations();

  const selected = isSelected(file.id);
  const cfg = FILE_KIND_CONFIGS[file.kind] || FILE_KIND_CONFIGS.other;

  const handleSelectCheckbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectItem(file.id, true);
  };

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const starred = await toggleStar(file.id);
      if (starred) toast.success(vi.toasts.starred(file.name));
      else toast.success(vi.toasts.unstarred(file.name));
    } catch {
      toast.error("Lỗi cập nhật sao");
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Đang tải xuống "${file.name}"...`);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copy({ ids: [file.id], targetFolderId: file.parent_id });
    toast.success(`Đã tạo bản sao của "${file.name}"`);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isTrash) return;
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ id: file.id, name: file.name, kind: file.kind })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onClick={() => selectItem(file.id, false)}
      onDoubleClick={() => !isTrash && onPreview?.(file)}
      className={`group relative flex flex-col rounded-card bg-surface border transition-all duration-cb select-none cursor-pointer overflow-hidden ${
        selected
          ? "border-primary ring-2 ring-primary bg-primary-soft/10 shadow-sm"
          : "border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-border/80"
      }`}
    >
      {/* 4:3 Aspect Ratio Mock Thumbnail */}
      <div className="relative aspect-[4/3] w-full bg-surface-2 overflow-hidden">
        <FileThumbnail file={file} />

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Top-Left Hover Selection Checkbox */}
        <button
          type="button"
          onClick={handleSelectCheckbox}
          className={`absolute top-2.5 left-2.5 h-5 w-5 rounded border flex items-center justify-center transition-all ${
            selected
              ? "bg-primary border-primary text-white opacity-100"
              : "bg-surface/90 backdrop-blur-sm border-border text-transparent opacity-0 group-hover:opacity-100 hover:border-primary shadow-xs"
          }`}
          aria-label="Chọn tệp"
        >
          <span className="text-[10px] font-bold">✓</span>
        </button>

        {/* Top-Right Quick Action Buttons on Hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {isTrash ? (
            <>
              {/* Restore Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.(file);
                }}
                className="p-1.5 rounded-btn bg-surface/90 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
                title={vi.actions.restore}
                aria-label={vi.actions.restore}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Permanent Delete Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(file);
                }}
                className="p-1.5 rounded-btn bg-surface/90 backdrop-blur-sm border border-border text-semantic-danger hover:bg-semantic-danger hover:text-white shadow-sm transition-colors"
                title={vi.actions.deleteForever}
                aria-label={vi.actions.deleteForever}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* Quick Share */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(file);
                }}
                className="p-1.5 rounded-btn bg-surface/90 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
                title={vi.actions.share}
                aria-label={vi.actions.share}
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>

              {/* Quick Download */}
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 rounded-btn bg-surface/90 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
                title={vi.actions.download}
                aria-label={vi.actions.download}
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              {/* Context Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-btn bg-surface/90 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
                    aria-label="Tùy chọn tệp"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-card bg-surface border border-border shadow-lg font-sans">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview?.(file);
                    }}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                  >
                    <span>{vi.actions.details}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleToggleStar}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                  >
                    <Star className={`h-3.5 w-3.5 ${file.is_starred ? "fill-amber-500 text-amber-500" : ""}`} />
                    <span>{file.is_starred ? vi.actions.unstar : vi.actions.star}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename?.(file);
                    }}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{vi.actions.rename}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove?.(file);
                    }}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                  >
                    <FolderInput className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{vi.actions.move}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{vi.actions.copy}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-border" />

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(file);
                    }}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium text-semantic-danger focus:text-semantic-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{vi.actions.delete}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Card Bottom Meta Area */}
      <div className="p-3 flex items-start gap-2.5">
        {/* Kind colored icon */}
        <div
          className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: cfg.bgTile, color: cfg.color }}
        >
          <span className="text-[10px] font-bold uppercase font-mono">
            {file.name.split(".").pop()?.slice(0, 3) || "DAT"}
          </span>
        </div>

        {/* Name and Meta */}
        <div className="flex-1 min-w-0">
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {file.name}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">{file.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono tabular-nums">
            {formatBytes(file.size)} · {formatRelativeDate(file.updated_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
