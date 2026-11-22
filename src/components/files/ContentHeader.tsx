"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { BreadcrumbSegment } from "@/lib/mock/types";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { toast } from "sonner";
import { vi } from "@/lib/i18n/vi";

interface ContentHeaderProps {
  breadcrumbs: BreadcrumbSegment[];
  currentFolderId: string | null;
  title?: string;
}

export function ContentHeader({
  breadcrumbs,
  currentFolderId,
  title,
}: ContentHeaderProps) {
  const { move } = useFileMutations();
  const [dragOverSegmentId, setDragOverSegmentId] = useState<string | null | "root">(null);

  const handleDragOver = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSegmentId(targetId ?? "root");
  };

  const handleDragLeave = () => {
    setDragOverSegmentId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    setDragOverSegmentId(null);

    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      const ids: string[] = data.ids || (data.id ? [data.id] : []);
      if (ids.length === 0) return;

      // Don't move into current folder
      if (targetId === currentFolderId) return;

      await move({ ids, targetFolderId: targetId });
      toast.success(vi.toasts.moved(data.name || `${ids.length} mục`));
    } catch {
      toast.error("Không thể di chuyển tệp");
    }
  };

  // If title is explicitly passed (e.g., Gần đây, Đã gắn sao, Thùng rác)
  if (title) {
    return (
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
    );
  }

  // Breadcrumb collapsing if > 3 segments: e.g. "Tệp của tôi / ... / Dự án / Thiết kế"
  const total = breadcrumbs.length;
  let displayCrumbs = breadcrumbs;

  if (total > 3) {
    displayCrumbs = [
      breadcrumbs[0],
      { id: "collapsed", name: "…" },
      ...breadcrumbs.slice(total - 2),
    ];
  }

  return (
    <nav className="flex items-center gap-1.5 flex-wrap pb-4 select-none" aria-label="Đường dẫn thư mục">
      {displayCrumbs.map((crumb, idx) => {
        const isLast = idx === displayCrumbs.length - 1;
        const isCollapsedEllipsis = crumb.id === "collapsed";
        const isHoveredTarget =
          (crumb.id === null && dragOverSegmentId === "root") ||
          (crumb.id !== null && dragOverSegmentId === crumb.id);

        const href = crumb.id ? `/drive/${crumb.id}` : "/drive";

        return (
          <React.Fragment key={crumb.id ?? "root"}>
            {idx > 0 && (
              <ChevronRight className="h-4 w-4 text-muted flex-shrink-0" />
            )}

            {isCollapsedEllipsis ? (
              <span className="px-1.5 py-0.5 rounded text-muted-foreground text-sm font-medium">
                <MoreHorizontal className="h-4 w-4 inline" />
              </span>
            ) : isLast ? (
              <h1
                onDragOver={(e) => handleDragOver(e, crumb.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, crumb.id)}
                className={`text-lg md:text-xl font-bold tracking-tight text-foreground truncate max-w-xs md:max-w-md px-1.5 py-0.5 rounded-btn transition-colors ${
                  isHoveredTarget ? "bg-primary-soft text-primary ring-2 ring-primary" : ""
                }`}
              >
                {crumb.name}
              </h1>
            ) : (
              <Link
                href={href}
                onDragOver={(e) => handleDragOver(e, crumb.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, crumb.id)}
                className={`text-sm md:text-base font-medium text-muted-foreground hover:text-foreground truncate max-w-[160px] px-1.5 py-0.5 rounded-btn transition-all duration-cb ${
                  isHoveredTarget
                    ? "bg-primary-soft text-primary ring-2 ring-primary"
                    : "hover:bg-surface-2"
                }`}
              >
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
