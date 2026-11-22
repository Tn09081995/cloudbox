"use client";

import { useEffect } from "react";
import { useUiStore } from "./useUiStore";
import { FileNode } from "@/lib/mock/types";

interface UseKeyboardShortcutsOptions {
  nodes?: FileNode[];
  onUploadTrigger?: () => void;
  onPreviewTrigger?: (node: FileNode) => void;
  onRenameTrigger?: (node: FileNode) => void;
  onTrashTrigger?: (nodes: FileNode[]) => void;
}

export function useKeyboardShortcuts({
  nodes = [],
  onUploadTrigger,
  onPreviewTrigger,
  onRenameTrigger,
  onTrashTrigger,
}: UseKeyboardShortcutsOptions = {}) {
  const {
    setCommandPaletteOpen,
    setNewFolderOpen,
    selectedIds,
    selectAll,
    clearSelection,
  } = useUiStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input, textarea or dialog
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("[role='dialog']")
      ) {
        if (e.key === "Escape") {
          // Allow Escape to blur inputs
          target.blur();
        }
        return;
      }

      // Ctrl / Cmd + A: Select All
      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        selectAll(nodes.map((n) => n.id));
        return;
      }

      // Ctrl / Cmd + K: Open Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // /: Focus search / Command Palette
      if (e.key === "/") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // N: New folder
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setNewFolderOpen(true);
        return;
      }

      // U: Upload
      if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        onUploadTrigger?.();
        return;
      }

      // Esc: Clear selection
      if (e.key === "Escape") {
        clearSelection();
        return;
      }

      // F2: Rename selected item (if exactly 1 selected)
      if (e.key === "F2") {
        e.preventDefault();
        if (selectedIds.length === 1) {
          const item = nodes.find((n) => n.id === selectedIds[0]);
          if (item) onRenameTrigger?.(item);
        }
        return;
      }

      // Space: Preview selected item
      if (e.key === " ") {
        e.preventDefault();
        if (selectedIds.length === 1) {
          const item = nodes.find((n) => n.id === selectedIds[0]);
          if (item && item.kind !== "folder") onPreviewTrigger?.(item);
        }
        return;
      }

      // Del / Backspace: Trash selected items
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedIds.length > 0) {
          const itemsToTrash = nodes.filter((n) => selectedIds.includes(n.id));
          if (itemsToTrash.length > 0) onTrashTrigger?.(itemsToTrash);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    nodes,
    selectedIds,
    selectAll,
    clearSelection,
    setCommandPaletteOpen,
    setNewFolderOpen,
    onUploadTrigger,
    onPreviewTrigger,
    onRenameTrigger,
    onTrashTrigger,
  ]);
}
