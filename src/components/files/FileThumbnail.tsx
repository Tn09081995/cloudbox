"use client";

import React from "react";
import {
  FileText,
  Play,
  Music,
  Archive,
  Table,
  Code,
} from "lucide-react";
import { FileKind, FILE_KIND_CONFIGS } from "@/lib/utils/file-types";
import { FileNode } from "@/lib/mock/types";

interface FileThumbnailProps {
  kind?: FileKind;
  name?: string;
  seed?: string;
  className?: string;
  file?: FileNode;
}

export function FileThumbnail({
  kind,
  name,
  seed = "default",
  className = "",
  file,
}: FileThumbnailProps) {
  const actualKind: FileKind = file ? file.kind : (kind || "other");
  const actualName: string = file ? file.name : (name || "");
  const actualSeed: string = file ? (file.thumbnail_seed || file.id) : seed;

  // Generate a deterministic integer from string seed
  const hash = (actualSeed + actualName).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (file?.thumbnail_url) {
    return (
      <div className={`relative w-full h-full overflow-hidden flex items-center justify-center select-none bg-surface-2 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.thumbnail_url}
          alt={actualName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {actualKind === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="h-9 w-9 rounded-full bg-black/60 text-white flex items-center justify-center shadow-md backdrop-blur-xs">
              <Play className="h-4 w-4 fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (actualKind === "image") {
    // Elegant geometric / landscape SVG artwork
    const hue1 = (hash * 37) % 360;
    const hue2 = (hue1 + 45) % 360;
    return (
      <div
        className={`relative w-full h-full overflow-hidden flex items-center justify-center select-none ${className}`}
        style={{
          background: `linear-gradient(135deg, hsl(${hue1}, 70%, 92%) 0%, hsl(${hue2}, 75%, 85%) 100%)`,
        }}
      >
        <svg
          viewBox="0 0 200 150"
          className="w-full h-full object-cover opacity-80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`grad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 65%)`} stopOpacity="0.8" />
              <stop offset="100%" stopColor={`hsl(${hue2}, 85%, 55%)`} stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <circle cx="150" cy="45" r="22" fill={`hsl(${hue2}, 90%, 75%)`} opacity="0.7" />
          <polygon
            points="15,140 70,75 115,120 155,65 195,140"
            fill={`url(#grad-${hash})`}
            opacity="0.9"
          />
          <polygon
            points="60,140 105,90 145,130 185,85 200,140"
            fill={`hsl(${hue1}, 75%, 45%)`}
            opacity="0.3"
          />
        </svg>
      </div>
    );
  }

  if (actualKind === "video") {
    const hue = (hash * 53) % 360;
    return (
      <div
        className={`relative w-full h-full overflow-hidden flex items-center justify-center select-none bg-slate-900 ${className}`}
        style={{
          background: `radial-gradient(circle at center, hsl(${hue}, 40%, 25%) 0%, hsl(${hue}, 50%, 10%) 100%)`,
        }}
      >
        {/* Play badge */}
        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md border border-white/30 group-hover:scale-110 transition-transform">
          <Play className="h-5 w-5 fill-white ml-0.5" />
        </div>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-black/60 backdrop-blur-sm text-white">
          03:45
        </span>
      </div>
    );
  }

  if (actualKind === "pdf") {
    return (
      <div
        className={`relative w-full h-full p-3.5 bg-surface border-b border-border/60 flex flex-col justify-between select-none ${className}`}
      >
        {/* Mock First Page of Document */}
        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between pb-1 border-b border-border/40">
            <span className="text-[9px] font-bold tracking-wider text-kind-pdf font-mono uppercase">
              PDF DOC
            </span>
            <div className="h-1.5 w-8 rounded-full bg-border" />
          </div>
          <div className="h-2 w-3/4 rounded bg-foreground/15" />
          <div className="h-1.5 w-full rounded bg-foreground/10" />
          <div className="h-1.5 w-5/6 rounded bg-foreground/10" />
          <div className="h-1.5 w-4/6 rounded bg-foreground/10" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-1.5 w-12 rounded bg-border" />
          <span className="text-[9px] font-mono text-muted-foreground">Trang 1/14</span>
        </div>
      </div>
    );
  }

  if (actualKind === "spreadsheet") {
    return (
      <div className={`relative w-full h-full p-3 bg-surface border-b border-border/60 flex flex-col select-none ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold text-kind-spreadsheet font-mono uppercase">
            BẢNG TÍNH
          </span>
          <Table className="h-3.5 w-3.5 text-kind-spreadsheet" />
        </div>
        {/* Mock Grid Cells */}
        <div className="flex-1 grid grid-cols-3 gap-1 p-1 bg-surface-2/60 rounded border border-border/60">
          <div className="h-3 rounded bg-kind-spreadsheet/20" />
          <div className="h-3 rounded bg-kind-spreadsheet/20" />
          <div className="h-3 rounded bg-kind-spreadsheet/20" />
          <div className="h-3 rounded bg-foreground/10" />
          <div className="h-3 rounded bg-foreground/10" />
          <div className="h-3 rounded bg-foreground/10" />
          <div className="h-3 rounded bg-foreground/10" />
          <div className="h-3 rounded bg-foreground/10" />
          <div className="h-3 rounded bg-foreground/10" />
        </div>
      </div>
    );
  }

  if (actualKind === "code") {
    return (
      <div className={`relative w-full h-full p-3 bg-slate-900 border-b border-border/60 flex flex-col justify-between font-mono text-[10px] text-cyan-400 select-none ${className}`}>
        <div className="flex items-center justify-between text-muted-foreground pb-1 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2 w-2 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Code className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div className="space-y-1 my-auto text-slate-300">
          <p className="truncate text-purple-400 font-semibold">{`<CloudBox />`}</p>
          <p className="truncate text-slate-400 pl-2">const status = &quot;ready&quot;;</p>
          <p className="truncate text-amber-300 pl-2">return true;</p>
        </div>
        <span className="text-[9px] text-slate-500 text-right">UTF-8</span>
      </div>
    );
  }

  if (actualKind === "audio") {
    return (
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 select-none ${className}`}
      >
        <div className="h-10 w-10 rounded-full bg-kind-audio/20 text-kind-audio flex items-center justify-center mb-2 shadow-sm">
          <Music className="h-5 w-5" />
        </div>
        {/* Soundwave bars */}
        <div className="flex items-center gap-1 h-4">
          <span className="w-1 h-2 rounded bg-kind-audio/60 animate-pulse" />
          <span className="w-1 h-4 rounded bg-kind-audio" />
          <span className="w-1 h-3 rounded bg-kind-audio/80" />
          <span className="w-1 h-4 rounded bg-kind-audio" />
          <span className="w-1 h-1.5 rounded bg-kind-audio/50" />
        </div>
      </div>
    );
  }

  if (actualKind === "archive") {
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center p-4 bg-amber-500/5 select-none ${className}`}>
        <div className="h-10 w-10 rounded-btn bg-kind-archive/20 text-kind-archive flex items-center justify-center mb-1">
          <Archive className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          ZIP ARCHIVE
        </span>
      </div>
    );
  }

  // Fallback for Document / Other
  const cfg = FILE_KIND_CONFIGS[actualKind] || FILE_KIND_CONFIGS.other;
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center p-4 bg-surface select-none ${className}`}>
      <div
        className="h-11 w-11 rounded-btn flex items-center justify-center mb-1"
        style={{ backgroundColor: cfg.bgTile, color: cfg.color }}
      >
        <FileText className="h-6 w-6" />
      </div>
      <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
        {actualName.split(".").pop() || cfg.label}
      </span>
    </div>
  );
}
