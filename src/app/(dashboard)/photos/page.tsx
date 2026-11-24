"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePhotosAndVideos, useFileMutations } from "@/lib/hooks/useFiles";
import { FolderView } from "@/components/files/FolderView";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Smartphone,
  Upload,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ImageOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBackupAutoSync } from "@/lib/hooks/useBackupAutoSync";
import { useUploadStore } from "@/lib/hooks/useUploadStore";
import { toast } from "sonner";

export default function PhotosPage() {
  const { data: nodes = [], isLoading } = usePhotosAndVideos();
  const { isAutoBackupEnabled, isSyncing, triggerManualSync } = useBackupAutoSync();
  const { deleteAllPhotos } = useFileMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const photoCount = nodes.filter(
    (n) =>
      n.kind === "image" ||
      (Boolean(n.mime_type) && n.mime_type!.startsWith("image/")) ||
      /\.(jpe?g|png|webp|gif|bmp|tiff|svg|heic|heif)$/i.test(n.name)
  ).length;

  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      useUploadStore.getState().addFiles(files, null);
      toast.success(`Đang tải lên và sao lưu ${files.length} ảnh mới...`);
    }
    e.target.value = "";
  };

  const handleConfirmDeleteAllPhotos = async () => {
    try {
      setIsDeletingAll(true);
      await deleteAllPhotos();
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("cloudbox_material_nodes_v1");
          localStorage.removeItem("cloudbox_material_nodes_v2");
          localStorage.removeItem("cloudbox_material_nodes_v3");
          localStorage.removeItem("cloudbox_material_nodes_v4");
        } catch {}
      }
      toast.success("Đã xóa sạch tất cả hình ảnh khỏi CloudBox!");
      setConfirmDeleteDialogOpen(false);
    } catch {
      toast.error("Không thể xóa ảnh. Vui lòng thử lại!");
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleUploadPhotos}
      />

      {/* Google Photos Material You Backup Bar */}
      <div className="p-4 md:p-5 rounded-2xl bg-surface border border-primary/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            {photoCount === 0 ? <ImageOff className="h-5 w-5" /> : <Cloud className="h-5 w-5" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm md:text-base font-bold text-foreground">
                Thư viện Hình ảnh
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                {photoCount === 0
                  ? "0 ảnh · Đã xóa sạch toàn bộ ảnh"
                  : isAutoBackupEnabled
                  ? "Đang bật tự động sao lưu"
                  : "Đã tạm dừng sao lưu"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {photoCount === 0
                ? "Toàn bộ hình ảnh đã được xóa sạch hoàn toàn khỏi thư viện CloudBox (0 ảnh). Không còn bất kỳ ảnh nào trên hệ thống."
                : `Thư viện hiện có ${photoCount} hình ảnh được lưu trữ an toàn với chất lượng gốc.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-btn bg-primary text-white hover:bg-primary-ink text-xs font-semibold gap-1.5 h-9 shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Tải ảnh mới lên</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDeleteDialogOpen(true)}
            className="rounded-btn text-xs font-semibold gap-1.5 h-9 text-semantic-danger border-semantic-danger/30 hover:bg-semantic-danger/10 hover:border-semantic-danger transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Xóa tất cả ảnh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              triggerManualSync("Đồng bộ thư viện ảnh");
              toast.success("Đang kiểm tra và đồng bộ...");
            }}
            disabled={isSyncing}
            className="rounded-btn text-xs font-medium gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Đồng bộ</span>
          </Button>

          <Button asChild variant="outline" size="sm" className="rounded-btn text-xs font-medium gap-1.5 h-9">
            <Link href="/backup">
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              <span>Thiết bị sao lưu</span>
            </Link>
          </Button>
        </div>
      </div>

      <FolderView
        nodes={nodes}
        breadcrumbs={[{ id: null, name: "Thư viện Ảnh" }]}
        title="Thư viện Ảnh"
        emptyTitle="Chưa có hình ảnh nào"
        emptyDesc="Toàn bộ ảnh đã được xóa sạch. Bạn có thể kéo thả để tải ảnh mới lên hoặc kết nối thiết bị để sao lưu."
        isLoading={isLoading}
      />

      {/* Confirm Delete All Photos Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-semantic-danger" />
              Xóa tất cả ảnh trên CloudBox?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              Hành động này sẽ xóa sạch tất cả hình ảnh trong thư viện CloudBox và cập nhật đồng bộ các thiết bị liên kết về 0 ảnh.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteDialogOpen(false)}
              className="rounded-btn text-xs font-medium"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDeleteAllPhotos}
              disabled={isDeletingAll}
              className="rounded-btn bg-semantic-danger text-white hover:bg-red-700 text-xs font-semibold gap-1.5 shadow-xs"
            >
              {isDeletingAll ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Xóa sạch toàn bộ ảnh</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
