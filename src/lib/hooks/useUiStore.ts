import { create } from "zustand";

export type ViewMode = "grid" | "list";
export type SortField = "name" | "updated_at" | "size" | "kind";
export type SortOrder = "asc" | "desc";

interface UiState {
  // App Shell Layout
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  detailsPanelOpen: boolean;
  setDetailsPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  // View & Sort
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  setSort: (field: SortField, order: SortOrder) => void;

  // Selection
  selectedIds: string[];
  selectItem: (id: string, multi?: boolean) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;

  // Search & Navigation
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Modals & Panels
  newFolderOpen: boolean;
  setNewFolderOpen: (open: boolean) => void;
  newTextFileOpen: boolean;
  setNewTextFileOpen: (open: boolean) => void;
  renameTargetId: string | null;
  setRenameTargetId: (id: string | null) => void;
  moveTargetIds: string[];
  setMoveTargetIds: (ids: string[]) => void;
  deleteTargetIds: string[];
  setDeleteTargetIds: (ids: string[]) => void;
  previewTargetId: string | null;
  setPreviewTargetId: (id: string | null) => void;
  shareTargetId: string | null;
  setShareTargetId: (id: string | null) => void;

  // Install card dismiss
  installCardDismissed: boolean;
  setInstallCardDismissed: (dismissed: boolean) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) =>
    set((state) => ({
      sidebarCollapsed: typeof collapsed === "function" ? collapsed(state.sidebarCollapsed) : collapsed,
    })),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  detailsPanelOpen: false,
  setDetailsPanelOpen: (open) =>
    set((state) => ({
      detailsPanelOpen: typeof open === "function" ? open(state.detailsPanelOpen) : open,
    })),

  viewMode: "grid",
  setViewMode: (mode) => {
    try {
      localStorage.setItem("cloudbox_view_mode", mode);
    } catch {}
    set({ viewMode: mode });
  },
  sortField: "updated_at",
  sortOrder: "desc",
  setSort: (field, order) => set({ sortField: field, sortOrder: order }),

  selectedIds: [],
  selectItem: (id, multi = false) =>
    set((state) => {
      if (multi) {
        const exists = state.selectedIds.includes(id);
        return {
          selectedIds: exists ? state.selectedIds.filter((item) => item !== id) : [...state.selectedIds, id],
        };
      }
      return { selectedIds: [id] };
    }),
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  isSelected: (id) => get().selectedIds.includes(id),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  newFolderOpen: false,
  setNewFolderOpen: (open) => set({ newFolderOpen: open }),
  newTextFileOpen: false,
  setNewTextFileOpen: (open) => set({ newTextFileOpen: open }),
  renameTargetId: null,
  setRenameTargetId: (id) => set({ renameTargetId: id }),
  moveTargetIds: [],
  setMoveTargetIds: (ids) => set({ moveTargetIds: ids }),
  deleteTargetIds: [],
  setDeleteTargetIds: (ids) => set({ deleteTargetIds: ids }),
  previewTargetId: null,
  setPreviewTargetId: (id) => set({ previewTargetId: id }),
  shareTargetId: null,
  setShareTargetId: (id) => set({ shareTargetId: id }),

  installCardDismissed: false,
  setInstallCardDismissed: (dismissed) => set({ installCardDismissed: dismissed }),
}));
