"use client";

import React from "react";
import {
  Share2,
  Download,
  FolderInput,
  Star,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { vi } from "@/lib/i18n/vi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SelectionToolbarProps {
  selectedCount: number;
  onShare?: () => void;
  onDownload?: () => void;
  onMove?: () => void;
  onStar?: () => void;
  onTrash?: () => void;
  isTrash?: boolean;
  onRestore?: () => void;
  onDeleteForever?: () => void;
}

export function SelectionToolbar({
  selectedCount,
  onShare,
  onDownload,
  onMove,
  onStar,
  onTrash,
  isTrash = false,
  onRestore,
  onDeleteForever,
}: SelectionToolbarProps) {
  const { clearSelection } = useUiStore();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between h-12 px-4 rounded-card bg-primary-soft border border-primary/20 text-primary animate-in fade-in slide-in-from-top-1 duration-cb">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={clearSelection}
          className="p-1 rounded-btn hover:bg-primary/10 transition-colors"
          aria-label={vi.selection.clear}
        >
          <X className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold tracking-tight">
          {vi.selection.selectedCount(selectedCount)}
        </span>
      </div>

      <TooltipProvider delayDuration={150}>
        <div className="flex items-center gap-1">
          {isTrash ? (
            <>
              {onRestore && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onRestore}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn hover:bg-primary/10 transition-colors text-xs font-semibold"
                      aria-label={vi.actions.restore}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{vi.actions.restore}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{vi.actions.restore}</TooltipContent>
                </Tooltip>
              )}

              {onDeleteForever && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onDeleteForever}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-semantic-danger hover:bg-semantic-danger/10 transition-colors text-xs font-semibold"
                      aria-label={vi.actions.deleteForever}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{vi.actions.deleteForever}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{vi.actions.deleteForever}</TooltipContent>
                </Tooltip>
              )}
            </>
          ) : (
            <>
              {onShare && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onShare}
                      className="p-2 rounded-btn hover:bg-primary/10 transition-colors"
                      aria-label={vi.actions.share}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{vi.actions.share}</TooltipContent>
                </Tooltip>
              )}

              {onDownload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onDownload}
                      className="p-2 rounded-btn hover:bg-primary/10 transition-colors"
                      aria-label={vi.actions.download}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{vi.actions.download}</TooltipContent>
                </Tooltip>
              )}

              {onMove && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onMove}
                      className="p-2 rounded-btn hover:bg-primary/10 transition-colors"
                      aria-label={vi.actions.move}
                    >
                      <FolderInput className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{vi.actions.move}</TooltipContent>
                </Tooltip>
              )}

              {onStar && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onStar}
                      className="p-2 rounded-btn hover:bg-primary/10 transition-colors"
                      aria-label={vi.actions.star}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{vi.actions.star}</TooltipContent>
                </Tooltip>
              )}

              {onTrash && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onTrash}
                      className="p-2 rounded-btn text-semantic-danger hover:bg-semantic-danger/10 transition-colors"
                      aria-label={vi.actions.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{vi.actions.delete}</TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
