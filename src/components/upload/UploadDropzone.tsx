"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FolderUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isCompact?: boolean;
}

export function UploadDropzone({
  onFilesSelected,
  isCompact = false,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer group select-none",
        isDragOver
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-accent/40 bg-card/50",
        isCompact ? "p-4 text-center" : "p-8 text-center"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110",
          isCompact ? "h-10 w-10 mb-2" : "h-14 w-14 mb-4"
        )}
      >
        {isDragOver ? (
          <FolderUp className={isCompact ? "h-5 w-5" : "h-7 w-7"} />
        ) : (
          <UploadCloud className={isCompact ? "h-5 w-5" : "h-7 w-7"} />
        )}
      </div>

      <div className="space-y-1">
        <p className="font-semibold text-sm text-foreground">
          {isDragOver
            ? "Thả tệp vào đây ngay!"
            : "Kéo thả tệp vào đây hoặc bấm để chọn"}
        </p>
        <p className="text-xs text-muted-foreground">
          Hỗ trợ tải lên nhiều tệp cùng lúc (ảnh, tài liệu, video, âm thanh,...)
        </p>
      </div>
    </div>
  );
}
