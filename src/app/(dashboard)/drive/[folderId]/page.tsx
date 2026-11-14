import React from "react";
import { DriveView } from "@/components/files/DriveView";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;
  return <DriveView folderId={folderId} />;
}
