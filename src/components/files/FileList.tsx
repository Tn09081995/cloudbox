"use client";

import React from "react";
import { Folder, FileRecord } from "@/types";
import { FolderItem } from "./FolderItem";
import { FileItem } from "./FileItem";

interface FileListProps {
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

export function FileList({
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
}: FileListProps) {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
        <span className="flex-1">Tên</span>
        <div className="flex items-center gap-6 shrink-0">
          <span className="hidden sm:inline-block w-20 text-right">Kích thước</span>
          <span className="hidden md:inline-block w-36 text-right">Ngày tải lên</span>
          <span className="w-8"></span>
        </div>
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="space-y-1.5">
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              viewMode="list"
              isTrash={isTrash}
              onRename={onRenameFolder}
              onMove={onMoveFolder}
              onDelete={onDeleteFolder}
              onRestore={onRestoreFolder}
            />
          ))}
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              viewMode="list"
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
      )}
    </div>
  );
}
