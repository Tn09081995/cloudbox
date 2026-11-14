"use client";

import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FileCode,
  Archive,
  File as GenericFile,
  MoreVertical,
  Eye,
  Download,
  Share2,
  Edit3,
  FolderInput,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileRecord, ViewMode } from "@/types";
import { formatBytes, formatDate, getFileCategory } from "@/lib/utils";

interface FileItemProps {
  file: FileRecord;
  viewMode: ViewMode;
  isTrash?: boolean;
  onPreview: (file: FileRecord) => void;
  onDownload: (file: FileRecord) => void;
  onShare: (file: FileRecord) => void;
  onRename: (file: FileRecord) => void;
  onMove: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
  onRestore?: (file: FileRecord) => void;
}

export function FileItem({
  file,
  viewMode,
  isTrash = false,
  onPreview,
  onDownload,
  onShare,
  onRename,
  onMove,
  onDelete,
  onRestore,
}: FileItemProps) {
  const category = getFileCategory(file.mime_type, file.name);

  const renderIcon = (className = "h-5 w-5") => {
    switch (category) {
      case "image":
        return <ImageIcon className={`${className} text-blue-500`} />;
      case "pdf":
        return <FileText className={`${className} text-rose-500`} />;
      case "video":
        return <Film className={`${className} text-purple-500`} />;
      case "audio":
        return <Music className={`${className} text-pink-500`} />;
      case "code":
      case "text":
        return <FileCode className={`${className} text-emerald-500`} />;
      case "archive":
        return <Archive className={`${className} text-amber-500`} />;
      default:
        return <GenericFile className={`${className} text-muted-foreground`} />;
    }
  };

  const actionMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg opacity-80 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Tùy chọn</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isTrash ? (
          <>
            {onRestore && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(file);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2 text-primary" />
                <span>Khôi phục</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Xóa vĩnh viễn</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPreview(file);
              }}
            >
              <Eye className="h-4 w-4 mr-2 text-primary" />
              <span>Xem trước</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDownload(file);
              }}
            >
              <Download className="h-4 w-4 mr-2 text-blue-500" />
              <span>Tải xuống</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onShare(file);
              }}
            >
              <Share2 className="h-4 w-4 mr-2 text-indigo-500" />
              <span>Chia sẻ</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename(file);
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              <span>Đổi tên</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMove(file);
              }}
            >
              <FolderInput className="h-4 w-4 mr-2" />
              <span>Di chuyển</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Chuyển vào thùng rác</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Grid view
  if (viewMode === "grid") {
    return (
      <div
        onClick={() => !isTrash && onPreview(file)}
        className="group relative flex flex-col justify-between p-4 rounded-2xl border bg-card hover:bg-accent/40 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer select-none"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center">
            {renderIcon("h-5 w-5")}
          </div>
          {actionMenu}
        </div>

        <div className="mt-4 space-y-1">
          <p
            className="text-sm font-semibold text-foreground truncate"
            title={file.name}
          >
            {file.name}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatBytes(file.size)}</span>
            <span>{formatDate(file.created_at).split(" ")[0]}</span>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      onClick={() => !isTrash && onPreview(file)}
      className="group flex items-center justify-between px-4 py-3 rounded-xl border bg-card hover:bg-accent/40 hover:border-primary/40 transition-colors cursor-pointer select-none"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
          {renderIcon("h-4 w-4")}
        </div>
        <span
          className="text-sm font-medium text-foreground truncate max-w-xs md:max-w-md lg:max-w-lg"
          title={file.name}
        >
          {file.name}
        </span>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <span className="hidden sm:inline-block text-xs text-muted-foreground w-20 text-right">
          {formatBytes(file.size)}
        </span>
        <span className="hidden md:inline-block text-xs text-muted-foreground w-36 text-right">
          {formatDate(file.created_at)}
        </span>
        {actionMenu}
      </div>
    </div>
  );
}
