"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileNode } from "@/lib/mock/types";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface RenameDialogProps {
  node: FileNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameDialog({ node, open, onOpenChange }: RenameDialogProps) {
  const { rename } = useFileMutations();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && node) {
      setName(node.name);

      // Select name without extension
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const dotIndex = node.name.lastIndexOf(".");
          if (dotIndex > 0 && node.kind !== "folder") {
            inputRef.current.setSelectionRange(0, dotIndex);
          } else {
            inputRef.current.select();
          }
        }
      }, 50);
    }
  }, [open, node]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!node || !name.trim()) return;

    try {
      await rename({ id: node.id, newName: name.trim() });
      toast.success(vi.toasts.renamed(name.trim()));
      onOpenChange(false);
    } catch {
      toast.error("Không thể đổi tên");
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-dialog bg-surface border border-border shadow-xl font-sans">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            {vi.dialogs.renameTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-btn bg-surface-2 border-border focus-visible:ring-2 focus-visible:ring-primary text-sm font-medium"
            placeholder="Nhập tên mới..."
            required
          />

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
              type="submit"
              disabled={!name.trim() || name.trim() === node.name}
              className="h-9 px-4 rounded-btn text-xs font-semibold bg-primary text-white hover:bg-primary-ink"
            >
              {vi.actions.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
