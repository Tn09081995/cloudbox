"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileQuestion, Music } from "lucide-react";
import { FileRecord } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatBytes, getFileCategory } from "@/lib/utils";
import { toast } from "sonner";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileRecord | null;
}

export function PreviewModal({ isOpen, onClose, file }: PreviewModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const loadSignedUrl = useCallback(async (fileRecord: FileRecord) => {
    try {
      setIsLoading(true);

      const category = getFileCategory(fileRecord.mime_type, fileRecord.name);

      if (fileRecord.id.startsWith("demo-")) {
        if (category === "image") {
          setSignedUrl(
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
          );
        } else if (category === "text" || category === "code") {
          setTextContent(
            "Đây là nội dung tệp tin văn bản mẫu trong CloudBox.\n\n- Tính năng xem trước hỗ trợ: hình ảnh, PDF, video, audio, text/code.\n- Mọi dữ liệu được bảo mật bằng liên kết ký mã thời hạn ngắn (Signed URL).\n- Khi bạn kết nối Supabase thật và tải tệp lên, nội dung thật sẽ hiển thị tại đây!"
          );
          setSignedUrl("data:text/plain;charset=utf-8,Demo");
        } else if (category === "video") {
          setSignedUrl(
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          );
        } else if (category === "pdf") {
          setSignedUrl(
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          );
        } else {
          setSignedUrl("data:application/octet-stream;base64,");
        }
        setIsLoading(false);
        return;
      }

      // Handle Google Drive 5TB Files
      if (fileRecord.storage_path.startsWith("gdrive:")) {
        const fileId = fileRecord.storage_path.replace("gdrive:", "");
        const driveUrl = `/api/gdrive/file/${fileId}`;
        setSignedUrl(driveUrl);

        if (category === "text" || category === "code") {
          try {
            const res = await fetch(driveUrl);
            const text = await res.text();
            setTextContent(text);
          } catch {
            setTextContent("Không thể tải nội dung văn bản.");
          }
        }
        setIsLoading(false);
        return;
      }

      // Create short-lived signed URL (valid for 5 minutes = 300 seconds)
      const { data, error } = await supabase.storage
        .from("cloudbox")
        .createSignedUrl(fileRecord.storage_path, 300);

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || "Không thể tạo liên kết xem trước");
      }

      setSignedUrl(data.signedUrl);

      // If text/code, fetch content for rendering
      if (category === "text" || category === "code") {
        try {
          const res = await fetch(data.signedUrl);
          const text = await res.text();
          setTextContent(text);
        } catch {
          setTextContent("Không thể tải nội dung văn bản.");
        }
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Lỗi khi tải bản xem trước";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen && file) {
      loadSignedUrl(file);
    } else {
      setSignedUrl(null);
      setTextContent(null);
    }
  }, [isOpen, file, loadSignedUrl]);

  const handleDownload = async () => {
    if (!file) return;
    try {
      if (file.storage_path.startsWith("gdrive:")) {
        const fileId = file.storage_path.replace("gdrive:", "");
        const downloadUrl = `/api/gdrive/file/${fileId}?download=true`;
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          try {
            document.body.removeChild(a);
          } catch {}
        }, 1000);
        return;
      }

      const { data, error } = await supabase.storage
        .from("cloudbox")
        .createSignedUrl(file.storage_path, 60, {
          download: file.name,
        });

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || "Không thể tải tệp xuống");
      }

      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch {}
      }, 1000);
    } catch {
      toast.error("Không thể tải tệp xuống. Vui lòng thử lại sau.");
    }
  };

  if (!file) return null;

  const category = getFileCategory(file.mime_type, file.name);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b pr-8">
          <div className="flex flex-col text-left">
            <DialogTitle className="truncate max-w-[450px] text-base font-bold">
              {file.name}
            </DialogTitle>
            <span className="text-xs text-muted-foreground">
              {formatBytes(file.size)} • {file.mime_type || "Không xác định"}
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleDownload}
            disabled={!signedUrl || isLoading}
            className="rounded-xl gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>Tải xuống</span>
          </Button>
        </DialogHeader>

        <div className="flex-1 flex items-center justify-center overflow-auto min-h-[350px] py-4 bg-muted/20 rounded-xl mt-2">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Đang tải bản xem trước an toàn...</p>
            </div>
          ) : !signedUrl ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileQuestion className="h-10 w-10" />
              <p className="text-sm">Không thể xem trước tệp tin này</p>
            </div>
          ) : category === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signedUrl}
              alt={file.name}
              className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-sm"
            />
          ) : category === "pdf" ? (
            <iframe
              src={`${signedUrl}#toolbar=1`}
              title={file.name}
              className="w-full h-[65vh] rounded-lg border bg-white"
            />
          ) : category === "video" ? (
            <video
              controls
              autoPlay={false}
              className="max-h-[65vh] max-w-full rounded-lg shadow-sm"
            >
              <source src={signedUrl} type={file.mime_type} />
              Trình duyệt của bạn không hỗ trợ phát video này.
            </video>
          ) : category === "audio" ? (
            <div className="flex flex-col items-center gap-6 py-12 px-6 w-full max-w-md">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Music className="h-10 w-10" />
              </div>
              <p className="text-sm font-semibold truncate max-w-xs">{file.name}</p>
              <audio controls className="w-full">
                <source src={signedUrl} type={file.mime_type} />
                Trình duyệt của bạn không hỗ trợ phát âm thanh này.
              </audio>
            </div>
          ) : (category === "text" || category === "code") && textContent !== null ? (
            <pre className="w-full h-[65vh] p-4 text-xs font-mono bg-card border rounded-xl overflow-auto whitespace-pre-wrap">
              {textContent}
            </pre>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center py-12 px-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <FileQuestion className="h-8 w-8" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Không có bản xem trước trực tiếp
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Định dạng tệp này không thể hiển thị trực tiếp trên trình duyệt. Bạn có thể tải tệp về thiết bị để mở.
                </p>
              </div>
              <Button onClick={handleDownload} className="rounded-xl gap-2 mt-2">
                <Download className="h-4 w-4" />
                <span>Tải tệp xuống máy</span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
