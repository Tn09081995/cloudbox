import React from "react";
import FolderContent from "./FolderContent";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;
  return <FolderContent folderId={folderId} />;
}
