"use client";

import React, { useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { FileNode, BreadcrumbSegment } from "@/lib/mock/types";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { ContentHeader } from "./ContentHeader";
import { SelectionToolbar } from "./SelectionToolbar";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";
import { FileContextMenu } from "./FileContextMenu";
import { GridSkeleton, ListSkeleton } from "@/components/ui/CloudBoxSkeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { RenameDialog } from "@/components/dialogs/RenameDialog";
import { MoveDialog } from "@/components/dialogs/MoveDialog";
import { NewFolderDialog } from "@/components/dialogs/NewFolderDialog";
import { NewTextFileDialog } from "@/components/dialogs/NewTextFileDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { ShareDialog } from "@/components/dialogs/ShareDialog";
import { PreviewModal } from "@/components/preview/PreviewModal";
import { DetailsPanel } from "@/components/details/DetailsPanel";
import { DragOverlay } from "@/components/upload/DragOverlay";
import { UploadManager } from "@/components/upload/UploadManager";
import { CommandPalette } from "@/components/search/CommandPalette";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { showUndoToast } from "@/lib/utils/undo-toast";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface FolderViewProps {
  nodes: FileNode[];
  breadcrumbs?: BreadcrumbSegment[];
  currentFolderId?: string | null;
  title?: string;
  emptyVariant?: "folder" | "search" | "starred" | "shared" | "trash";
  emptyTitle?: string;
  emptyDesc?: string;
  isLoading?: boolean;
  isTrash?: boolean;
  onEmptyTrash?: () => void;
}

export function FolderView({
  nodes,
  breadcrumbs = [{ id: null, name: "Tệp của tôi" }],
  currentFolderId = null,
  title,
  emptyVariant = "folder",
  emptyTitle = vi.emptyStates.folder.title,
  emptyDesc = vi.emptyStates.folder.desc,
  isLoading = false,
  isTrash = false,
  onEmptyTrash,
}: FolderViewProps) {
  const {
    viewMode,
    selectedIds,
    clearSelection,
    setDetailsPanelOpen,
    setNewFolderOpen,
  } = useUiStore();

  const { trash, restore, toggleStar } = useFileMutations();

  // Active dialog targets
  const [renameNode, setRenameNode] = useState<FileNode | null>(null);
  const [moveNodes, setMoveNodes] = useState<FileNode[]>([]);
  const [deleteConfirmNodes, setDeleteConfirmNodes] = useState<FileNode[]>([]);
  const [shareNode, setShareNode] = useState<FileNode | null>(null);
  const [previewNode, setPreviewNode] = useState<FileNode | null>(null);

  // Selected file for Details Panel
  const detailsTarget =
    previewNode ||
    (selectedIds.length > 0 ? nodes.find((n) => n.id === selectedIds[0]) || null : null) ||
    nodes[0] ||
    null;

  // Selected nodes for bulk actions
  const selectedNodes = nodes.filter((n) => selectedIds.includes(n.id));

  // Trashing with Undo Toast
  const handleTrash = async (targetNodes: FileNode[]) => {
    const ids = targetNodes.map((n) => n.id);
    const names = targetNodes.length === 1 ? targetNodes[0].name : `${targetNodes.length} mục`;
    try {
      await trash(ids);
      clearSelection();
      showUndoToast({
        message: vi.toasts.trashed(names),
        onUndo: async () => {
          await restore(ids);
        },
      });
    } catch {
      toast.error("Không thể chuyển vào thùng rác");
    }
  };

  const handleRestore = async (targetNodes: FileNode[]) => {
    const ids = targetNodes.map((n) => n.id);
    const names = targetNodes.length === 1 ? targetNodes[0].name : `${targetNodes.length} mục`;
    try {
      await restore(ids);
      clearSelection();
      toast.success(vi.toasts.restored(names));
    } catch {
      toast.error("Không thể khôi phục mục này");
    }
  };

  const handleBulkStar = async () => {
    try {
      for (const node of selectedNodes) {
        await toggleStar(node.id);
      }
      toast.success(vi.toasts.starred(`${selectedNodes.length} mục`));
      clearSelection();
    } catch {
      toast.error("Lỗi cập nhật sao");
    }
  };

  const handleBulkDownload = () => {
    toast.success(`Đang tải xuống ${selectedNodes.length} mục...`);
  };

  // Bind Keyboard Shortcuts
  useKeyboardShortcuts({
    nodes,
    onUploadTrigger: () => {
      if (isTrash) return;
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.click();
    },
    onPreviewTrigger: (node) => !isTrash && setPreviewNode(node),
    onRenameTrigger: (node) => !isTrash && setRenameNode(node),
    onTrashTrigger: (targets) => {
      if (isTrash) {
        setDeleteConfirmNodes(targets);
      } else {
        handleTrash(targets);
      }
    },
  });

  return (
    <div className="flex h-full w-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pr-0 md:pr-2">
        {/* Trash Notice Banner */}
        {isTrash && (
          <div className="mb-4 p-3 rounded-card bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground animate-in fade-in duration-cb">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{vi.trash.notice}</span>
            </div>
            {nodes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (onEmptyTrash) onEmptyTrash();
                  else setDeleteConfirmNodes(nodes);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-semantic-danger/10 text-semantic-danger hover:bg-semantic-danger/20 font-semibold transition-colors self-start sm:self-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{vi.trash.empty}</span>
              </button>
            )}
          </div>
        )}

        {/* Header / Selection Toolbar */}
        {selectedIds.length > 0 ? (
          <div className="pb-4">
            <SelectionToolbar
              selectedCount={selectedIds.length}
              isTrash={isTrash}
              onShare={!isTrash ? () => setShareNode(selectedNodes[0] || null) : undefined}
              onDownload={!isTrash ? handleBulkDownload : undefined}
              onMove={!isTrash ? () => setMoveNodes(selectedNodes) : undefined}
              onStar={!isTrash ? handleBulkStar : undefined}
              onTrash={!isTrash ? () => handleTrash(selectedNodes) : undefined}
              onRestore={isTrash ? () => handleRestore(selectedNodes) : undefined}
              onDeleteForever={isTrash ? () => setDeleteConfirmNodes(selectedNodes) : undefined}
            />
          </div>
        ) : (
          <ContentHeader
            breadcrumbs={breadcrumbs}
            currentFolderId={currentFolderId}
            title={title}
          />
        )}

        {/* Content Body */}
        {isLoading ? (
          viewMode === "grid" ? (
            <GridSkeleton />
          ) : (
            <ListSkeleton />
          )
        ) : nodes.length === 0 ? (
          <EmptyState
            variant={emptyVariant}
            title={emptyTitle}
            desc={emptyDesc}
            actionLabel={
              emptyVariant === "folder" ? "+ " + vi.actions.newFolder : undefined
            }
            onAction={
              emptyVariant === "folder" ? () => setNewFolderOpen(true) : undefined
            }
          />
        ) : (
          <FileContextMenu>
            <div className="min-h-[450px]">
              {viewMode === "grid" ? (
                <FileGrid
                  nodes={nodes}
                  isTrash={isTrash}
                  onPreview={(file) => !isTrash && setPreviewNode(file)}
                  onShare={(file) => setShareNode(file)}
                  onRename={(file) => setRenameNode(file)}
                  onMove={(file) => setMoveNodes([file])}
                  onDelete={(file) => {
                    if (isTrash) setDeleteConfirmNodes([file]);
                    else handleTrash([file]);
                  }}
                  onRestore={(file) => handleRestore([file])}
                />
              ) : (
                <FileList
                  nodes={nodes}
                  isTrash={isTrash}
                  onPreview={(file) => !isTrash && setPreviewNode(file)}
                  onShare={(file) => setShareNode(file)}
                  onRename={(file) => setRenameNode(file)}
                  onMove={(file) => setMoveNodes([file])}
                  onDelete={(file) => {
                    if (isTrash) setDeleteConfirmNodes([file]);
                    else handleTrash([file]);
                  }}
                  onRestore={(file) => handleRestore([file])}
                />
              )}
            </div>
          </FileContextMenu>
        )}
      </div>

      {/* Slide-in Details Panel (340px) */}
      <DetailsPanel node={detailsTarget} />

      {/* Global Interactive Modals & Overlays */}
      <RenameDialog
        node={renameNode}
        open={!!renameNode}
        onOpenChange={(open) => !open && setRenameNode(null)}
      />

      <MoveDialog
        nodes={moveNodes}
        open={moveNodes.length > 0}
        onOpenChange={(open) => !open && setMoveNodes([])}
      />

      <NewFolderDialog currentFolderId={currentFolderId} />
      <NewTextFileDialog currentFolderId={currentFolderId} />

      <DeleteConfirmDialog
        nodes={deleteConfirmNodes}
        open={deleteConfirmNodes.length > 0}
        onOpenChange={(open) => !open && setDeleteConfirmNodes([])}
      />

      <ShareDialog
        node={shareNode}
        open={!!shareNode}
        onOpenChange={(open) => !open && setShareNode(null)}
      />

      <PreviewModal
        file={previewNode}
        folderFiles={nodes}
        isOpen={!!previewNode}
        onClose={() => setPreviewNode(null)}
        onShare={(f) => setShareNode(f)}
        onToggleDetails={() => setDetailsPanelOpen((prev) => !prev)}
      />

      {!isTrash && <DragOverlay currentFolderId={currentFolderId} />}
      <UploadManager />
      <CommandPalette />
    </div>
  );
}
