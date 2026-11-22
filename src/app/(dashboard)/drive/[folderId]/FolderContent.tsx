"use client";

import React from "react";
import { FolderView } from "@/components/files/FolderView";
import { useFolderFiles, useBreadcrumbs } from "@/lib/hooks/useFiles";

export default function FolderContent({ folderId }: { folderId: string }) {
  const { data: nodes = [], isLoading } = useFolderFiles(folderId);
  const { data: breadcrumbs = [] } = useBreadcrumbs(folderId);

  return (
    <FolderView
      nodes={nodes}
      breadcrumbs={breadcrumbs}
      currentFolderId={folderId}
      isLoading={isLoading}
    />
  );
}
