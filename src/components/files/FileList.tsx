"use client";

import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { FileNode } from "@/lib/mock/types";
import { FileRow } from "./FileRow";
import { useUiStore, SortField } from "@/lib/hooks/useUiStore";
import { vi } from "@/lib/i18n/vi";

interface FileListProps {
  nodes: FileNode[];
  onPreview?: (file: FileNode) => void;
  onShare?: (file: FileNode) => void;
  onRename?: (file: FileNode) => void;
  onMove?: (file: FileNode) => void;
  onDelete?: (file: FileNode) => void;
  isTrash?: boolean;
  onRestore?: (file: FileNode) => void;
}

export function FileList({
  nodes,
  onPreview,
  onShare,
  onRename,
  onMove,
  onDelete,
  isTrash = false,
  onRestore,
}: FileListProps) {
  const { sortField, sortOrder, setSort, selectedIds, selectAll, clearSelection } =
    useUiStore();

  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer for smooth 60fps scrolling on long lists (up to thousands of items)
  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // 48px row height
    overscan: 10,
  });

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSort(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSort(field, "asc");
    }
  };

  const allSelected = nodes.length > 0 && nodes.every((n) => selectedIds.includes(n.id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(nodes.map((n) => n.id));
    }
  };

  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 ml-1 transition-opacity" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary ml-1" />
    );
  };

  return (
    <div className="w-full rounded-card border border-border bg-surface overflow-hidden shadow-card flex flex-col">
      {/* Sticky Table Header */}
      <div className="sticky top-0 z-10 flex items-center h-10 px-3 bg-surface-2 border-b border-border text-xs font-semibold text-muted-foreground select-none">
        {/* Header Checkbox */}
        <div className="w-8 flex-shrink-0 flex items-center">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
              allSelected
                ? "bg-primary border-primary text-white"
                : "bg-surface border-border text-transparent hover:border-primary"
            }`}
            aria-label={allSelected ? vi.actions.deselectAll : vi.actions.selectAll}
          >
            <span className="text-[9px] font-bold">✓</span>
          </button>
        </div>

        {/* Column: Tên */}
        <button
          type="button"
          onClick={() => handleSortClick("name")}
          className="flex-1 flex items-center group font-medium text-left hover:text-foreground transition-colors pr-4"
        >
          <span>{vi.table.name}</span>
          {renderSortArrow("name")}
        </button>

        {/* Column: Chủ sở hữu */}
        <div className="hidden md:block w-44 flex-shrink-0 font-medium">
          {vi.table.owner}
        </div>

        {/* Column: Sửa đổi */}
        <button
          type="button"
          onClick={() => handleSortClick("updated_at")}
          className="hidden sm:flex items-center group w-36 flex-shrink-0 font-medium text-left hover:text-foreground transition-colors"
        >
          <span>{vi.table.modified}</span>
          {renderSortArrow("updated_at")}
        </button>

        {/* Column: Kích thước */}
        <button
          type="button"
          onClick={() => handleSortClick("size")}
          className="flex items-center justify-end group w-24 flex-shrink-0 font-medium text-right hover:text-foreground transition-colors pr-2"
        >
          <span>{vi.table.size}</span>
          {renderSortArrow("size")}
        </button>

        {/* Column: Quick actions space */}
        <div className="w-20 flex-shrink-0" />
      </div>

      {/* Virtualized Rows Container */}
      <div
        ref={parentRef}
        className="w-full max-h-[calc(100vh-250px)] overflow-y-auto"
      >
        <div
          className="w-full relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const node = nodes[virtualRow.index];
            return (
              <div
                key={node.id}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }}
              >
                <FileRow
                  node={node}
                  onPreview={onPreview}
                  onShare={onShare}
                  onRename={onRename}
                  onMove={onMove}
                  onDelete={onDelete}
                  isTrash={isTrash}
                  onRestore={onRestore}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
