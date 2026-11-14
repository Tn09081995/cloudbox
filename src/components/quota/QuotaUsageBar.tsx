"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import { HardDrive, AlertTriangle } from "lucide-react";

interface QuotaUsageBarProps {
  usedBytes: number;
  quotaBytes: number;
  className?: string;
}

export function QuotaUsageBar({
  usedBytes,
  quotaBytes,
  className = "",
}: QuotaUsageBarProps) {
  const percent = Math.min(100, Math.round((usedBytes / (quotaBytes || 1)) * 100));
  const isFull = usedBytes >= quotaBytes;
  const isNearLimit = percent >= 85 && !isFull;

  return (
    <div className={`space-y-2 p-3 rounded-xl bg-card border shadow-sm ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <HardDrive className="h-3.5 w-3.5 text-primary" />
          <span>Dung lượng lưu trữ</span>
        </div>
        <span className="font-semibold text-muted-foreground">{percent}%</span>
      </div>

      <Progress
        value={percent}
        className="h-2 bg-secondary"
        indicatorClassName={
          isFull
            ? "bg-destructive"
            : isNearLimit
            ? "bg-amber-500"
            : "bg-primary"
        }
      />

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
        <span>Đã dùng {formatBytes(usedBytes)}</span>
        <span>/ {formatBytes(quotaBytes)}</span>
      </div>

      {isFull && (
        <div className="flex items-center gap-1.5 text-[11px] text-destructive font-medium pt-1">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Đã đầy bộ nhớ! Hãy xóa bớt tệp.</span>
        </div>
      )}
    </div>
  );
}
