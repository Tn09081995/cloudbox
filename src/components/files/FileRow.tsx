"use client";

import React from "react";
import Link from "next/link";
import {
  Folder,
  Star,
  Share2,
  Download,
  MoreVertical,
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
import { FileNode } from "@/lib/mock/types";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { formatBytes, formatShortDate } from "@/lib/utils/formatters";
import { FILE_KIND_CONFIGS } from "@/lib/utils/file-types";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface FileRowProps {
  node: FileNode;
  onPreview?: (file: FileNode) => void;
  onShare?: (file: FileNode) => void;
  onRename?: (file: FileNode) => void;
  onMove?: (file: FileNode) => void;
  onDelete?: (file: FileNode) => void;
  isTrash?: boolean;
  onRestore?: (file: FileNode) => void;
}

export function FileRow({
  node,
  onPreview,
  onShare,
  onRename,
  onMove,
  onDelete,
  isTrash = false,
  onRestore,
}: FileRowProps) {
  const { isSelected, selectItem } = useUiStore();
  const { toggleStar, copy } = useFileMutations();

  const selected = isSelected(node.id);
  const isFolder = node.kind === "folder";
  const cfg = FILE_KIND_CONFIGS[node.kind] || FILE_KIND_CONFIGS.other;

  const handleSelectCheckbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectItem(node.id, true);
  };

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const starred = await toggleStar(node.id);
      if (starred) toast.success(vi.toasts.starred(node.name));
      else toast.success(vi.toasts.unstarred(node.name));
    } catch {
      toast.error("Lỗi cập nhật sao");
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Đang tải xuống "${node.name}"...`);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copy({ ids: [node.id], targetFolderId: node.parent_id });
    toast.success(`Đã tạo bản sao của "${node.name}"`);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isTrash) return;
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ id: node.id, name: node.name, kind: node.kind })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onClick={() => selectItem(node.id, false)}
      onDoubleClick={() => {
        if (!isTrash) {
          if (!isFolder) onPreview?.(node);
        }
      }}
      className={`group flex items-center h-12 px-3 border-b border-border/60 transition-colors select-none cursor-pointer ${
        selected
          ? "bg-primary-soft/30 hover:bg-primary-soft/40"
          : "hover:bg-surface-2/70"
      }`}
    >
      {/* Checkbox */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        <button
          type="button"
          onClick={handleSelectCheckbox}
          className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
            selected
              ? "bg-primary border-primary text-white opacity-100"
              : "bg-surface border-border text-transparent opacity-0 group-hover:opacity-100 hover:border-primary"
          }`}
          aria-label="Chọn"
        >
          <span className="text-[9px] font-bold">✓</span>
        </button>
      </div>

      {/* Name Column */}
      <div className="flex-1 min-w-0 flex items-center gap-3 pr-4">
        {isFolder ? (
          isTrash ? (
            <div className="flex items-center gap-3 min-w-0 font-semibold text-foreground">
              <div
                className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${node.color || "#F5A524"}20`,
                  color: node.color || "#F5A524",
                }}
              >
                <Folder className="h-4 w-4 fill-current" />
              </div>
              <span className="truncate">{node.name}</span>
            </div>
          ) : (
            <Link
              href={`/drive/${node.id}`}
              className="flex items-center gap-3 min-w-0 font-semibold text-foreground hover:text-primary transition-colors"
            >
              <div
                className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${node.color || "#F5A524"}20`,
                  color: node.color || "#F5A524",
                }}
              >
                <Folder className="h-4 w-4 fill-current" />
              </div>
              <span className="truncate">{node.name}</span>
            </Link>
          )
        ) : (
          <div className="flex items-center gap-3 min-w-0 font-medium text-foreground">
            <div
              className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cfg.bgTile, color: cfg.color }}
            >
              <span className="text-[9px] font-bold uppercase font-mono">
                {node.name.split(".").pop()?.slice(0, 3) || "DAT"}
              </span>
            </div>
            <span className="truncate">{node.name}</span>
          </div>
        )}

        {/* Star Button */}
        {!isTrash && (
          <button
            type="button"
            onClick={handleToggleStar}
            className={`p-1 rounded text-muted-foreground hover:text-amber-500 transition-colors ${
              node.is_starred ? "text-amber-500 opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            aria-label={node.is_starred ? vi.actions.unstar : vi.actions.star}
          >
            <Star className={`h-3.5 w-3.5 ${node.is_starred ? "fill-amber-500" : ""}`} />
          </button>
        )}
      </div>

      {/* Owner Column (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2 w-44 flex-shrink-0 text-xs text-muted-foreground truncate">
        <span className="h-5 w-5 rounded-full bg-primary-soft text-primary font-semibold text-[10px] flex items-center justify-center flex-shrink-0">
          {node.owner.name.slice(0, 1)}
        </span>
        <span className="truncate">{node.owner.isCurrentUser ? "Tôi" : node.owner.name}</span>
      </div>

      {/* Modified Date Column */}
      <div className="hidden sm:block w-36 flex-shrink-0 text-xs text-muted-foreground font-mono tabular-nums">
        {formatShortDate(node.updated_at)}
      </div>

      {/* Size Column */}
      <div className="w-24 flex-shrink-0 text-xs text-right text-muted-foreground font-mono tabular-nums pr-2">
        {isFolder ? "—" : formatBytes(node.size)}
      </div>

      {/* Action Buttons Column */}
      <div className="w-20 flex-shrink-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {isTrash ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRestore?.(node);
              }}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              title={vi.actions.restore}
              aria-label={vi.actions.restore}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(node);
              }}
              className="p-1 rounded text-semantic-danger hover:bg-semantic-danger/10 transition-colors"
              title={vi.actions.deleteForever}
              aria-label={vi.actions.deleteForever}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <>
            {!isFolder && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                aria-label={vi.actions.download}
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(node);
              }}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              aria-label={vi.actions.share}
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                  aria-label="Tùy chọn"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-card bg-surface border border-border shadow-lg font-sans">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename?.(node);
                  }}
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{vi.actions.rename}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove?.(node);
                  }}
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                >
                  <FolderInput className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{vi.actions.move}</span>
                </DropdownMenuItem>

                {!isFolder && (
                  <DropdownMenuItem
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{vi.actions.copy}</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-1 bg-border" />

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(node);
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
  );
}
