"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import { useUploadStore } from "@/lib/hooks/useUploadStore";
import { vi } from "@/lib/i18n/vi";

interface DragOverlayProps {
  currentFolderId?: string | null;
}

export function DragOverlay({ currentFolderId = null }: DragOverlayProps) {
  const { addFiles } = useUploadStore();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      // Check if files are being dragged from external OS
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
        dragCounter++;
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) {
          dragCounter = 0;
          setIsDragging(false);
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
        dragCounter = 0;
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          addFiles(e.dataTransfer.files, currentFolderId);
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [addFiles, currentFolderId]);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 p-6 pointer-events-none flex items-center justify-center bg-background/80 backdrop-blur-[2px] animate-in fade-in duration-cb">
      <div className="w-full h-full rounded-3xl border-2 border-dashed border-primary bg-primary-soft/30 flex flex-col items-center justify-center text-center p-8">
        <div className="h-16 w-16 rounded-2xl bg-primary text-white shadow-lg flex items-center justify-center mb-4 animate-bounce">
          <UploadCloud className="h-8 w-8 stroke-[2.2]" />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          {vi.dragOverlay.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {vi.dragOverlay.desc}
        </p>
      </div>
    </div>
  );
}
