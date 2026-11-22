"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, HardDrive } from "lucide-react";
import { FileNode } from "@/lib/mock/types";
import { useFolderFiles, useFileMutations } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface MoveDialogProps {
  nodes: FileNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoveDialog({ nodes, open, onOpenChange }: MoveDialogProps) {
  const { move } = useFileMutations();
  const { data: allRootNodes = [] } = useFolderFiles(null);

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const folderNodes = allRootNodes.filter((n) => n.kind === "folder");
  const targetIds = nodes.map((n) => n.id);

  const handleMove = async () => {
    if (nodes.length === 0) return;
    setLoading(true);
    try {
      await move({ ids: targetIds, targetFolderId: selectedTargetId });
      toast.success(
        vi.toasts.moved(
          nodes.length === 1 ? nodes[0].name : `${nodes.length} mục`
        )
      );
      onOpenChange(false);
    } catch {
      toast.error("Không thể di chuyển");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-dialog bg-surface border border-border shadow-xl font-sans">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            {vi.dialogs.moveTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Folder Tree Picker Container */}
        <div className="py-2">
          <div className="max-h-60 overflow-y-auto p-2 rounded-btn bg-surface-2 border border-border space-y-1">
            {/* Root: Tệp của tôi */}
            <button
              type="button"
              onClick={() => setSelectedTargetId(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs font-medium transition-colors ${
                selectedTargetId === null
                  ? "bg-primary-soft text-primary font-semibold ring-1 ring-primary"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              <HardDrive className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{vi.nav.myDrive} (Thư mục gốc)</span>
            </button>

            {/* Folder list */}
            {folderNodes.map((folder) => {
              const isSelected = selectedTargetId === folder.id;
              const isSelf = targetIds.includes(folder.id);

              return (
                <button
                  key={folder.id}
                  type="button"
                  disabled={isSelf}
                  onClick={() => setSelectedTargetId(folder.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs transition-colors ${
                    isSelf
                      ? "opacity-40 cursor-not-allowed text-muted-foreground"
                      : isSelected
                      ? "bg-primary-soft text-primary font-semibold ring-1 ring-primary"
                      : "text-foreground hover:bg-surface font-medium"
                  }`}
                >
                  <Folder
                    className="h-4 w-4 flex-shrink-0 fill-current"
                    style={{ color: folder.color || "#F5A524" }}
                  />
                  <span className="truncate">{folder.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-btn text-xs font-medium"
          >
            {vi.actions.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleMove}
            disabled={loading}
            className="h-9 px-4 rounded-btn text-xs font-semibold bg-primary text-white hover:bg-primary-ink"
          >
            {vi.dialogs.moveBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
