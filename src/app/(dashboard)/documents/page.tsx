"use client";

import React from "react";
import { useDocuments } from "@/lib/hooks/useFiles";
import { FolderView } from "@/components/files/FolderView";

export default function DocumentsPage() {
  const { data: nodes = [], isLoading } = useDocuments();

  return (
    <FolderView
      nodes={nodes}
      breadcrumbs={[{ id: null, name: "Tài liệu" }]}
      title="Tài liệu"
      emptyTitle="Chưa có tài liệu nào"
      emptyDesc="Các tệp PDF, Word, Excel, Slide và mã nguồn sẽ xuất hiện tại đây."
      isLoading={isLoading}
    />
  );
}
