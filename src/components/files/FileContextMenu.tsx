"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  FolderPlus,
  FilePlus,
  Upload,
  Eye,
  Download,
  Share2,
  Edit2,
  FolderInput,
  Copy,
  Star,
  Trash2,
  Palette,
  CheckSquare,
} from "lucide-react";
import { FileNode } from "@/lib/mock/types";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { FOLDER_COLOR_SWATCHES } from "@/lib/utils/file-types";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface FileContextMenuProps {
  children: React.ReactNode;
  node?: FileNode | null;
  onPreview?: (node: FileNode) => void;
  onShare?: (node: FileNode) => void;
  onRename?: (node: FileNode) => void;
  onMove?: (node: FileNode) => void;
  onDelete?: (node: FileNode) => void;
}

export function FileContextMenu({
  children,
  node,
  onPreview,
  onShare,
  onRename,
  onMove,
  onDelete,
}: FileContextMenuProps) {
  const {
    setNewFolderOpen,
    setNewTextFileOpen,
  } = useUiStore();
  const { toggleStar, copy, updateColor } = useFileMutations();

  const isFolder = node?.kind === "folder";

  const handleToggleStar = async () => {
    if (!node) return;
    try {
      const starred = await toggleStar(node.id);
      if (starred) toast.success(vi.toasts.starred(node.name));
      else toast.success(vi.toasts.unstarred(node.name));
    } catch {
      toast.error("Không thể cập nhật sao");
    }
  };

  const handleCopy = async () => {
    if (!node) return;
    await copy({ ids: [node.id], targetFolderId: node.parent_id });
    toast.success(`Đã tạo bản sao của "${node.name}"`);
  };

  const handleDownload = () => {
    if (!node) return;
    toast.success(`Đang tải xuống "${node.name}"...`);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-52 p-1.5 rounded-card bg-surface border border-border shadow-lg font-sans">
        {/* If context is on an item (File or Folder) */}
        {node ? (
          <>
            {!isFolder && (
              <ContextMenuItem
                onClick={() => onPreview?.(node)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
              >
                <Eye className="h-4 w-4 text-primary" />
                <span>Xem trước</span>
              </ContextMenuItem>
            )}

            {!isFolder && (
              <ContextMenuItem
                onClick={handleDownload}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>{vi.actions.download}</span>
              </ContextMenuItem>
            )}

            <ContextMenuItem
              onClick={() => onShare?.(node)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span>{vi.actions.share}</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={handleToggleStar}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
            >
              <Star className={`h-4 w-4 ${node.is_starred ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
              <span>{node.is_starred ? vi.actions.unstar : vi.actions.star}</span>
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1 bg-border" />

            <ContextMenuItem
              onClick={() => onRename?.(node)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
              <span>{vi.actions.rename}</span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">F2</span>
            </ContextMenuItem>

            {isFolder && (
              <ContextMenuSub>
                <ContextMenuSubTrigger className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span>{vi.actions.selectColor}</span>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-44 p-1.5 rounded-card bg-surface border border-border shadow-lg">
                  <div className="grid grid-cols-4 gap-1.5 p-1">
                    {FOLDER_COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => updateColor({ id: node.id, color: swatch.hex })}
                        className="h-6 w-6 rounded-full border border-black/10 hover:scale-110 transition-transform relative flex items-center justify-center"
                        style={{ backgroundColor: swatch.hex }}
                        title={swatch.name}
                      >
                        {node.color === swatch.hex && (
                          <span className="text-[10px] text-white font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </ContextMenuSubContent>
              </ContextMenuSub>
            )}

            <ContextMenuItem
              onClick={() => onMove?.(node)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
            >
              <FolderInput className="h-4 w-4 text-muted-foreground" />
              <span>{vi.actions.move}</span>
            </ContextMenuItem>

            {!isFolder && (
              <ContextMenuItem
                onClick={handleCopy}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span>{vi.actions.copy}</span>
              </ContextMenuItem>
            )}

            <ContextMenuSeparator className="my-1 bg-border" />

            <ContextMenuItem
              onClick={() => onDelete?.(node)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium text-semantic-danger focus:text-semantic-danger"
            >
              <Trash2 className="h-4 w-4" />
              <span>{vi.actions.delete}</span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">Del</span>
            </ContextMenuItem>
          </>
        ) : (
          /* Empty background right-click context menu */
          <>
            <ContextMenuItem
              onClick={() => setNewFolderOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
            >
              <FolderPlus className="h-4 w-4 text-kind-folder" />
              <span>{vi.actions.newFolder}</span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">N</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => setNewTextFileOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
            >
              <FilePlus className="h-4 w-4 text-kind-document" />
              <span>{vi.actions.newTextFile}</span>
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1 bg-border" />

            <ContextMenuItem
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.click();
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span>{vi.actions.uploadFile}</span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">U</span>
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1 bg-border" />

            <ContextMenuItem
              onClick={() => {
                // Select all in current view
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
            >
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span>{vi.actions.selectAll}</span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">Ctrl+A</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
