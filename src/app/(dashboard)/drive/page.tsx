"use client";

import React from "react";
import { FolderView } from "@/components/files/FolderView";
import { useFolderFiles, useBreadcrumbs } from "@/lib/hooks/useFiles";

export default function DrivePage() {
  const { data: nodes = [], isLoading } = useFolderFiles(null);
  const { data: breadcrumbs = [{ id: null, name: "Tệp của tôi" }] } = useBreadcrumbs(null);

  return (
    <FolderView
      nodes={nodes}
      breadcrumbs={breadcrumbs}
      currentFolderId={null}
      isLoading={isLoading}
    />
  );
}
