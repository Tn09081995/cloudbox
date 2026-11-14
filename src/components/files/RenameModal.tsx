"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/utils";
import { toast } from "sonner";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "file" | "folder";
  itemId: string;
  initialName: string;
  onSuccess: () => void;
}

export function RenameModal({
  isOpen,
  onClose,
  type,
  itemId,
  initialName,
  onSuccess,
}: RenameModalProps) {
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeFileName(name.trim());
    if (!cleanName) {
      toast.error("Vui lòng nhập tên hợp lệ");
      return;
    }
    if (cleanName === initialName) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      const tableName = type === "file" ? "files" : "folders";

      const { error } = await supabase
        .from(tableName)
        .update({ name: cleanName, updated_at: new Date().toISOString() })
        .eq("id", itemId);

      if (error) throw error;

      toast.success(
        `Đã đổi tên ${type === "file" ? "tệp" : "thư mục"} thành "${cleanName}"!`
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể đổi tên";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <form onSubmit={handleRename}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              <span>Đổi tên {type === "file" ? "tệp" : "thư mục"}</span>
            </DialogTitle>
            <DialogDescription>
              Nhập tên mới cho {type === "file" ? "tệp tin" : "thư mục"}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Label htmlFor="rename-input">Tên mới</Label>
            <Input
              id="rename-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
              className="rounded-xl"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="rounded-xl"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
