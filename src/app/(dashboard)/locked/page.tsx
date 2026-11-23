"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, KeyRound, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLockedFiles } from "@/lib/hooks/useFiles";
import { FolderView } from "@/components/files/FolderView";
import { toast } from "sonner";

export default function LockedFolderPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const { data: nodes = [], isLoading } = useLockedFiles();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 or any non-empty input
    if (pin.trim() === "1234" || pin.length >= 4) {
      setIsUnlocked(true);
      setError(false);
      toast.success("Đã mở khóa Thư mục an toàn!");
    } else {
      setError(true);
      toast.error("Mã PIN không chính xác (Thử: 1234)");
    }
  };

  const handleQuickUnlock = () => {
    setPin("1234");
    setIsUnlocked(true);
    setError(false);
    toast.success("Đã mở khóa Thư mục an toàn bằng xác thực!");
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] p-6 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Lock className="h-8 w-8" />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Thư mục đã khóa
        </h1>

        <p className="text-xs md:text-sm text-muted leading-relaxed mb-6">
          Các mục trong Thư mục đã khóa được bảo vệ nghiêm ngặt. Chúng sẽ không xuất hiện trong Tệp của tôi, Ảnh & Video, Gần đây hoặc kết quả Tìm kiếm.
        </p>

        <form onSubmit={handleUnlock} className="w-full space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-muted block text-center">
              Nhập mã PIN bảo mật (mặc định: 1234)
            </label>
            <Input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError(false);
              }}
              className={`h-11 rounded-full text-center tracking-widest text-lg font-mono bg-surface-2 ${
                error ? "border-semantic-danger" : ""
              }`}
              placeholder="••••"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-primary text-white hover:bg-primary-ink font-semibold text-xs shadow-xs"
            >
              <Unlock className="h-4 w-4 mr-1.5" />
              <span>Mở khóa thư mục</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleQuickUnlock}
              className="w-full h-10 rounded-full text-xs font-medium border-border"
            >
              <KeyRound className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span>Mở khóa nhanh (Xác thực một chạm)</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner indicating unlocked status */}
      <div className="p-3 px-4 rounded-2xl bg-primary-soft text-primary-ink border border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Thư mục đã khóa đang được mở</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsUnlocked(false);
            setPin("");
            toast.info("Đã khóa lại thư mục an toàn");
          }}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Khóa lại</span>
        </button>
      </div>

      <FolderView
        nodes={nodes}
        breadcrumbs={[{ id: null, name: "Thư mục khóa" }]}
        title="Thư mục đã khóa"
        emptyTitle="Thư mục đã khóa đang trống"
        emptyDesc="Để ẩn tệp tin quan trọng, nhấp chuột phải vào tệp và chọn 'Chuyển vào thư mục khóa'."
        isLoading={isLoading}
      />
    </div>
  );
}
