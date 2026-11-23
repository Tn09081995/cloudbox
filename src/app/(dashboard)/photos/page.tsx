"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePhotosAndVideos } from "@/lib/hooks/useFiles";
import { FolderView } from "@/components/files/FolderView";
import { Button } from "@/components/ui/button";
import { Cloud, Smartphone, Upload, CheckCircle2, RefreshCw } from "lucide-react";
import { useBackupAutoSync } from "@/lib/hooks/useBackupAutoSync";
import { useUploadStore } from "@/lib/hooks/useUploadStore";
import { toast } from "sonner";

export default function PhotosPage() {
  const { data: nodes = [], isLoading } = usePhotosAndVideos();
  const { isAutoBackupEnabled, isSyncing, triggerManualSync } = useBackupAutoSync();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      useUploadStore.getState().addFiles(files, null);
      toast.success(`Đang tải lên và sao lưu ${files.length} ảnh/video...`);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Hidden file input for quick photo/video upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleUploadPhotos}
      />

      {/* Google Photos Material You Backup Bar */}
      <div className="p-4 md:p-5 rounded-2xl bg-surface border border-primary/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cloud className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-foreground">
                Sao lưu Ảnh & Video
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                {isAutoBackupEnabled ? "Đang bật tự động sao lưu" : "Đã tạm dừng"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Toàn bộ {nodes.length} ảnh và video của bạn được lưu trữ an toàn với chất lượng gốc và tự động đồng bộ sang các thiết bị liên kết.
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
            <span>Sao lưu ảnh mới</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              triggerManualSync("Đồng bộ thư viện ảnh");
              toast.success("Đang kiểm tra và đồng bộ ảnh mới nhất...");
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
        breadcrumbs={[{ id: null, name: "Ảnh & Video" }]}
        title="Ảnh & Video"
        emptyTitle="Chưa có hình ảnh hoặc video nào"
        emptyDesc="Tải lên hoặc bật sao lưu từ điện thoại để lưu giữ các khoảnh khắc quý giá."
        isLoading={isLoading}
      />
    </div>
  );
}
