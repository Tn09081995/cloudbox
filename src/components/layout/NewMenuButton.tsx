"use client";

import React, { useRef } from "react";
import { Plus, Upload, FolderPlus, FilePlus, FolderUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { vi } from "@/lib/i18n/vi";

interface NewMenuButtonProps {
  collapsed?: boolean;
  onUploadFiles?: (files: FileList | null) => void;
  className?: string;
}

export function NewMenuButton({
  collapsed = false,
  onUploadFiles,
  className = "",
}: NewMenuButtonProps) {
  const { setNewFolderOpen, setNewTextFileOpen } = useUiStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUploadFiles) {
      onUploadFiles(e.target.files);
    }
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard for folder picker
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`flex items-center justify-center font-medium transition-all duration-cb select-none outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              collapsed
                ? "h-11 w-11 rounded-card bg-surface hover:bg-surface-2 text-foreground border border-border shadow-card hover:shadow-card-hover mx-auto"
                : "h-11 px-4 gap-2.5 rounded-card bg-surface hover:bg-surface-2 text-foreground border border-border shadow-card hover:shadow-card-hover w-full"
            } ${className}`}
            aria-label={vi.actions.new}
          >
            <div className="h-6 w-6 rounded-btn bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
              <Plus className="h-4 w-4 stroke-[2.5]" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight text-foreground">
                {vi.actions.new}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={collapsed ? "center" : "start"}
          side={collapsed ? "right" : "bottom"}
          sideOffset={8}
          className="w-56 p-1.5 rounded-card bg-surface border border-border shadow-lg font-sans"
        >
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-btn cursor-pointer font-medium hover:bg-surface-2 focus:bg-surface-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 text-primary" />
            <span>{vi.actions.uploadFile}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-btn cursor-pointer font-medium hover:bg-surface-2 focus:bg-surface-2"
            onClick={() => folderInputRef.current?.click()}
          >
            <FolderUp className="h-4 w-4 text-kind-folder" />
            <span>{vi.actions.uploadFolder}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border" />

          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-btn cursor-pointer font-medium hover:bg-surface-2 focus:bg-surface-2"
            onClick={() => setNewFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4 text-kind-folder" />
            <span>{vi.actions.newFolder}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-btn cursor-pointer font-medium hover:bg-surface-2 focus:bg-surface-2"
            onClick={() => setNewTextFileOpen(true)}
          >
            <FilePlus className="h-4 w-4 text-kind-document" />
            <span>{vi.actions.newTextFile}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
