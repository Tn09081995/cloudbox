"use client";

import React from "react";
import { Folder, FileRecord } from "@/types";
import { FolderItem } from "./FolderItem";
import { FileItem } from "./FileItem";

interface FileGridProps {
  folders: Folder[];
  files: FileRecord[];
  isTrash?: boolean;
  onPreviewFile: (file: FileRecord) => void;
  onDownloadFile: (file: FileRecord) => void;
  onShareFile: (file: FileRecord) => void;
  onRenameFolder: (folder: Folder) => void;
  onRenameFile: (file: FileRecord) => void;
  onMoveFolder: (folder: Folder) => void;
  onMoveFile: (file: FileRecord) => void;
  onDeleteFolder: (folder: Folder) => void;
  onDeleteFile: (file: FileRecord) => void;
  onRestoreFolder?: (folder: Folder) => void;
  onRestoreFile?: (file: FileRecord) => void;
}

export function FileGrid({
  folders,
  files,
  isTrash = false,
  onPreviewFile,
  onDownloadFile,
  onShareFile,
  onRenameFolder,
  onRenameFile,
  onMoveFolder,
  onMoveFile,
  onDeleteFolder,
  onDeleteFile,
  onRestoreFolder,
  onRestoreFile,
}: FileGridProps) {
  return (
    <div className="space-y-6">
      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Thư mục ({folders.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                viewMode="grid"
                isTrash={isTrash}
                onRename={onRenameFolder}
                onMove={onMoveFolder}
                onDelete={onDeleteFolder}
                onRestore={onRestoreFolder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Tệp tin ({files.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                viewMode="grid"
                isTrash={isTrash}
                onPreview={onPreviewFile}
                onDownload={onDownloadFile}
                onShare={onShareFile}
                onRename={onRenameFile}
                onMove={onMoveFile}
                onDelete={onDeleteFile}
                onRestore={onRestoreFile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
