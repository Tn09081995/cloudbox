"use client";

import React, { useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  File,
} from "lucide-react";
import { useUploadStore } from "@/lib/hooks/useUploadStore";
import { vi } from "@/lib/i18n/vi";
import { formatBytes } from "@/lib/utils/formatters";

export function UploadManager() {
  const {
    items,
    isOpen,
    isMinimized,
    setIsOpen,
    setIsMinimized,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
  } = useUploadStore();

  const total = items.length;
  const completed = items.filter((i) => i.status === "completed").length;
  const isAllDone = total > 0 && completed === total;

  // Auto-collapse header when all finished
  useEffect(() => {
    if (isAllDone) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAllDone, setIsMinimized]);

  if (!isOpen || total === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96 rounded-card bg-surface border border-border shadow-2xl overflow-hidden font-sans select-none animate-in slide-in-from-bottom-2 duration-cb">
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 bg-surface border-b border-border/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">
            {isAllDone
              ? vi.uploadManager.completed(completed, total)
              : `Đang tải lên ${completed}/${total}`}
          </span>
          {isAllDone && (
            <CheckCircle2 className="h-4 w-4 text-semantic-success stroke-[2.5]" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label={isMinimized ? "Mở rộng" : "Thu gọn"}
          >
            {isMinimized ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Close Manager */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body List (collapsible) */}
      {!isMinimized && (
        <div className="max-h-64 overflow-y-auto divide-y divide-border/60 p-1">
          {items.map((item) => (
            <div key={item.id} className="p-2.5 flex items-start gap-2.5 hover:bg-surface-2/60 rounded-btn transition-colors">
              <div className="h-7 w-7 rounded bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <File className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-foreground truncate max-w-[170px]">
                    {item.name}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {formatBytes(item.size)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.status === "failed"
                        ? "bg-semantic-danger"
                        : item.status === "completed"
                        ? "bg-semantic-success"
                        : "bg-primary"
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                {/* Subtext info & speed */}
                <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                  {item.status === "uploading" && (
                    <span>
                      {vi.uploadManager.speed(item.speed)} • {vi.uploadManager.eta(item.eta)}
                    </span>
                  )}
                  {item.status === "paused" && <span>Đã tạm dừng</span>}
                  {item.status === "completed" && (
                    <span className="text-semantic-success font-medium">Hoàn tất 100%</span>
                  )}
                  {item.status === "failed" && (
                    <span className="text-semantic-danger font-medium">
                      {item.error || "Thất bại"}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons per item */}
              <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                {item.status === "uploading" && (
                  <button
                    type="button"
                    onClick={() => pauseUpload(item.id)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2"
                    title={vi.uploadManager.pause}
                  >
                    <Pause className="h-3.5 w-3.5" />
                  </button>
                )}

                {item.status === "paused" && (
                  <button
                    type="button"
                    onClick={() => resumeUpload(item.id)}
                    className="p-1 rounded text-primary hover:bg-primary-soft"
                    title={vi.uploadManager.resume}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>
                )}

                {item.status === "failed" && (
                  <button
                    type="button"
                    onClick={() => retryUpload(item.id)}
                    className="p-1 rounded text-primary hover:bg-primary-soft"
                    title={vi.uploadManager.retry}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => cancelUpload(item.id)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  title={vi.uploadManager.cancel}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
