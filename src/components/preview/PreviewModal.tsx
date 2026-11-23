"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Share2,
  Info,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Copy,
  Check,
} from "lucide-react";
import { FileNode } from "@/lib/mock/types";
import { formatBytes } from "@/lib/utils/formatters";
import { FILE_KIND_CONFIGS } from "@/lib/utils/file-types";
import { FileThumbnail } from "@/components/files/FileThumbnail";
import { Button } from "@/components/ui/button";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface PreviewModalProps {
  file: FileNode | null;
  folderFiles?: FileNode[];
  isOpen: boolean;
  onClose: () => void;
  onShare?: (file: FileNode) => void;
  onToggleDetails?: () => void;
}

export function PreviewModal({
  file,
  folderFiles = [],
  isOpen,
  onClose,
  onShare,
  onToggleDetails,
}: PreviewModalProps) {
  // Navigation between files in folder
  const currentFiles = folderFiles.filter((n) => n.kind !== "folder");
  const currentIndex = file ? currentFiles.findIndex((f) => f.id === file.id) : -1;
  const [activeFile, setActiveFile] = useState<FileNode | null>(file);

  // Image zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPan = useRef({ x: 0, y: 0 });

  // PDF page state
  const [pdfPage, setPdfPage] = useState(1);
  const totalPdfPages = 14;

  // Video mock state
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(25);
  const [isMuted, setIsMuted] = useState(false);

  // Code copied state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveFile(file);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPdfPage(1);
    setIsPlaying(false);
  }, [file]);

  // Keyboard navigation: Left/Right arrows & Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) {
          setActiveFile(currentFiles[currentIndex - 1]);
        }
      } else if (e.key === "ArrowRight") {
        if (currentIndex < currentFiles.length - 1) {
          setActiveFile(currentFiles[currentIndex + 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, currentFiles, onClose]);

  if (!isOpen || !activeFile) return null;

  const cfg = FILE_KIND_CONFIGS[activeFile.kind] || FILE_KIND_CONFIGS.other;

  const handleDownload = () => {
    toast.success(`Đang tải xuống "${activeFile.name}"...`);
  };

  const handleCopyCode = () => {
    if (activeFile.content) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      toast.success("Đã sao chép nội dung");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (activeFile.kind === "image") {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeFile.kind === "image" && zoom > 1) {
      setIsPanning(true);
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.current.x,
        y: e.clientY - startPan.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md select-none animate-in fade-in duration-cb">
      {/* Top Header Bar */}
      <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-surface flex-shrink-0">
        {/* Left: File Title & Meta */}
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <div
            className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: cfg.bgTile, color: cfg.color }}
          >
            <span className="text-[10px] font-bold uppercase font-mono">
              {activeFile.name.split(".").pop()?.slice(0, 3) || "DAT"}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate max-w-sm md:max-w-xl">
              {activeFile.name}
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {formatBytes(activeFile.size)} • {cfg.label}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-btn text-xs font-medium text-foreground hover:bg-surface-2 transition-colors border border-border"
          >
            <Download className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">{vi.actions.download}</span>
          </button>

          <button
            type="button"
            onClick={() => onShare?.(activeFile)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-btn text-xs font-medium text-foreground hover:bg-surface-2 transition-colors border border-border"
          >
            <Share2 className="h-4 w-4 text-indigo-500" />
            <span className="hidden sm:inline">{vi.actions.share}</span>
          </button>

          <button
            type="button"
            onClick={onToggleDetails}
            className="p-2 h-9 w-9 flex items-center justify-center rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors border border-border"
            title={vi.actions.details}
          >
            <Info className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 h-9 w-9 flex items-center justify-center rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors ml-1"
            title={vi.actions.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Viewing Stage */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-8"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Previous File Button */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={() => setActiveFile(currentFiles[currentIndex - 1])}
            className="absolute left-4 z-20 h-10 w-10 rounded-full bg-surface/80 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all"
            aria-label="Tệp trước đó"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Next File Button */}
        {currentIndex < currentFiles.length - 1 && (
          <button
            type="button"
            onClick={() => setActiveFile(currentFiles[currentIndex + 1])}
            className="absolute right-4 z-20 h-10 w-10 rounded-full bg-surface/80 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all"
            aria-label="Tệp tiếp theo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* ==============================================================
            KIND 1: IMAGE (Wheel / Pinch Zoom, Drag / Pan, Reset)
        ============================================================== */}
        {activeFile.kind === "image" && (
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <div
              className="max-w-2xl max-h-[70vh] w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transition-transform"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default",
              }}
            >
              <FileThumbnail
                file={activeFile}
                kind="image"
                name={activeFile.name}
                seed={activeFile.thumbnail_seed || activeFile.id}
                className="w-full h-full"
              />
            </div>

            {/* Floating Zoom Controls Bar */}
            <div className="absolute bottom-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-md border border-border shadow-lg">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-full hover:bg-surface-2 text-foreground transition-colors"
                title="Thu nhỏ"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono font-medium px-2">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-full hover:bg-surface-2 text-foreground transition-colors"
                title="Phóng to"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="p-1.5 rounded-full hover:bg-surface-2 text-foreground transition-colors ml-1"
                title="Đặt lại zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==============================================================
            KIND 2: VIDEO (Custom Scrubber & Controls)
        ============================================================== */}
        {activeFile.kind === "video" && (
          <div className="relative max-w-3xl w-full aspect-video rounded-2xl bg-black overflow-hidden shadow-2xl flex flex-col justify-end group">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:scale-110 active:scale-95 transition-all shadow-xl"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 fill-white" />
                ) : (
                  <Play className="h-8 w-8 fill-white ml-1" />
                )}
              </button>
            </div>

            {/* Custom Video Control Bar */}
            <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent space-y-2">
              {/* Timeline scrubber */}
              <div
                className="h-1.5 w-full bg-white/30 rounded-full cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setVideoProgress(Math.round(pos * 100));
                }}
              >
                <div
                  className="h-full bg-primary rounded-full relative"
                  style={{ width: `${videoProgress}%` }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow" />
                </div>
              </div>

              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="hover:text-primary transition-colors"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted((m) => !m)}
                    className="hover:text-primary transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <span className="font-mono text-[11px] text-white/80">
                    00:54 / 03:45
                  </span>
                </div>
                <span className="font-mono text-[11px] text-white/60">Full HD 1080p</span>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            KIND 3: PDF (Mock Multi-page Document with Navigation)
        ============================================================== */}
        {activeFile.kind === "pdf" && (
          <div className="flex flex-col items-center w-full max-w-xl h-full justify-between">
            {/* Mock Page Sheet */}
            <div className="flex-1 w-full bg-surface border border-border shadow-2xl rounded-2xl p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="font-bold text-base text-foreground">
                    {activeFile.name.replace(".pdf", "")}
                  </h3>
                  <span className="text-[10px] font-bold text-semantic-danger bg-semantic-danger/10 px-2 py-0.5 rounded font-mono">
                    PDF DOC
                  </span>
                </div>
                <div className="h-3 w-3/4 rounded bg-foreground/20" />
                <div className="space-y-2 pt-2">
                  <div className="h-2 w-full rounded bg-foreground/10" />
                  <div className="h-2 w-full rounded bg-foreground/10" />
                  <div className="h-2 w-5/6 rounded bg-foreground/10" />
                  <div className="h-2 w-full rounded bg-foreground/10" />
                  <div className="h-2 w-4/6 rounded bg-foreground/10" />
                </div>
                <div className="p-4 rounded-xl bg-surface-2 border border-border/80 my-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Trang {pdfPage}: Đây là nội dung hiển thị của bản xem trước PDF trong CloudBox.
                    Các số liệu, biểu đồ và văn bản được trích xuất an toàn và tải lên tốc độ cao.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground font-mono">
                <span>CloudBox Document Viewer</span>
                <span>Trang {pdfPage} / {totalPdfPages}</span>
              </div>
            </div>

            {/* Page navigation bar */}
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border shadow-md">
              <button
                type="button"
                disabled={pdfPage <= 1}
                onClick={() => setPdfPage((p) => p - 1)}
                className="p-1 rounded-full hover:bg-surface-2 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono px-2 font-medium">
                {pdfPage} / {totalPdfPages}
              </span>
              <button
                type="button"
                disabled={pdfPage >= totalPdfPages}
                onClick={() => setPdfPage((p) => p + 1)}
                className="p-1 rounded-full hover:bg-surface-2 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==============================================================
            KIND 4: CODE / TEXT (Line Numbers & Syntax Highlight)
        ============================================================== */}
        {(activeFile.kind === "code" || activeFile.kind === "document") && (
          <div className="w-full max-w-3xl h-[75vh] flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
            {/* Code top tab */}
            <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <span className="font-medium text-slate-200">{activeFile.name}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-[11px]"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>

            {/* Code content with line numbers */}
            <div className="flex-1 overflow-auto p-4 flex">
              <div className="select-none pr-4 text-right text-slate-600 border-r border-slate-800 space-y-1">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <div className="pl-4 text-slate-300 space-y-1 overflow-x-auto whitespace-pre font-sans">
                {activeFile.content ||
                  `# ${activeFile.name}\n\nNội dung văn bản được đồng bộ hóa và lưu trữ an toàn trên CloudBox.\n\n- Thời gian tạo: ${activeFile.created_at}\n- Chủ sở hữu: ${activeFile.owner.name}\n- Kích thước: ${formatBytes(activeFile.size)}\n\nPhiên bản 1.0 sẵn sàng xuất bản.`}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            KIND 5: AUDIO / SPREADSHEET / OTHER
        ============================================================== */}
        {activeFile.kind !== "image" &&
          activeFile.kind !== "video" &&
          activeFile.kind !== "pdf" &&
          activeFile.kind !== "code" &&
          activeFile.kind !== "document" && (
            <div className="w-full max-w-md p-8 rounded-2xl bg-surface border border-border shadow-xl text-center space-y-4">
              <div
                className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: cfg.bgTile, color: cfg.color }}
              >
                <span className="text-xl font-bold uppercase font-mono">
                  {activeFile.name.split(".").pop() || "DAT"}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">{activeFile.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBytes(activeFile.size)} • {cfg.label}
                </p>
              </div>
              <Button
                onClick={handleDownload}
                className="rounded-btn gap-2 bg-primary text-white hover:bg-primary-ink"
              >
                <Download className="h-4 w-4" />
                <span>Tải tệp tin về máy</span>
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
