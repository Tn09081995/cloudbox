"use client";

import React from "react";
import { FolderView } from "@/components/files/FolderView";
import { useRecentFiles } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";

export default function RecentPage() {
  const { data: nodes = [], isLoading } = useRecentFiles();

  return (
    <FolderView
      nodes={nodes}
      title={vi.nav.recent}
      isLoading={isLoading}
      emptyTitle="Chưa có tệp mở gần đây"
      emptyDesc="Các tệp bạn tải lên hoặc chỉnh sửa sẽ hiển thị tự động tại đây."
    />
  );
}
