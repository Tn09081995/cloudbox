"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDrive } from "@/context/DriveContext";
import { createClient } from "@/lib/supabase/client";
import { Folder, FileRecord, BreadcrumbItem } from "@/types";
import { getDemoFolders, getDemoFiles } from "@/lib/demo-storage";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FolderPlus,
  Loader2,
  Inbox,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";

interface DriveViewProps {
  folderId: string | null;
}

export function DriveView({ folderId }: DriveViewProps) {
  const {
    viewMode,
    searchQuery,
    sortField,
    sortOrder,
    refreshKey,
    openUploadModal,
    openCreateFolderModal,
    openRenameModal,
    openMoveModal,
    openDeleteModal,
    openPreviewModal,
    openShareModal,
    downloadFile,
  } = useDrive();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Fetch current folder ancestors for breadcrumbs
  const fetchBreadcrumbs = useCallback(
    async (currentId: string | null) => {
      if (!currentId) {
        setBreadcrumbs([]);
        return;
      }

      try {
        const trail: BreadcrumbItem[] = [];
        let cur: string | null = currentId;

        // Traverse upwards up to 10 levels
        let depth = 0;
        while (cur && depth < 10) {
          depth++;
          const { data, error } = await supabase
            .from("folders")
            .select("id, name, parent_id")
            .eq("id", cur)
            .maybeSingle();

          const folderData = data as {
            id: string;
            name: string;
            parent_id: string | null;
          } | null;

          if (error || !folderData) break;

          trail.unshift({ id: folderData.id, name: folderData.name });
          cur = folderData.parent_id;
        }

        setBreadcrumbs(trail);
      } catch {
        // Ignore breadcrumb error
      }
    },
    [supabase]
  );

  // Fetch folders and files in current folder
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Fallback to demo local storage
        const allFolders = getDemoFolders().filter((f) => f.deleted_at === null);
        const allFiles = getDemoFiles().filter((f) => f.deleted_at === null);

        const currentFolders = folderId
          ? allFolders.filter((f) => f.parent_id === folderId)
          : allFolders.filter((f) => f.parent_id === null);

        const currentFiles = folderId
          ? allFiles.filter((f) => f.folder_id === folderId)
          : allFiles.filter((f) => f.folder_id === null);

        setFolders(currentFolders);
        setFiles(currentFiles);

        if (folderId) {
          const trail: BreadcrumbItem[] = [];
          let cur: string | null = folderId;
          let depth = 0;
          while (cur && depth < 10) {
            depth++;
            const found = allFolders.find((f) => f.id === cur);
            if (!found) break;
            trail.unshift({ id: found.id, name: found.name });
            cur = found.parent_id;
          }
          setBreadcrumbs(trail);
        } else {
          setBreadcrumbs([]);
        }
        return;
      }

      // 1. Fetch folders
      let foldersQuery = supabase
        .from("folders")
        .select("*")
        .eq("owner_id", user.id)
        .is("deleted_at", null);

      if (folderId) {
        foldersQuery = foldersQuery.eq("parent_id", folderId);
      } else {
        foldersQuery = foldersQuery.is("parent_id", null);
      }

      // 2. Fetch files
      let filesQuery = supabase
        .from("files")
        .select("*")
        .eq("owner_id", user.id)
        .is("deleted_at", null);

      if (folderId) {
        filesQuery = filesQuery.eq("folder_id", folderId);
      } else {
        filesQuery = filesQuery.is("folder_id", null);
      }

      const [foldersRes, filesRes] = await Promise.all([
        foldersQuery,
        filesQuery,
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (filesRes.error) throw filesRes.error;

      setFolders(foldersRes.data || []);
      setFiles(filesRes.data || []);
      await fetchBreadcrumbs(folderId);
    } catch {
      toast.error("Không thể tải danh sách tệp");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, folderId, fetchBreadcrumbs]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

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
      if (sortField === "created_at") {
        const tA = new Date(a.created_at).getTime();
        const tB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? tA - tB : tB - tA;
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
      if (sortField === "created_at") {
        const tA = new Date(a.created_at).getTime();
        const tB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? tA - tB : tB - tA;
      }
      return 0;
    });

    return result;
  }, [files, searchQuery, sortField, sortOrder]);

  const totalItems = filteredFolders.length + filteredFiles.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar: Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => openUploadModal(folderId)}
            className="rounded-xl shadow-xs font-semibold gap-1.5"
          >
            <Upload className="h-4 w-4" />
            <span>Tải lên</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openCreateFolderModal(folderId)}
            className="rounded-xl gap-1.5"
          >
            <FolderPlus className="h-4 w-4 text-amber-500" />
            <span>Thư mục mới</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Đang tải tệp tin và thư mục...</p>
        </div>
      ) : totalItems === 0 ? (
        searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              <SearchX className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg">Không tìm thấy kết quả</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Không tìm thấy tệp hoặc thư mục nào khớp với &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <Inbox className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">
                Thư mục trống
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Bạn chưa có tệp hoặc thư mục nào ở đây. Hãy bắt đầu bằng cách tải tệp lên hoặc tạo thư mục mới.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => openUploadModal(folderId)}
                className="rounded-xl gap-2"
              >
                <Upload className="h-4 w-4" />
                <span>Tải tệp lên</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => openCreateFolderModal(folderId)}
                className="rounded-xl gap-2"
              >
                <FolderPlus className="h-4 w-4 text-amber-500" />
                <span>Thư mục mới</span>
              </Button>
            </div>
          </div>
        )
      ) : viewMode === "grid" ? (
        <FileGrid
          folders={filteredFolders}
          files={filteredFiles}
          onPreviewFile={openPreviewModal}
          onDownloadFile={downloadFile}
          onShareFile={openShareModal}
          onRenameFolder={(f) => openRenameModal("folder", f.id, f.name)}
          onRenameFile={(f) => openRenameModal("file", f.id, f.name)}
          onMoveFolder={(f) => openMoveModal("folder", f.id, f.name, f.parent_id)}
          onMoveFile={(f) => openMoveModal("file", f.id, f.name, f.folder_id)}
          onDeleteFolder={(f) => openDeleteModal("folder", f.id, f.name)}
          onDeleteFile={(f) =>
            openDeleteModal("file", f.id, f.name, f.storage_path)
          }
        />
      ) : (
        <FileList
          folders={filteredFolders}
          files={filteredFiles}
          onPreviewFile={openPreviewModal}
          onDownloadFile={downloadFile}
          onShareFile={openShareModal}
          onRenameFolder={(f) => openRenameModal("folder", f.id, f.name)}
          onRenameFile={(f) => openRenameModal("file", f.id, f.name)}
          onMoveFolder={(f) => openMoveModal("folder", f.id, f.name, f.parent_id)}
          onMoveFile={(f) => openMoveModal("file", f.id, f.name, f.folder_id)}
          onDeleteFolder={(f) => openDeleteModal("folder", f.id, f.name)}
          onDeleteFile={(f) =>
            openDeleteModal("file", f.id, f.name, f.storage_path)
          }
        />
      )}
    </div>
  );
}
