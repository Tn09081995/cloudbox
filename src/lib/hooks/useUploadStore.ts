import { create } from "zustand";

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  progress: number; // 0 - 100
  speed: string; // e.g. "2,8 MB"
  eta: string; // e.g. "3 giây"
  status: "pending" | "uploading" | "paused" | "failed" | "completed";
  error?: string;
  targetFolderId?: string | null;
}

interface UploadState {
  items: UploadItem[];
  isOpen: boolean;
  isMinimized: boolean;
  setIsOpen: (open: boolean) => void;
  setIsMinimized: (minimized: boolean | ((prev: boolean) => boolean)) => void;
  addFiles: (files: File[] | FileList, targetFolderId?: string | null) => void;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  items: [],
  isOpen: false,
  isMinimized: false,
  setIsOpen: (open) => set({ isOpen: open }),
  setIsMinimized: (minimized) =>
    set((state) => ({
      isMinimized: typeof minimized === "function" ? minimized(state.isMinimized) : minimized,
    })),

  addFiles: (files, targetFolderId = null) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const newItems: UploadItem[] = fileList.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      progress: 0,
      speed: "3,2 MB",
      eta: "5 giây",
      status: "uploading",
      targetFolderId,
    }));

    set((state) => ({
      items: [...state.items, ...newItems],
      isOpen: true,
      isMinimized: false,
    }));

    // Start simulation ticks for each file
    newItems.forEach((item, index) => {
      // If multiple files, simulate failure on purpose for the 2nd file to demonstrate retry
      const shouldFail = newItems.length >= 2 && index === 1;
      simulateUpload(item.id, shouldFail);
    });
  },

  pauseUpload: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, status: "paused" } : i
      ),
    })),

  resumeUpload: (id) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, status: "uploading" } : i
      ),
    }));
    simulateUpload(id, false);
  },

  cancelUpload: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  retryUpload: (id) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, progress: 0, status: "uploading", error: undefined } : i
      ),
    }));
    simulateUpload(id, false);
  },

  clearCompleted: () =>
    set((state) => ({
      items: state.items.filter((i) => i.status !== "completed"),
    })),
}));

// Helper to simulate smooth progress ticks
function simulateUpload(itemId: string, shouldFail: boolean) {
  let progress = 0;
  const interval = setInterval(() => {
    const state = useUploadStore.getState();
    const item = state.items.find((i) => i.id === itemId);

    if (!item || item.status === "paused") {
      clearInterval(interval);
      return;
    }

    if (shouldFail && progress >= 50) {
      clearInterval(interval);
      useUploadStore.setState({
        items: state.items.map((i) =>
          i.id === itemId
            ? { ...i, status: "failed", error: "Mất kết nối mạng tạm thời" }
            : i
        ),
      });
      return;
    }

    progress += Math.floor(Math.random() * 15) + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      useUploadStore.setState({
        items: state.items.map((i) =>
          i.id === itemId
            ? { ...i, progress: 100, status: "completed", speed: "0 B", eta: "Hoàn tất" }
            : i
        ),
      });
      return;
    }

    const remainingSecs = Math.max(1, Math.round(((100 - progress) / 20)));
    useUploadStore.setState({
      items: state.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              progress,
              speed: `${(2.5 + Math.random() * 1.5).toFixed(1).replace(".", ",")} MB`,
              eta: `${remainingSecs}s`,
            }
          : i
      ),
    });
  }, 350);
}
