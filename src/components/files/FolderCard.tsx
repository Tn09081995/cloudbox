"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Folder,
  Star,
  MoreVertical,
  Edit2,
  Palette,
  FolderInput,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { formatRelativeDate } from "@/lib/utils/formatters";
import { FOLDER_COLOR_SWATCHES } from "@/lib/utils/file-types";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface FolderCardProps {
  folder: FileNode;
  onOpenRename?: (folder: FileNode) => void;
  onOpenMove?: (folder: FileNode) => void;
  onOpenDelete?: (folder: FileNode) => void;
  isTrash?: boolean;
  onRestore?: (folder: FileNode) => void;
}

export function FolderCard({
  folder,
  onOpenRename,
  onOpenMove,
  onOpenDelete,
  isTrash = false,
  onRestore,
}: FolderCardProps) {
  const { isSelected, selectItem } = useUiStore();
  const { toggleStar, updateColor, move } = useFileMutations();
  const [isDragOver, setIsDragOver] = useState(false);

  const selected = isSelected(folder.id);
  const color = folder.color || "#F5A524";

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newState = await toggleStar(folder.id);
      if (newState) toast.success(vi.toasts.starred(folder.name));
      else toast.success(vi.toasts.unstarred(folder.name));
    } catch {
      toast.error("Không thể thay đổi trạng thái sao");
    }
  };

  const handleSelectCheckbox = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectItem(folder.id, true);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isTrash) return;
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ id: folder.id, name: folder.name, kind: "folder" })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isTrash) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (isTrash) return;
    e.preventDefault();
    setIsDragOver(false);
    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.id === folder.id) return;
      await move({ ids: [data.id], targetFolderId: folder.id });
      toast.success(vi.toasts.moved(data.name, folder.name));
    } catch {
      toast.error("Lỗi di chuyển mục vào thư mục");
    }
  };

  const cardInner = (
    <>
      {/* Coloured Folder Icon Tile (12% tinted bg) */}
      <div
        className="h-10 w-10 rounded-btn flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Folder className="h-5 w-5 fill-current" />
      </div>

      {/* Text Details */}
      <div className="flex flex-col min-w-0 pr-1">
        <TooltipProvider delayDuration={400}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {folder.name}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{folder.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span className="text-xs text-muted-foreground truncate leading-tight mt-0.5 font-mono">
          {vi.table.itemCount(folder.item_count || 0)} · {formatRelativeDate(folder.updated_at)}
        </span>
      </div>
    </>
  );

  return (
    <div
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => selectItem(folder.id, false)}
      className={`group relative flex items-center justify-between p-3 rounded-card bg-surface border transition-all duration-cb select-none cursor-pointer ${
        selected
          ? "border-primary ring-2 ring-primary bg-primary-soft/20 shadow-sm"
          : isDragOver
          ? "border-primary ring-2 ring-primary/60 bg-primary-soft/30"
          : "border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-border/80"
      }`}
    >
      {/* Click target wrapper: in Trash, don't navigate */}
      {isTrash ? (
        <div className="flex items-center gap-3 min-w-0 flex-1 py-0.5 outline-none">
          {cardInner}
        </div>
      ) : (
        <Link
          href={`/drive/${folder.id}`}
          className="flex items-center gap-3 min-w-0 flex-1 py-0.5 outline-none"
        >
          {cardInner}
        </Link>
      )}

      {/* Top Left Checkbox (visible on hover or when selected) */}
      <button
        type="button"
        onClick={handleSelectCheckbox}
        className={`absolute top-2 left-2 h-5 w-5 rounded border flex items-center justify-center transition-all ${
          selected
            ? "bg-primary border-primary text-white opacity-100"
            : "bg-surface border-border text-transparent opacity-0 group-hover:opacity-100 hover:border-primary"
        }`}
        aria-label="Chọn thư mục"
      >
        <span className="text-[10px] font-bold">✓</span>
      </button>

      {/* Right Actions: Star toggle & Hover-only ⋮ menu */}
      <div className="flex items-center gap-0.5 pl-1 flex-shrink-0">
        {!isTrash && (
          <button
            type="button"
            onClick={handleToggleStar}
            className={`p-1.5 rounded-btn transition-colors ${
              folder.is_starred
                ? "text-amber-500 opacity-100"
                : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-surface-2"
            }`}
            aria-label={folder.is_starred ? vi.actions.unstar : vi.actions.star}
          >
            <Star className={`h-4 w-4 ${folder.is_starred ? "fill-amber-500" : ""}`} />
          </button>
        )}

        {/* Hover-only ⋮ Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-1.5 rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="Tùy chọn thư mục"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 p-1.5 rounded-card bg-surface border border-border shadow-lg font-sans"
          >
            {isTrash ? (
              <>
                <DropdownMenuItem
                  onClick={() => onRestore?.(folder)}
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{vi.actions.restore}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-border" />

                <DropdownMenuItem
                  onClick={() => onOpenDelete?.(folder)}
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium text-semantic-danger focus:text-semantic-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{vi.actions.deleteForever}</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => onOpenRename?.(folder)}
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{vi.actions.rename}</span>
                </DropdownMenuItem>

                {/* Submenu for 8 Color Swatches */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium">
                    <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{vi.actions.selectColor}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-44 p-1.5 rounded-card bg-surface border border-border shadow-lg">
                    <div className="grid grid-cols-4 gap-1.5 p-1">
                      {FOLDER_COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.hex}
                          type="button"
                          onClick={() => updateColor({ id: folder.id, color: swatch.hex })}
                          className="h-6 w-6 rounded-full border border-black/10 hover:scale-110 transition-transform relative flex items-center justify-center"
                          style={{ backgroundColor: swatch.hex }}
                          title={swatch.name}
                        >
                          {folder.color === swatch.hex && (
                            <span className="text-[10px] text-white font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem
                  onClick={() => onOpenMove?.(folder)}
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
                >
                  <FolderInput className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{vi.actions.move}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-border" />

                <DropdownMenuItem
                  onClick={() => onOpenDelete?.(folder)}
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium text-semantic-danger focus:text-semantic-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{vi.actions.delete}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
