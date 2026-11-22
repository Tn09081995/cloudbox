"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Download,
  Lock,
  AlertCircle,
  Cloud,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileThumbnail } from "@/components/files/FileThumbnail";
import { repository } from "@/lib/mock/repository";
import { FileNode } from "@/lib/mock/types";
import { formatBytes, formatRelativeDate } from "@/lib/utils/formatters";
import { FILE_KIND_CONFIGS } from "@/lib/utils/file-types";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

function PublicShareContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const fileId = (params?.id || params?.token) as string;

  const [node, setNode] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(true);

  // States: "normal" | "password" | "expired"
  const forcedState = searchParams?.get("state") as "password" | "expired" | null;
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    async function loadFile() {
      setLoading(true);
      try {
        const file = await repository.getNode(fileId);
        if (file) {
          setNode(file);
        } else {
          // Fallback to first available seed file
          const recent = await repository.getRecentFiles();
          setNode(recent[0] || null);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadFile();
  }, [fileId]);

  const handleDownload = () => {
    toast.success(`Bắt đầu tải xuống: "${node?.name || "file"}"`);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError(true);
      return;
    }
    setIsUnlocked(true);
    setPasswordError(false);
    toast.success("Mở khóa thành công!");
  };

  // Determine current active state
  const isExpired = forcedState === "expired";
  const needsPassword = (forcedState === "password" || node?.share_settings?.hasPassword) && !isUnlocked;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 md:p-8 font-sans antialiased text-foreground">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/drive" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-btn bg-primary flex items-center justify-center text-white shadow-sm">
            <Cloud className="h-5 w-5 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <span className="font-bold text-base tracking-tight text-foreground">
            CloudBox
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Đăng nhập
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Tạo tài khoản
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto flex items-center justify-center py-6">
        {loading ? (
          <div className="w-full p-8 rounded-dialog bg-surface border border-border shadow-xl text-center space-y-3">
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Đang tải thông tin tệp...</p>
          </div>
        ) : isExpired ? (
          /* State 1: Expired Link */
          <div className="w-full p-8 rounded-dialog bg-surface border border-border shadow-xl text-center space-y-4 animate-in fade-in duration-cb">
            <div className="h-16 w-16 rounded-full bg-semantic-danger/10 text-semantic-danger flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {vi.sharePage.expiredTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {vi.sharePage.expiredDesc}
              </p>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline" className="rounded-btn text-xs font-semibold">
                <Link href="/drive">Về trang chủ</Link>
              </Button>
            </div>
          </div>
        ) : needsPassword ? (
          /* State 2: Password Protected */
          <div className="w-full p-8 rounded-dialog bg-surface border border-border shadow-xl space-y-5 animate-in fade-in duration-cb">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {vi.sharePage.passwordTitle}
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {vi.sharePage.passwordDesc}
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-1.5">
                <Input
                  type="password"
                  placeholder={vi.sharePage.passwordPlaceholder}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`h-10 rounded-btn text-xs bg-surface-2 ${
                    passwordError ? "border-semantic-danger focus-visible:ring-semantic-danger/20" : ""
                  }`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-[11px] text-semantic-danger font-medium">
                    {vi.sharePage.passwordError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold shadow-sm"
              >
                {vi.sharePage.unlockBtn}
              </Button>
            </form>
          </div>
        ) : node ? (
          /* State 3: Normal File Preview & Download Card */
          <div className="w-full rounded-dialog bg-surface border border-border shadow-xl overflow-hidden animate-in fade-in duration-cb">
            {/* Visual Thumbnail Area */}
            <div className="relative aspect-[16/9] w-full bg-surface-2 border-b border-border overflow-hidden flex items-center justify-center">
              <FileThumbnail file={node} />
            </div>

            {/* File Info & Action */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: FILE_KIND_CONFIGS[node.kind]?.bgTile || "#E8F0FF",
                      color: FILE_KIND_CONFIGS[node.kind]?.color || "#2563EB",
                    }}
                  >
                    {FILE_KIND_CONFIGS[node.kind]?.label || "Tệp"}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatBytes(node.size)}
                  </span>
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-foreground leading-snug break-words">
                  {node.name}
                </h1>
              </div>

              {/* Owner and Date Metadata */}
              <div className="p-3.5 rounded-card bg-surface-2 border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    {node.owner.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{node.owner.name}</p>
                    <p className="text-[11px] text-muted-foreground">Chủ sở hữu tệp</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-mono text-[11px] text-muted-foreground">
                  <p>{formatRelativeDate(node.updated_at)}</p>
                  <p className="text-[10px] text-semantic-success flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 inline" />
                    <span>Đã quét vi-rút</span>
                  </p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  onClick={handleDownload}
                  className="w-full sm:flex-1 h-11 rounded-btn bg-primary text-white hover:bg-primary-ink text-sm font-semibold gap-2 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Tải xuống tệp tin ({formatBytes(node.size)})</span>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-5 rounded-btn text-xs font-semibold gap-1.5"
                >
                  <Link href="/drive">
                    <span>Lưu vào CloudBox</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-muted-foreground pt-6 border-t border-border/40">
        <p>© 2026 CloudBox. Lưu trữ đám mây cá nhân tốc độ cao & bảo mật tuyệt đối.</p>
      </footer>
    </div>
  );
}

export default function PublicSharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PublicShareContent />
    </Suspense>
  );
}
