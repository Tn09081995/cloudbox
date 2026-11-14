"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder as FolderIcon, Home, FolderInput, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Folder } from "@/types";
import { toast } from "sonner";

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "file" | "folder";
  itemId: string;
  itemName: string;
  currentFolderId: string | null;
  onSuccess: () => void;
}

export function MoveModal({
  isOpen,
  onClose,
  type,
  itemId,
  itemName,
  currentFolderId,
  onSuccess,
}: MoveModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const fetchFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch {
      toast.error("Không thể tải danh sách thư mục");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(currentFolderId);
      fetchFolders();
    }
  }, [isOpen, currentFolderId, fetchFolders]);

  // Helper to check if a folder is a descendant of itemId (when moving a folder)
  const isDescendant = (folderId: string): boolean => {
    if (type !== "folder") return false;
    if (folderId === itemId) return true;

    let current = folders.find((f) => f.id === folderId);
    while (current && current.parent_id) {
      if (current.parent_id === itemId) return true;
      current = folders.find((f) => f.id === current?.parent_id);
    }
    return false;
  };

  const handleMove = async () => {
    if (selectedFolderId === currentFolderId) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      if (type === "file") {
        const { error } = await supabase
          .from("files")
          .update({
            folder_id: selectedFolderId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("folders")
          .update({
            parent_id: selectedFolderId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (error) throw error;
      }

      toast.success(`Đã di chuyển "${itemName}" thành công!`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể di chuyển mục này";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="h-5 w-5 text-primary" />
            <span>Di chuyển &quot;{itemName}&quot;</span>
          </DialogTitle>
          <DialogDescription>
            Chọn thư mục đích bạn muốn chuyển mục này tới.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 max-h-[300px] overflow-y-auto space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Đang tải danh sách thư mục...</span>
            </div>
          ) : (
            <>
              {/* Root destination */}
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  selectedFolderId === null
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <Home className="h-4 w-4 text-primary shrink-0" />
                <span>Thư mục gốc (Tệp của tôi)</span>
              </button>

              {/* Folders list */}
              {folders.map((folder) => {
                const disabled = folder.id === itemId || isDescendant(folder.id);
                const isSelected = selectedFolderId === folder.id;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : disabled
                        ? "opacity-40 cursor-not-allowed text-muted-foreground"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <FolderIcon className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="truncate">{folder.name}</span>
                    {disabled && type === "folder" && (
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        (Không thể chọn)
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleMove}
            disabled={isSaving || isLoading}
            className="rounded-xl"
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Di chuyển tới đây
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
