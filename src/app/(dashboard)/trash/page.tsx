"use client";

import React from "react";
import { FolderView } from "@/components/files/FolderView";
import { useTrashFiles } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";

export default function TrashPage() {
  const { data: nodes = [], isLoading } = useTrashFiles();

  return (
    <FolderView
      nodes={nodes}
      title={vi.nav.trash}
      isLoading={isLoading}
      isTrash={true}
      emptyVariant="trash"
      emptyTitle={vi.emptyStates.trash.title}
      emptyDesc={vi.emptyStates.trash.desc}
    />
  );
}
