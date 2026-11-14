"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl border bg-card shadow-sm space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Đã xảy ra lỗi hệ thống</h2>
        <p className="text-xs text-muted-foreground">
          {error.message || "Ứng dụng gặp sự cố ngoài dự kiến. Vui lòng thử tải lại trang."}
        </p>
        <Button onClick={() => reset()} className="rounded-xl mt-2">
          Thử lại
        </Button>
      </div>
    </div>
  );
}
