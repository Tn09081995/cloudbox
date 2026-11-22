"use client";

import React from "react";
import { FileNode } from "@/lib/mock/types";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";

interface FileGridProps {
  nodes: FileNode[];
  onPreview?: (file: FileNode) => void;
  onShare?: (file: FileNode) => void;
  onRename?: (file: FileNode) => void;
  onMove?: (file: FileNode) => void;
  onDelete?: (file: FileNode) => void;
  isTrash?: boolean;
  onRestore?: (file: FileNode) => void;
}

export function FileGrid({
  nodes,
  onPreview,
  onShare,
  onRename,
  onMove,
  onDelete,
  isTrash = false,
  onRestore,
}: FileGridProps) {
  const folders = nodes.filter((n) => n.kind === "folder");
  const files = nodes.filter((n) => n.kind !== "folder");

  return (
    <div className="w-full space-y-6">
      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Thư mục ({folders.length})
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 md:gap-4 w-full">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpenRename={onRename}
                onOpenMove={onMove}
                onOpenDelete={onDelete}
                isTrash={isTrash}
                onRestore={onRestore}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Tệp tin ({files.length})
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 md:gap-4 w-full">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onPreview={onPreview}
                onShare={onShare}
                onRename={onRename}
                onMove={onMove}
                onDelete={onDelete}
                isTrash={isTrash}
                onRestore={onRestore}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
