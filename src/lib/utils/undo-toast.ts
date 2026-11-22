import { toast } from "sonner";
import { vi } from "@/lib/i18n/vi";

interface UndoToastOptions {
  message: string;
  onUndo: () => Promise<void> | void;
  duration?: number;
}

export function showUndoToast({
  message,
  onUndo,
  duration = 5000,
}: UndoToastOptions) {
  toast(message, {
    duration,
    action: {
      label: vi.actions.undo,
      onClick: async () => {
        try {
          await onUndo();
          toast.success("Đã hoàn tác thao tác");
        } catch {
          toast.error("Không thể hoàn tác thao tác này");
        }
      },
    },
  });
}
