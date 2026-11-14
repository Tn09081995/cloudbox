"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDrive } from "@/context/DriveContext";
import { createClient } from "@/lib/supabase/client";
import { Folder, FileRecord } from "@/types";
import { FileGrid } from "@/components/files/FileGrid";
import { FileList } from "@/components/files/FileList";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Loader2,
  SearchX,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function TrashPage() {
  const {
    viewMode,
    searchQuery,
    sortField,
    sortOrder,
    refreshKey,
    triggerRefresh,
    openDeleteModal,
  } = useDrive();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurging, setIsPurging] = useState(false);

  const supabase = createClient();

  const fetchTrash = useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [foldersRes, filesRes] = await Promise.all([
        supabase
          .from("folders")
          .select("*")
          .eq("owner_id", user.id)
          .not("deleted_at", "is", null),
        supabase
          .from("files")
          .select("*")
          .eq("owner_id", user.id)
          .not("deleted_at", "is", null),
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (filesRes.error) throw filesRes.error;

      setFolders(foldersRes.data || []);
      setFiles(filesRes.data || []);
    } catch {
      toast.error("Không thể tải danh sách thùng rác");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash, refreshKey]);

  // Restore file
  const handleRestoreFile = async (file: FileRecord) => {
    try {
      const { error } = await supabase
        .from("files")
        .update({ deleted_at: null })
        .eq("id", file.id);

      if (error) throw error;
      toast.success(`Đã khôi phục "${file.name}"!`);
      triggerRefresh();
    } catch {
      toast.error("Không thể khôi phục tệp này");
    }
  };

  // Restore folder
  const handleRestoreFolder = async (folder: Folder) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ deleted_at: null })
        .eq("id", folder.id);

      if (error) throw error;
      toast.success(`Đã khôi phục thư mục "${folder.name}"!`);
      triggerRefresh();
    } catch {
      toast.error("Không thể khôi phục thư mục này");
    }
  };

  // Empty all trash
  const handleEmptyTrash = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tất cả tệp trong thùng rác không?")) {
      return;
    }

    try {
      setIsPurging(true);

      // Remove files from storage
      const storagePaths = files.map((f) => f.storage_path);
      if (storagePaths.length > 0) {
        await supabase.storage.from("cloudbox").remove(storagePaths);
      }

      // Delete from DB (quota automatically subtracted by Postgres triggers)
      if (files.length > 0) {
        await supabase
          .from("files")
          .delete()
          .in(
            "id",
            files.map((f) => f.id)
          );
      }

      if (folders.length > 0) {
        await supabase
          .from("folders")
          .delete()
          .in(
            "id",
            folders.map((f) => f.id)
          );
      }

      toast.success("Đã dọn sạch thùng rác thành công!");
      triggerRefresh();
    } catch {
      toast.error("Đã xảy ra lỗi khi dọn sạch thùng rác");
    } finally {
      setIsPurging(false);
    }
  };

  // Filter & Sort
  const filteredFolders = useMemo(() => {
    let result = [...folders];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });
    return result;
  }, [folders, searchQuery, sortField, sortOrder]);

  const filteredFiles = useMemo(() => {
    let result = [...files];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortField === "size") {
        return sortOrder === "asc" ? a.size - b.size : b.size - a.size;
      }
      return 0;
    });
    return result;
  }, [files, searchQuery, sortField, sortOrder]);

  const totalItems = filteredFolders.length + filteredFiles.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <span>Thùng rác</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Các mục bị xóa sẽ tự động bị xóa vĩnh viễn sau 30 ngày
          </p>
        </div>

        {totalItems > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmptyTrash}
            disabled={isPurging}
            className="rounded-xl shadow-xs gap-1.5"
          >
            {isPurging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>Dọn sạch thùng rác</span>
          </Button>
        )}
      </div>

      {/* Info notice */}
      <div className="p-3.5 rounded-xl border border-blue-200/50 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2.5">
        <Info className="h-4 w-4 shrink-0 text-blue-500" />
        <span>
          Các tệp trong thùng rác vẫn chiếm dung lượng tài khoản cho đến khi bạn xóa vĩnh viễn hoặc hệ thống tự động dọn dẹp sau 30 ngày.
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Đang tải thùng rác...</p>
        </div>
      ) : totalItems === 0 ? (
        searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              <SearchX className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg">Không tìm thấy kết quả</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Không tìm thấy mục nào khớp với &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="h-16 w-16 rounded-3xl bg-muted/60 flex items-center justify-center text-muted-foreground">
              <Trash2 className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Thùng rác trống
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Không có tệp hoặc thư mục nào trong thùng rác của bạn.
            </p>
          </div>
        )
      ) : viewMode === "grid" ? (
        <FileGrid
          folders={filteredFolders}
          files={filteredFiles}
          isTrash={true}
          onPreviewFile={() => {}}
          onDownloadFile={() => {}}
          onShareFile={() => {}}
          onRenameFolder={() => {}}
          onRenameFile={() => {}}
          onMoveFolder={() => {}}
          onMoveFile={() => {}}
          onDeleteFolder={(f) =>
            openDeleteModal("folder", f.id, f.name, undefined, true)
          }
          onDeleteFile={(f) =>
            openDeleteModal("file", f.id, f.name, f.storage_path, true)
          }
          onRestoreFolder={handleRestoreFolder}
          onRestoreFile={handleRestoreFile}
        />
      ) : (
        <FileList
          folders={filteredFolders}
          files={filteredFiles}
          isTrash={true}
          onPreviewFile={() => {}}
          onDownloadFile={() => {}}
          onShareFile={() => {}}
          onRenameFolder={() => {}}
          onRenameFile={() => {}}
          onMoveFolder={() => {}}
          onMoveFile={() => {}}
          onDeleteFolder={(f) =>
            openDeleteModal("folder", f.id, f.name, undefined, true)
          }
          onDeleteFile={(f) =>
            openDeleteModal("file", f.id, f.name, f.storage_path, true)
          }
          onRestoreFolder={handleRestoreFolder}
          onRestoreFile={handleRestoreFile}
        />
      )}
    </div>
  );
}
