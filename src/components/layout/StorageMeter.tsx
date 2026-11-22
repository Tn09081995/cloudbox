"use client";

import React from "react";
import Link from "next/link";
import { HardDrive } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { vi } from "@/lib/i18n/vi";
import { formatBytes } from "@/lib/utils/formatters";

export const MOCK_STORAGE_TOTAL_BYTES = 200 * 1024 * 1024 * 1024; // 200 GB
export const MOCK_STORAGE_USED_BYTES = 18.4 * 1024 * 1024; // ~18,4 MB

interface StorageMeterProps {
  collapsed?: boolean;
  usedBytes?: number;
  totalBytes?: number;
}

export function StorageMeter({
  collapsed = false,
  usedBytes = MOCK_STORAGE_USED_BYTES,
  totalBytes = MOCK_STORAGE_TOTAL_BYTES,
}: StorageMeterProps) {
  // Percentage with a visual minimum fill so it never looks blank
  const rawPercent = (usedBytes / totalBytes) * 100;
  const visualPercent = Math.max(3.5, Math.min(100, rawPercent));

  const usedStr = formatBytes(usedBytes);
  const totalStr = formatBytes(totalBytes, 0);

  // Breakdown mock data
  const breakdown = [
    { label: vi.storage.images, size: "11,2 MB", color: "bg-kind-image" },
    { label: vi.storage.documents, size: "4,6 MB", color: "bg-kind-document" },
    { label: vi.storage.videos, size: "1,8 MB", color: "bg-kind-video" },
    { label: vi.storage.other, size: "800 KB", color: "bg-kind-other" },
  ];

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              className="flex items-center justify-center h-10 w-10 mx-auto rounded-card bg-surface hover:bg-surface-2 border border-border text-muted-foreground hover:text-foreground transition-colors group"
              aria-label={vi.storage.title}
            >
              <HardDrive className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="w-56 p-3 rounded-card bg-surface border border-border shadow-lg">
            <p className="text-xs font-semibold text-foreground mb-1">{vi.storage.title}</p>
            <p className="text-xs text-muted-foreground font-mono mb-2">
              {vi.storage.usedText(usedStr, totalStr)}
            </p>
            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${visualPercent}%` }}
              />
            </div>
            <div className="space-y-1">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-mono text-foreground">{item.size}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-3 rounded-card bg-surface hover:bg-surface/80 border border-border shadow-card transition-all duration-cb cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  {vi.storage.title}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                {vi.storage.usedText(usedStr, totalStr)}
              </span>
            </div>

            {/* Thin meter bar with visible minimum fill */}
            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${visualPercent}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-60 p-3 rounded-card bg-surface border border-border shadow-lg font-sans"
        >
          <p className="text-xs font-semibold text-foreground mb-1.5">
            {vi.storage.breakdownTitle}
          </p>
          <div className="space-y-1.5">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  {item.label}
                </span>
                <span className="font-mono tabular-nums text-foreground">{item.size}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 pt-2 border-t border-border flex justify-end">
            <Link
              href="/settings"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Xem chi tiết →
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
