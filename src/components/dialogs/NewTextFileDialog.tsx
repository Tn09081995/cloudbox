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
import { FileText } from "lucide-react";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface NewTextFileDialogProps {
  currentFolderId?: string | null;
}

export function NewTextFileDialog({ currentFolderId = null }: NewTextFileDialogProps) {
  const { newTextFileOpen, setNewTextFileOpen } = useUiStore();
  const { createTextFile } = useFileMutations();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createTextFile({
        name: name.trim(),
        content,
        parentId: currentFolderId,
      });
      toast.success(vi.toasts.fileCreated(name.trim()));
      setName("");
      setContent("");
      setNewTextFileOpen(false);
    } catch {
      toast.error("Không thể tạo tệp văn bản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={newTextFileOpen} onOpenChange={setNewTextFileOpen}>
      <DialogContent className="max-w-lg p-6 rounded-dialog bg-surface border border-border shadow-xl font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-btn bg-kind-document/20 text-kind-document flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {vi.dialogs.newTextFileTitle}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {vi.dialogs.fileNameLabel}
            </label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-btn bg-surface-2 border-border focus-visible:ring-2 focus-visible:ring-primary text-sm font-medium"
              placeholder="VD: Ghi chú cuộc họp.md"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {vi.dialogs.fileContentLabel}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full p-3 rounded-btn bg-surface-2 border border-border focus-visible:ring-2 focus-visible:ring-primary text-xs font-mono resize-none outline-none text-foreground placeholder:text-muted-foreground"
              placeholder="Nhập nội dung văn bản hoặc ghi chú..."
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewTextFileOpen(false)}
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
