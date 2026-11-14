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
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "file" | "folder";
  itemId: string;
  itemName: string;
  storagePath?: string; // only for file permanent delete
  isPermanent?: boolean;
  onSuccess: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  type,
  itemId,
  itemName,
  storagePath,
  isPermanent = false,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const tableName = type === "file" ? "files" : "folders";

      if (isPermanent) {
        // Permanent delete:
        // 1. If it's a file, delete from Supabase Storage first
        if (type === "file" && storagePath) {
          await supabase.storage.from("cloudbox").remove([storagePath]);
        } else if (type === "folder") {
          // If deleting folder permanently, fetch all files inside and delete from storage
          const { data: subFiles } = await supabase
            .from("files")
            .select("storage_path")
            .eq("folder_id", itemId);

          if (subFiles && subFiles.length > 0) {
            const paths = subFiles.map((f) => f.storage_path);
            await supabase.storage.from("cloudbox").remove(paths);
          }
        }

        // 2. Delete row from database (triggers auto-update quota)
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq("id", itemId);

        if (error) throw error;

        toast.success(`Đã xóa vĩnh viễn "${itemName}"!`);
      } else {
        // Soft delete: move to trash
        const { error } = await supabase
          .from(tableName)
          .update({
            deleted_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (error) throw error;

        toast.success(`Đã chuyển "${itemName}" vào thùng rác!`);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể xóa mục này";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            {isPermanent ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            <span>
              {isPermanent ? "Xóa vĩnh viễn" : "Chuyển vào thùng rác"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isPermanent ? (
              <>
                Hành động này <strong>không thể hoàn tác</strong>. Tệp &quot;
                {itemName}&quot; sẽ bị xóa hoàn toàn khỏi bộ nhớ và cơ sở dữ
                liệu.
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn chuyển &quot;{itemName}&quot; vào thùng
                rác? Bạn có thể khôi phục mục này bất kỳ lúc nào trong vòng 30
                ngày.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
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
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-xl"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isPermanent ? "Xóa vĩnh viễn" : "Chuyển vào thùng rác"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
