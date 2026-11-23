"use client";

import React from "react";
import { usePhotosAndVideos } from "@/lib/hooks/useFiles";
import { FolderView } from "@/components/files/FolderView";

export default function PhotosPage() {
  const { data: nodes = [], isLoading } = usePhotosAndVideos();

  return (
    <FolderView
      nodes={nodes}
      breadcrumbs={[{ id: null, name: "Ảnh & Video" }]}
      title="Ảnh & Video"
      emptyTitle="Chưa có hình ảnh hoặc video nào"
      emptyDesc="Tải lên hoặc bật sao lưu từ điện thoại để lưu giữ các khoảnh khắc quý giá."
      isLoading={isLoading}
    />
  );
}
