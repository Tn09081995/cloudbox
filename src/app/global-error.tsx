"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <html lang="vi">
      <body className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl border bg-card text-center space-y-4">
          <h2 className="text-xl font-bold">Lỗi toàn cục</h2>
          <p className="text-xs text-muted-foreground">
            {error.message || "Đã xảy ra lỗi nghiêm trọng. Vui lòng tải lại trang."}
          </p>
          <Button onClick={() => reset()} className="rounded-xl">
            Tải lại trang
          </Button>
        </div>
      </body>
    </html>
  );
}
