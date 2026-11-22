"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Clock,
  History,
  Info,
  RotateCcw,
  User,
  ShieldCheck,
  Calendar,
  HardDrive,
  Folder,
} from "lucide-react";
import { FileNode } from "@/lib/mock/types";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { formatBytes, formatRelativeDate } from "@/lib/utils/formatters";
import { FILE_KIND_CONFIGS } from "@/lib/utils/file-types";
import { FileThumbnail } from "@/components/files/FileThumbnail";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface DetailsPanelProps {
  node: FileNode | null;
  className?: string;
}

export function DetailsPanel({ node, className = "" }: DetailsPanelProps) {
  const { detailsPanelOpen, setDetailsPanelOpen } = useUiStore();
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "versions">("overview");

  if (!detailsPanelOpen || !node) return null;

  const cfg = FILE_KIND_CONFIGS[node.kind] || FILE_KIND_CONFIGS.other;
  const isFolder = node.kind === "folder";

  const handleRestoreVersion = (versionNumber: number) => {
    toast.success(`Đã khôi phục về phiên bản #${versionNumber}`);
  };

  return (
    <>
      {/* Mobile Backdrop (<768px) */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setDetailsPanelOpen(false)}
      />

      {/* Details Container: 340px right slide-in on desktop, bottom sheet on mobile */}
      <aside
        className={`fixed md:sticky top-0 right-0 z-40 md:z-20 h-auto md:h-screen max-h-[85vh] md:max-h-screen w-full md:w-[340px] flex-shrink-0 bg-surface border-t md:border-t-0 md:border-l border-border shadow-2xl md:shadow-none flex flex-col font-sans select-none animate-in slide-in-from-bottom md:slide-in-from-right duration-cb ${className}`}
      >
        {/* Header */}
        <div className="h-16 px-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {vi.detailsPanel.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setDetailsPanelOpen(false)}
            className="p-1.5 rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Đóng bảng chi tiết"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-border px-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {vi.detailsPanel.overviewTab}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === "activity"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {vi.detailsPanel.activityTab}
          </button>

          {!isFolder && (
            <button
              type="button"
              onClick={() => setActiveTab("versions")}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeTab === "versions"
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {vi.detailsPanel.versionsTab}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* ==============================================================
              TAB 1: OVERVIEW (Thumbnail + Properties + Access List)
          ============================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Large Thumbnail Preview */}
              <div className="w-full aspect-[4/3] rounded-card bg-surface-2 border border-border/80 overflow-hidden shadow-sm flex items-center justify-center">
                {isFolder ? (
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${node.color || "#F5A524"}20`,
                      color: node.color || "#F5A524",
                    }}
                  >
                    <Folder className="h-9 w-9 fill-current" />
                  </div>
                ) : (
                  <FileThumbnail
                    kind={node.kind}
                    name={node.name}
                    seed={node.thumbnail_seed || node.id}
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Title and Kind */}
              <div>
                <h4 className="text-sm font-bold text-foreground break-words">
                  {node.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {cfg.label}
                </p>
              </div>

              {/* Properties List */}
              <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {vi.detailsPanel.type}
                  </span>
                  <span className="font-mono text-foreground">{node.mime_type || cfg.label}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5" />
                    {vi.detailsPanel.size}
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {isFolder ? vi.table.itemCount(node.item_count || 0) : formatBytes(node.size)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {vi.detailsPanel.owner}
                  </span>
                  <span className="font-medium text-foreground">
                    {node.owner.isCurrentUser ? vi.detailsPanel.me : node.owner.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {vi.detailsPanel.modified}
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatRelativeDate(node.updated_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {vi.detailsPanel.created}
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {formatRelativeDate(node.created_at)}
                  </span>
                </div>
              </div>

              {/* Access List */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Quyền truy cập
                </h5>
                <div className="flex items-center justify-between p-2 rounded-btn bg-surface-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary-soft text-primary font-bold text-[10px] flex items-center justify-center">
                      {node.owner.name.slice(0, 1)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{node.owner.name}</span>
                      <span className="text-[10px] text-muted-foreground">{node.owner.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border text-muted-foreground">
                    Chủ sở hữu
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 2: ACTIVITY TIMELINE
          ============================================================== */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Lịch sử hoạt động
              </h5>

              <div className="relative pl-4 space-y-4 border-l border-border/80 ml-2">
                {(node.activities || [
                  {
                    id: "act-default-1",
                    action: "edited",
                    description: "Chỉnh sửa nội dung tệp tin",
                    actor: node.owner.name,
                    timestamp: node.updated_at,
                  },
                  {
                    id: "act-default-2",
                    action: "created",
                    description: "Tải lên hoặc khởi tạo tệp",
                    actor: node.owner.name,
                    timestamp: node.created_at,
                  },
                ]).map((activity) => (
                  <div key={activity.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-surface" />
                    <p className="text-xs font-medium text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      {activity.actor} • {formatRelativeDate(activity.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 3: VERSION HISTORY (with mock restore)
          ============================================================== */}
          {activeTab === "versions" && !isFolder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-primary" />
                  Các phiên bản tệp ({node.versions?.length || 2})
                </h5>
              </div>

              <div className="space-y-2">
                {(
                  node.versions || [
                    {
                      id: "v2",
                      versionNumber: 2,
                      name: node.name,
                      size: node.size,
                      updated_at: node.updated_at,
                      updated_by: node.owner.name,
                    },
                    {
                      id: "v1",
                      versionNumber: 1,
                      name: node.name,
                      size: Math.round(node.size * 0.9),
                      updated_at: node.created_at,
                      updated_by: node.owner.name,
                    },
                  ]
                ).map((ver, idx) => (
                  <div
                    key={ver.id}
                    className="p-3 rounded-card bg-surface-2 border border-border/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">
                          Phiên bản #{ver.versionNumber}
                        </span>
                        {idx === 0 && (
                          <span className="text-[9px] font-bold uppercase px-1 rounded bg-primary-soft text-primary font-mono">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {formatBytes(ver.size)} • {formatRelativeDate(ver.updated_at)}
                      </span>
                    </div>

                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRestoreVersion(ver.versionNumber)}
                        className="flex items-center gap-1 px-2 py-1 rounded-btn bg-surface hover:bg-surface-2 text-primary border border-border transition-colors text-[11px] font-medium"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Khôi phục</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
