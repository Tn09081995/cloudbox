"use client";

import React from "react";
import { FolderView } from "@/components/files/FolderView";
import { useSharedFiles } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";

export default function SharedPage() {
  const { data: nodes = [], isLoading } = useSharedFiles();

  return (
    <FolderView
      nodes={nodes}
      title={vi.nav.shared}
      isLoading={isLoading}
      emptyVariant="shared"
      emptyTitle={vi.emptyStates.shared.title}
      emptyDesc={vi.emptyStates.shared.desc}
    />
  );
}
