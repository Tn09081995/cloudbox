"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadDropzone } from "./UploadDropzone";
import { formatBytes, sanitizeFileName } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  FileUp,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Ban,
} from "lucide-react";

interface UploadFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "idle" | "uploading" | "completed" | "error" | "cancelled";
  errorMessage?: string;
  xhr?: XMLHttpRequest;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId: string | null;
  usedBytes: number;
  quotaBytes: number;
  onUploadSuccess: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  currentFolderId,
  usedBytes,
  quotaBytes,
  onUploadSuccess,
}: UploadModalProps) {
  const [queue, setQueue] = useState<UploadFileItem[]>([]);
  const supabase = createClient();

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const remainingBytes = Math.max(0, quotaBytes - usedBytes);
    const totalNewBytes = files.reduce((acc, f) => acc + f.size, 0);

    if (totalNewBytes > remainingBytes) {
      toast.error(
        `Không đủ dung lượng trống! Còn lại ${formatBytes(
          remainingBytes
        )}, nhưng các tệp đã chọn chiếm ${formatBytes(totalNewBytes)}.`
      );
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Vui lòng đăng nhập lại để tải tệp.");
      return;
    }

    const newItems: UploadFileItem[] = files.map((file) => ({
      id: nanoid(),
      file,
      name: sanitizeFileName(file.name),
      size: file.size,
      progress: 0,
      status: "idle",
    }));

    setQueue((prev) => [...prev, ...newItems]);

    // Start uploading items sequentially or in parallel
    for (const item of newItems) {
      uploadSingleFile(item, user.id);
    }
  };

  const uploadSingleFile = async (item: UploadFileItem, userId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Không có phiên đăng nhập hợp lệ");
      }

      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "uploading", progress: 0 } : i
        )
      );

      // Generate secure storage path prefixed with user id
      const uniqueSuffix = `${Date.now()}_${nanoid(6)}`;
      const safeName = item.name;
      const folderSegment = currentFolderId ? currentFolderId : "root";
      const storagePath = `${userId}/${folderSegment}/${uniqueSuffix}_${safeName}`;

      // Upload DIRECTLY from browser to Supabase Storage via REST endpoint
      // Bypasses Vercel's 4.5MB Serverless function limit completely!
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const uploadUrl = `${supabaseUrl}/storage/v1/object/cloudbox/${encodeURIComponent(
        storagePath
      )}`;

      const xhr = new XMLHttpRequest();

      // Store xhr for cancellation
      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, xhr } : i))
      );

      xhr.open("POST", uploadUrl, true);
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
      xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      xhr.setRequestHeader("x-upsert", "false");
      if (item.file.type) {
        xhr.setRequestHeader("Content-Type", item.file.type);
      }

      // Track progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setQueue((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, progress: percent } : i
            )
          );
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Record uploaded file in Postgres files table
          const { error: dbError } = await supabase.from("files").insert({
            owner_id: userId,
            folder_id: currentFolderId,
            name: safeName,
            size: item.size,
            mime_type: item.file.type || "application/octet-stream",
            storage_path: storagePath,
          });

          if (dbError) {
            setQueue((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      status: "error",
                      errorMessage: "Lỗi ghi dữ liệu tệp vào cơ sở dữ liệu",
                    }
                  : i
              )
            );
            toast.error(`Lỗi lưu thông tin tệp ${safeName}`);
          } else {
            setQueue((prev) =>
              prev.map((i) =>
                i.id === item.id ? { ...i, status: "completed", progress: 100 } : i
              )
            );
            toast.success(`Đã tải lên "${safeName}" thành công!`);
            onUploadSuccess();
          }
        } else {
          setQueue((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: "error",
                    errorMessage: `Lỗi tải lên (${xhr.status})`,
                  }
                : i
            )
          );
          toast.error(`Tải lên tệp ${safeName} thất bại!`);
        }
      };

      xhr.onerror = () => {
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", errorMessage: "Lỗi kết nối mạng" }
              : i
          )
        );
      };

      xhr.onabort = () => {
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "cancelled", errorMessage: "Đã hủy" }
              : i
          )
        );
      };

      xhr.send(item.file);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "error", errorMessage: errorMsg }
            : i
        )
      );
    }
  };

  const handleCancelItem = (id: string) => {
    const item = queue.find((i) => i.id === id);
    if (item && item.xhr && item.status === "uploading") {
      item.xhr.abort();
      toast.info(`Đã hủy tải lên "${item.name}"`);
    }
  };

  const clearCompleted = () => {
    setQueue((prev) =>
      prev.filter((i) => i.status === "uploading" || i.status === "idle")
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileUp className="h-5 w-5 text-primary" />
            <span>Tải tệp lên CloudBox</span>
          </DialogTitle>
          <DialogDescription>
            Tệp được tải trực tiếp lên bộ nhớ đám mây an toàn, không giới hạn kích thước Vercel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Dropzone */}
          <UploadDropzone onFilesSelected={handleFilesSelected} isCompact={queue.length > 0} />

          {/* Queue List */}
          {queue.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                <span>Danh sách tệp ({queue.length})</span>
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="hover:text-foreground text-primary transition-colors text-xs font-medium"
                >
                  Xóa mục đã xong
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border bg-card/80 space-y-2 text-sm shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.status === "uploading" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                        )}
                        {item.status === "completed" && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                        {item.status === "error" && (
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                        {item.status === "cancelled" && (
                          <Ban className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-medium truncate max-w-[240px]">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(item.size)}
                        </span>
                        {item.status === "uploading" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleCancelItem(item.id)}
                            title="Hủy tải lên"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <Progress
                        value={item.progress}
                        className="h-1.5 flex-1"
                        indicatorClassName={
                          item.status === "completed"
                            ? "bg-emerald-500"
                            : item.status === "error"
                            ? "bg-destructive"
                            : "bg-primary"
                        }
                      />
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0 w-8 text-right">
                        {item.progress}%
                      </span>
                    </div>

                    {item.errorMessage && (
                      <p className="text-xs text-destructive">
                        {item.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
