"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ViewMode, SortField, SortOrder, FileRecord } from "@/types";
import { getDemoFiles } from "@/lib/demo-storage";
import { createClient } from "@/lib/supabase/client";

interface DriveContextType {
  usedBytes: number;
  quotaBytes: number;
  refreshQuota: () => Promise<void>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  setSort: (field: SortField, order: SortOrder) => void;
  refreshKey: number;
  triggerRefresh: () => void;

  // Modals state triggers
  openUploadModal: (folderId?: string | null) => void;
  openCreateFolderModal: (folderId?: string | null) => void;
  openRenameModal: (type: "file" | "folder", id: string, name: string) => void;
  openMoveModal: (
    type: "file" | "folder",
    id: string,
    name: string,
    currentFolderId: string | null
  ) => void;
  openDeleteModal: (
    type: "file" | "folder",
    id: string,
    name: string,
    storagePath?: string,
    isPermanent?: boolean
  ) => void;
  openPreviewModal: (file: FileRecord) => void;
  openShareModal: (file: FileRecord) => void;
  downloadFile: (file: FileRecord) => Promise<void>;
}

const DriveContext = createContext<DriveContextType | null>(null);

export function useDrive() {
  const context = useContext(DriveContext);
  if (!context) {
    throw new Error("useDrive must be used within a DriveProvider");
  }
  return context;
}

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const [usedBytes, setUsedBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState(1073741824); // 1 GB default
  const [viewMode, setViewModeState] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal active states
  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  const [renameData, setRenameData] = useState<{
    type: "file" | "folder";
    id: string;
    name: string;
  } | null>(null);

  const [moveData, setMoveData] = useState<{
    type: "file" | "folder";
    id: string;
    name: string;
    currentFolderId: string | null;
  } | null>(null);

  const [deleteData, setDeleteData] = useState<{
    type: "file" | "folder";
    id: string;
    name: string;
    storagePath?: string;
    isPermanent?: boolean;
  } | null>(null);

  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [shareFile, setShareFile] = useState<FileRecord | null>(null);

  const supabase = createClient();

  const DEFAULT_USER_QUOTA = 214748364800; // 200 GB per account

  const fetchQuota = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const demoFiles = getDemoFiles().filter((f) => f.deleted_at === null);
        const used = demoFiles.reduce((acc, f) => acc + f.size, 0);
        setUsedBytes(used);
        setQuotaBytes(DEFAULT_USER_QUOTA);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("used_bytes, quota_bytes")
        .eq("id", user.id)
        .maybeSingle();

      const profile = data as { used_bytes?: number; quota_bytes?: number } | null;

      if (!error && profile) {
        setUsedBytes(profile.used_bytes || 0);
        setQuotaBytes(profile.quota_bytes || DEFAULT_USER_QUOTA);
      } else {
        setQuotaBytes(DEFAULT_USER_QUOTA);
      }
    } catch {
      // Quota fetch fallback
    }
  }, [supabase]);

  // Load view mode from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("cloudbox_view_mode") as ViewMode;
      if (savedMode === "grid" || savedMode === "list") {
        setViewModeState(savedMode);
      }
    } catch {
      // Ignore localStorage errors
    }
    fetchQuota();
  }, [fetchQuota]);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem("cloudbox_view_mode", mode);
    } catch {
      // Ignore
    }
  };

  const setSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchQuota();
  };

  const openUploadModal = (folderId: string | null = null) => {
    setUploadFolderId(folderId);
    setIsUploadOpen(true);
  };

  const openCreateFolderModal = (folderId: string | null = null) => {
    setCreateFolderParentId(folderId);
    setIsCreateFolderOpen(true);
  };

  const openRenameModal = (
    type: "file" | "folder",
    id: string,
    name: string
  ) => {
    setRenameData({ type, id, name });
  };

  const openMoveModal = (
    type: "file" | "folder",
    id: string,
    name: string,
    currentFolderId: string | null
  ) => {
    setMoveData({ type, id, name, currentFolderId });
  };

  const openDeleteModal = (
    type: "file" | "folder",
    id: string,
    name: string,
    storagePath?: string,
    isPermanent = false
  ) => {
    setDeleteData({ type, id, name, storagePath, isPermanent });
  };

  const openPreviewModal = (file: FileRecord) => {
    setPreviewFile(file);
  };

  const openShareModal = (file: FileRecord) => {
    setShareFile(file);
  };

  const downloadFile = async (file: FileRecord) => {
    try {
      if (file.storage_path.startsWith("gdrive:")) {
        const fileId = file.storage_path.replace("gdrive:", "");
        const a = document.createElement("a");
        a.href = `/api/gdrive/file/${fileId}?download=true`;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const { data, error } = await supabase.storage
        .from("cloudbox")
        .createSignedUrl(file.storage_path, 60, {
          download: file.name,
        });

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || "Không thể tải tệp xuống");
      }

      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert("Không thể tải tệp xuống. Vui lòng thử lại sau.");
    }
  };

  return (
    <DriveContext.Provider
      value={{
        usedBytes,
        quotaBytes,
        refreshQuota: fetchQuota,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        sortField,
        sortOrder,
        setSort,
        refreshKey,
        triggerRefresh,
        openUploadModal,
        openCreateFolderModal,
        openRenameModal,
        openMoveModal,
        openDeleteModal,
        openPreviewModal,
        openShareModal,
        downloadFile,
      }}
    >
      {children}

      {/* Upload Modal */}
      {isUploadOpen && (
        <React.Suspense fallback={null}>
          <UploadModalComponent
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            currentFolderId={uploadFolderId}
            usedBytes={usedBytes}
            quotaBytes={quotaBytes}
            onUploadSuccess={triggerRefresh}
          />
        </React.Suspense>
      )}

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <CreateFolderModalComponent
          isOpen={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          currentFolderId={createFolderParentId}
          onSuccess={triggerRefresh}
        />
      )}

      {/* Rename Modal */}
      {renameData && (
        <RenameModalComponent
          isOpen={!!renameData}
          onClose={() => setRenameData(null)}
          type={renameData.type}
          itemId={renameData.id}
          initialName={renameData.name}
          onSuccess={triggerRefresh}
        />
      )}

      {/* Move Modal */}
      {moveData && (
        <MoveModalComponent
          isOpen={!!moveData}
          onClose={() => setMoveData(null)}
          type={moveData.type}
          itemId={moveData.id}
          itemName={moveData.name}
          currentFolderId={moveData.currentFolderId}
          onSuccess={triggerRefresh}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteData && (
        <DeleteConfirmModalComponent
          isOpen={!!deleteData}
          onClose={() => setDeleteData(null)}
          type={deleteData.type}
          itemId={deleteData.id}
          itemName={deleteData.name}
          storagePath={deleteData.storagePath}
          isPermanent={deleteData.isPermanent}
          onSuccess={triggerRefresh}
        />
      )}

      {/* Preview Modal */}
      {previewFile && (
        <PreviewModalComponent
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          file={previewFile}
        />
      )}

      {/* Share Modal */}
      {shareFile && (
        <ShareModalComponent
          isOpen={!!shareFile}
          onClose={() => setShareFile(null)}
          file={shareFile}
        />
      )}
    </DriveContext.Provider>
  );
}

// Lazy/direct imports for modals
import { UploadModal as UploadModalComponent } from "@/components/upload/UploadModal";
import { CreateFolderModal as CreateFolderModalComponent } from "@/components/files/CreateFolderModal";
import { RenameModal as RenameModalComponent } from "@/components/files/RenameModal";
import { MoveModal as MoveModalComponent } from "@/components/files/MoveModal";
import { DeleteConfirmModal as DeleteConfirmModalComponent } from "@/components/files/DeleteConfirmModal";
import { PreviewModal as PreviewModalComponent } from "@/components/preview/PreviewModal";
import { ShareModal as ShareModalComponent } from "@/components/share/ShareModal";
