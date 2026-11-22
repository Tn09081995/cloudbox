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
import { Input } from "@/components/ui/input";
import { Folder } from "lucide-react";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { FOLDER_COLOR_SWATCHES } from "@/lib/utils/file-types";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface NewFolderDialogProps {
  currentFolderId?: string | null;
}

export function NewFolderDialog({ currentFolderId = null }: NewFolderDialogProps) {
  const { newFolderOpen, setNewFolderOpen } = useUiStore();
  const { createFolder } = useFileMutations();

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#F5A524");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createFolder({
        name: name.trim(),
        parentId: currentFolderId,
        color: selectedColor,
      });
      toast.success(vi.toasts.folderCreated(name.trim()));
      setName("");
      setSelectedColor("#F5A524");
      setNewFolderOpen(false);
    } catch {
      toast.error("Không thể tạo thư mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
      <DialogContent className="max-w-md p-6 rounded-dialog bg-surface border border-border shadow-xl font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-btn flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
            >
              <Folder className="h-4 w-4 fill-current" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {vi.dialogs.newFolderTitle}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {vi.dialogs.newFolderNameLabel}
            </label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-btn bg-surface-2 border-border focus-visible:ring-2 focus-visible:ring-primary text-sm font-medium"
              placeholder="VD: Tài liệu thiết kế..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {vi.dialogs.newFolderColorLabel}
            </label>
            <div className="flex items-center gap-2">
              {FOLDER_COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => setSelectedColor(swatch.hex)}
                  className="h-7 w-7 rounded-full border border-black/10 hover:scale-110 transition-transform relative flex items-center justify-center"
                  style={{ backgroundColor: swatch.hex }}
                  title={swatch.name}
                  aria-label={swatch.name}
                >
                  {selectedColor === swatch.hex && (
                    <span className="text-xs text-white font-bold drop-shadow">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewFolderOpen(false)}
              className="h-9 px-4 rounded-btn text-xs font-medium"
            >
              {vi.actions.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="h-9 px-4 rounded-btn text-xs font-semibold bg-primary text-white hover:bg-primary-ink"
            >
              {vi.actions.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
