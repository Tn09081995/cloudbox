"use client";

import React, { useState, useEffect } from "react";
import { useDrive } from "@/context/DriveContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuotaUsageBar } from "@/components/quota/QuotaUsageBar";
import {
  User,
  Settings,
  HardDrive,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";

export default function SettingsPage() {
  const { usedBytes, quotaBytes, refreshQuota } = useDrive();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const fetchProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      const profileData = profile as { display_name: string | null } | null;

      setDisplayName(
        profileData?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          ""
      );
    } catch {
      toast.error("Không thể tải thông tin tài khoản");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Đã cập nhật thông tin thành công!");
      refreshQuota();
    } catch {
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <span>Cài đặt tài khoản</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý hồ sơ cá nhân và dung lượng lưu trữ của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Thông tin cá nhân</h3>
                <p className="text-xs text-muted-foreground">
                  Tên hiển thị và địa chỉ email của bạn
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Đang tải...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Địa chỉ Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="rounded-xl bg-muted/40 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Email đăng nhập được quản lý bởi hệ thống bảo mật Supabase Auth.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Tên hiển thị</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl gap-2 mt-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Lưu thay đổi</span>
                </Button>
              </form>
            )}
          </div>

          {/* Security Info */}
          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Bảo mật & Quyền riêng tư</h3>
                <p className="text-xs text-muted-foreground">
                  Hệ thống bảo vệ dữ liệu cá nhân theo tiêu chuẩn cao cấp
                </p>
              </div>
            </div>

            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5 pt-2">
              <li>
                Bộ nhớ riêng tư (Private Bucket): Không ai có thể truy cập tệp khi chưa có liên kết ký mã hoặc chia sẻ.
              </li>
              <li>
                Row Level Security (RLS) kích hoạt trên mọi bảng trong cơ sở dữ liệu Postgres.
              </li>
              <li>
                Tải lên trực tiếp từ trình duyệt giúp loại bỏ giới hạn 4.5MB của serverless functions.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Quota overview */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Gói dung lượng</h3>
                <p className="text-xs text-muted-foreground">Gói cá nhân miễn phí</p>
              </div>
            </div>

            <QuotaUsageBar usedBytes={usedBytes} quotaBytes={quotaBytes} />

            <div className="pt-2 border-t space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Dung lượng đã dùng:</span>
                <span className="font-semibold text-foreground">
                  {formatBytes(usedBytes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Còn trống:</span>
                <span className="font-semibold text-foreground">
                  {formatBytes(Math.max(0, quotaBytes - usedBytes))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tổng mức hạn:</span>
                <span className="font-semibold text-foreground">
                  {formatBytes(quotaBytes)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
