"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { FileNode } from "@/lib/mock/types";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface DeleteConfirmDialogProps {
  nodes: FileNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmDialog({
  nodes,
  open,
  onOpenChange,
}: DeleteConfirmDialogProps) {
  const { deletePermanently } = useFileMutations();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (nodes.length === 0) return;
    setLoading(true);
    try {
      await deletePermanently(nodes.map((n) => n.id));
      toast.success(
        vi.toasts.deletedPermanently(
          nodes.length === 1 ? nodes[0].name : `${nodes.length} mục`
        )
      );
      onOpenChange(false);
    } catch {
      toast.error("Không thể xóa vĩnh viễn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-dialog bg-surface border border-border shadow-xl font-sans">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-semantic-danger/10 text-semantic-danger flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {vi.dialogs.deleteForeverTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {vi.dialogs.deleteForeverDesc}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {nodes.length > 0 && (
          <div className="p-3 my-2 rounded-btn bg-surface-2 border border-border text-xs text-foreground font-medium truncate">
            {nodes.length === 1 ? nodes[0].name : `${nodes.length} mục đã chọn`}
          </div>
        )}

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
            onClick={handleDelete}
            disabled={loading}
            className="h-9 px-4 rounded-btn text-xs font-semibold bg-semantic-danger text-white hover:bg-semantic-danger/90"
          >
            {vi.actions.deleteForever}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
