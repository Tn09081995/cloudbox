"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MoreHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { BreadcrumbSegment } from "@/lib/mock/types";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { useUiStore } from "@/lib/hooks/useUiStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { viewMode, setViewMode, sortField, sortOrder, setSort } = useUiStore();
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 select-none border-b border-border/40 mb-2">
      {/* Left: Breadcrumbs or Page Title */}
      <nav className="flex items-center gap-1.5 flex-wrap" aria-label="Đường dẫn thư mục">
        {title ? (
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        ) : (
          displayCrumbs.map((crumb, idx) => {
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
                    className={`text-lg md:text-xl font-bold tracking-tight text-foreground truncate max-w-xs md:max-w-md px-2 py-1 rounded-btn transition-colors ${
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
                    className={`text-sm md:text-base font-medium text-muted-foreground hover:text-foreground truncate max-w-[160px] px-2 py-1 rounded-btn transition-all duration-cb ${
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
          })
        )}
      </nav>

      {/* Right Controls: Sort & Grid/List view switcher */}
      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-border bg-surface hover:bg-surface-2 text-xs font-medium text-foreground transition-colors shadow-xs"
              title="Sắp xếp danh sách"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {sortField === "name"
                  ? "Tên"
                  : sortField === "updated_at"
                  ? "Ngày sửa"
                  : "Dung lượng"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl bg-surface border border-border shadow-lg font-sans">
            <DropdownMenuItem
              onClick={() => setSort("name", sortField === "name" && sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center justify-between text-xs px-3 py-2 rounded-xl cursor-pointer"
            >
              <span>Tên ({sortField === "name" && sortOrder === "asc" ? "Z-A" : "A-Z"})</span>
              {sortField === "name" && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSort("updated_at", sortField === "updated_at" && sortOrder === "desc" ? "asc" : "desc")}
              className="flex items-center justify-between text-xs px-3 py-2 rounded-xl cursor-pointer"
            >
              <span>Ngày sửa đổi ({sortField === "updated_at" && sortOrder === "desc" ? "Cũ nhất" : "Mới nhất"})</span>
              {sortField === "updated_at" && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSort("size", sortField === "size" && sortOrder === "desc" ? "asc" : "desc")}
              className="flex items-center justify-between text-xs px-3 py-2 rounded-xl cursor-pointer"
            >
              <span>Dung lượng ({sortField === "size" && sortOrder === "desc" ? "Nhỏ nhất" : "Lớn nhất"})</span>
              {sortField === "size" && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Toggle: Grid / List */}
        <div className="flex items-center p-0.5 rounded-full border border-border bg-surface-2 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-full transition-colors ${
              viewMode === "grid"
                ? "bg-surface text-primary shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Chế độ xem lưới"
            aria-label="Xem dạng lưới"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-full transition-colors ${
              viewMode === "list"
                ? "bg-surface text-primary shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Chế độ xem danh sách"
            aria-label="Xem dạng danh sách"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
