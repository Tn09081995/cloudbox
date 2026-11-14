import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBytes, formatDate, getFileCategory } from "@/lib/utils";
import {
  Cloud,
  Download,
  AlertCircle,
  FileQuestion,
  Music,
  Calendar,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface SharedFilePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedFilePage({ params }: SharedFilePageProps) {
  const { token } = await params;

  if (!token || token.length < 10) {
    notFound();
  }

  // Server-side query using admin client (protects bucket & RLS)
  const admin = createAdminClient();

  const { data: shareLink, error } = await admin
    .from("share_links")
    .select(`
      id,
      token,
      expires_at,
      revoked,
      created_at,
      files (
        id,
        name,
        size,
        mime_type,
        storage_path,
        deleted_at,
        created_at
      )
    `)
    .eq("token", token)
    .single();

  if (error || !shareLink) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full p-8 text-center rounded-3xl border bg-card shadow-sm space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold">Liên kết không tồn tại</h1>
          <p className="text-sm text-muted-foreground">
            Liên kết chia sẻ này không hợp lệ hoặc đã bị người sở hữu xóa bỏ.
          </p>
          <Button asChild className="rounded-xl mt-2">
            <Link href="/login">Về trang chủ CloudBox</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Type assertion for files relation
  const file = shareLink.files as unknown as {
    id: string;
    name: string;
    size: number;
    mime_type: string;
    storage_path: string;
    deleted_at: string | null;
    created_at: string;
  } | null;

  const isExpired =
    shareLink.expires_at && new Date(shareLink.expires_at) < new Date();
  const isRevoked = shareLink.revoked;
  const isDeleted = !file || file.deleted_at !== null;

  if (isRevoked || isExpired || isDeleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full p-8 text-center rounded-3xl border bg-card shadow-sm space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold">
            {isRevoked
              ? "Liên kết đã bị thu hồi"
              : isExpired
              ? "Liên kết đã hết hạn"
              : "Tệp đã bị xóa"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRevoked
              ? "Chủ sở hữu tệp đã thu hồi quyền truy cập của liên kết này."
              : isExpired
              ? "Thời hạn chia sẻ của tệp này đã kết thúc."
              : "Tệp tin này hiện không còn khả dụng trên hệ thống."}
          </p>
          <Button asChild variant="outline" className="rounded-xl mt-2">
            <Link href="/login">Khám phá CloudBox</Link>
          </Button>
        </div>
      </div>
    );
  }

  let previewUrl = "";
  let downloadUrl = "";

  if (file.storage_path.startsWith("gdrive:")) {
    const fileId = file.storage_path.replace("gdrive:", "");
    previewUrl = `/api/gdrive/file/${fileId}`;
    downloadUrl = `/api/gdrive/file/${fileId}?download=true`;
  } else {
    // Generate short-lived signed URL for download/preview (valid 5 minutes = 300 seconds)
    const { data: signedData } = await admin.storage
      .from("cloudbox")
      .createSignedUrl(file.storage_path, 300, {
        download: false,
      });

    const { data: downloadData } = await admin.storage
      .from("cloudbox")
      .createSignedUrl(file.storage_path, 300, {
        download: file.name,
      });

    previewUrl = signedData?.signedUrl || "";
    downloadUrl = downloadData?.signedUrl || previewUrl;
  }
  const category = getFileCategory(file.mime_type, file.name);

  // If text or code, fetch content server-side to render directly
  let textContent: string | null = null;
  if ((category === "text" || category === "code") && previewUrl) {
    try {
      const res = await fetch(previewUrl);
      if (res.ok) {
        textContent = await res.text();
      }
    } catch {
      textContent = null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b px-6 flex items-center justify-between bg-card/60 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Cloud className="h-4 w-4" />
          </div>
          <span className="font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            CloudBox
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="rounded-xl font-medium">
            <a href={downloadUrl} download={file.name}>
              <Download className="h-4 w-4 mr-1.5" />
              <span>Tải xuống</span>
            </a>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        {/* File Card Info */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate max-w-md md:max-w-xl">
              {file.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5 text-primary" />
                {formatBytes(file.size)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(shareLink.created_at)}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-[11px] font-mono">
                {file.mime_type || "Tệp dữ liệu"}
              </span>
            </div>
          </div>

          <Button asChild size="lg" className="rounded-xl gap-2 shadow-sm w-full sm:w-auto">
            <a href={downloadUrl} download={file.name}>
              <Download className="h-5 w-5" />
              <span>Tải xuống tệp</span>
            </a>
          </Button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-6 border rounded-2xl bg-card/50 min-h-[420px]">
          {category === "image" && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={file.name}
              className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-sm"
            />
          ) : category === "pdf" && previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=1`}
              title={file.name}
              className="w-full h-[65vh] rounded-xl border bg-white"
            />
          ) : category === "video" && previewUrl ? (
            <video
              controls
              className="max-h-[65vh] max-w-full rounded-xl shadow-sm"
            >
              <source src={previewUrl} type={file.mime_type} />
              Trình duyệt không hỗ trợ xem video này.
            </video>
          ) : category === "audio" && previewUrl ? (
            <div className="flex flex-col items-center gap-6 py-12 px-6 w-full max-w-md">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Music className="h-10 w-10" />
              </div>
              <p className="text-sm font-semibold truncate max-w-xs">{file.name}</p>
              <audio controls className="w-full">
                <source src={previewUrl} type={file.mime_type} />
                Trình duyệt không hỗ trợ phát âm thanh này.
              </audio>
            </div>
          ) : (category === "text" || category === "code") && textContent !== null ? (
            <pre className="w-full h-[65vh] p-4 text-xs font-mono bg-card border rounded-xl overflow-auto whitespace-pre-wrap">
              {textContent}
            </pre>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center py-16 px-4">
              <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground">
                <FileQuestion className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Không thể xem trước tệp trực tiếp
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Vui lòng tải tệp xuống máy tính hoặc điện thoại để mở tệp tin này.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-xl gap-2 mt-2">
                <a href={downloadUrl} download={file.name}>
                  <Download className="h-5 w-5" />
                  <span>Tải tệp xuống</span>
                </a>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t text-center text-xs text-muted-foreground">
        Được lưu trữ an toàn bởi{" "}
        <span className="font-semibold text-foreground">CloudBox</span>
      </footer>
    </div>
  );
}
