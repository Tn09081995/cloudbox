"use client";

import React, { useState } from "react";
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
import { FolderPlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/utils";
import { toast } from "sonner";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId: string | null;
  onSuccess: () => void;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  currentFolderId,
  onSuccess,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeFileName(folderName.trim());
    if (!cleanName) {
      toast.error("Vui lòng nhập tên thư mục hợp lệ");
      return;
    }

    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Vui lòng đăng nhập để thực hiện");
        return;
      }

      const { error } = await supabase.from("folders").insert({
        owner_id: user.id,
        parent_id: currentFolderId,
        name: cleanName,
      });

      if (error) throw error;

      toast.success(`Đã tạo thư mục "${cleanName}" thành công!`);
      setFolderName("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể tạo thư mục";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-amber-500" />
              <span>Tạo thư mục mới</span>
            </DialogTitle>
            <DialogDescription>
              Nhập tên cho thư mục mới của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Label htmlFor="folder-name">Tên thư mục</Label>
            <Input
              id="folder-name"
              placeholder="VD: Tài liệu dự án, Ảnh kỷ niệm..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
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
              disabled={isLoading || !folderName.trim()}
              className="rounded-xl"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Tạo thư mục
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
