"use client";

import React from "react";
import { FolderView } from "@/components/files/FolderView";
import { useStarredFiles } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";

export default function StarredPage() {
  const { data: nodes = [], isLoading } = useStarredFiles();

  return (
    <FolderView
      nodes={nodes}
      title={vi.nav.starred}
      isLoading={isLoading}
      emptyVariant="starred"
      emptyTitle={vi.emptyStates.starred.title}
      emptyDesc={vi.emptyStates.starred.desc}
    />
  );
}
