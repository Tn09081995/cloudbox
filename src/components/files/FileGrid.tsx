"use client";

import React, { useMemo } from "react";
import { FileNode } from "@/lib/mock/types";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { vi as viLocale } from "date-fns/locale";

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

interface DateGroup {
  dayKey: string;
  dayLabel: string;
  files: FileNode[];
}

interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  dateGroups: DateGroup[];
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
  const folders = useMemo(() => nodes.filter((n) => n.kind === "folder"), [nodes]);
  const files = useMemo(() => nodes.filter((n) => n.kind !== "folder"), [nodes]);

  // Group files by Month and Day like Google Photos
  const monthGroups = useMemo(() => {
    // Sort files newest first
    const sorted = [...files].sort(
      (a, b) => new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime()
    );

    const monthMap = new Map<string, { monthLabel: string; dayMap: Map<string, { dayLabel: string; files: FileNode[] }> }>();

    for (const file of sorted) {
      const date = parseISO(file.created_at || file.updated_at);
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = `Tháng ${format(date, "M, yyyy")}`;

      let dayLabel = "";
      if (isToday(date)) {
        dayLabel = `Hôm nay, ${format(date, "d 'tháng' M", { locale: viLocale })}`;
      } else if (isYesterday(date)) {
        dayLabel = `Hôm qua, ${format(date, "d 'tháng' M", { locale: viLocale })}`;
      } else {
        dayLabel = format(date, "EEEE, 'ngày' d 'tháng' M", { locale: viLocale });
        // Capitalize first letter (e.g., Thứ hai -> Thứ Hai)
        dayLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
      }
      const dayKey = format(date, "yyyy-MM-dd");

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          monthLabel,
          dayMap: new Map(),
        });
      }

      const m = monthMap.get(monthKey)!;
      if (!m.dayMap.has(dayKey)) {
        m.dayMap.set(dayKey, { dayLabel, files: [] });
      }
      m.dayMap.get(dayKey)!.files.push(file);
    }

    const result: MonthGroup[] = [];
    monthMap.forEach((mVal, mKey) => {
      const dateGroups: DateGroup[] = [];
      mVal.dayMap.forEach((dVal, dKey) => {
        dateGroups.push({
          dayKey: dKey,
          dayLabel: dVal.dayLabel,
          files: dVal.files,
        });
      });
      result.push({
        monthKey: mKey,
        monthLabel: mVal.monthLabel,
        dateGroups,
      });
    });

    return result;
  }, [files]);

  return (
    <div className="w-full space-y-8 pb-8">
      {/* ======================================================== */}
      {/* FOLDERS SECTION (Google Drive Rounded Chips) */}
      {/* ======================================================== */}
      {folders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted font-mono">
            Thư mục ({folders.length})
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3 w-full">
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

      {/* ======================================================== */}
      {/* FILES SECTION (Google Photos style grouped by Month & Day) */}
      {/* ======================================================== */}
      {files.length > 0 && (
        <div className="space-y-8">
          {monthGroups.map((month) => (
            <div key={month.monthKey} className="space-y-5">
              {/* Large Month Header (Google Photos style text-2xl font-normal) */}
              <div className="border-b border-border/40 pb-2">
                <h2 className="text-xl md:text-2xl font-normal text-foreground tracking-tight">
                  {month.monthLabel}
                </h2>
              </div>

              {/* Day Groups within this Month */}
              <div className="space-y-6">
                {month.dateGroups.map((group) => (
                  <div key={group.dayKey} className="space-y-2.5">
                    {/* Date Subheader */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-muted">
                        {group.dayLabel}
                      </span>
                      <span className="text-[11px] text-muted/70 font-mono">
                        {group.files.length} mục
                      </span>
                    </div>

                    {/* Responsive Grid of Cards */}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 md:gap-4 w-full">
                      {group.files.map((file) => (
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
