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
  const [gdriveStatus, setGdriveStatus] = useState<{
    connected: boolean;
    quota?: { limit: number; usage: number };
  }>({ connected: false });
  const supabase = createClient();

  const fetchProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEmail("demo@cloudbox.app");
        setDisplayName("Người Dùng Thử Nghiệm");
        setIsLoading(false);
        return;
      }

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
    fetch("/api/gdrive/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setGdriveStatus(data);
      })
      .catch(() => {});
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.success("Đã cập nhật thông tin thành công! (Chế độ Demo)");
        refreshQuota();
        return;
      }

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

          {/* Google Drive 5TB Integration Card */}
          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span>Google Drive 5 TB</span>
                    {gdriveStatus.connected ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                        Đang kết nối
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                        Chưa kết nối
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sử dụng gói Google Drive 5.000 GB của bạn làm kho chứa tệp
                  </p>
                </div>
              </div>
            </div>

            {gdriveStatus.connected ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <p className="font-semibold">
                    ✓ Kho lưu trữ Google Drive 5 TB đã kích hoạt thành công!
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Hệ thống lưu trữ tổng: <strong>5.000 GB</strong> • Mỗi tài khoản được cấp riêng <strong>200 GB</strong> độc lập, hoàn toàn bảo mật và không trùng lặp.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-muted-foreground block text-[11px]">Hạn mức tài khoản của bạn</span>
                    <span className="font-bold text-base text-foreground">200 GB</span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Đã dùng {formatBytes(usedBytes)} ({Math.min(100, Math.round((usedBytes / quotaBytes) * 100))}%)
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-muted-foreground block text-[11px]">Dung lượng kho tổng Google 5TB</span>
                    <span className="font-bold text-base text-foreground">
                      {formatBytes(gdriveStatus.quota?.limit || 5497558138880)}
                    </span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Đã dùng {formatBytes(gdriveStatus.quota?.usage || 0)} (chia sẻ tối đa 25 tài khoản)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>
                  Để kết nối tài khoản Google 5 TB của bạn, hãy thêm các biến sau vào file <code>.env.local</code>:
                </p>
                <pre className="p-3 bg-muted/60 rounded-xl font-mono text-[11px] overflow-x-auto select-all">
                  GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com{"\n"}
                  GOOGLE_CLIENT_SECRET=your-google-client-secret{"\n"}
                  GOOGLE_REFRESH_TOKEN=your-google-oauth-refresh-token{"\n"}
                  GOOGLE_DRIVE_FOLDER_ID=your-optional-folder-id
                </pre>
                <p className="text-[11px]">
                  💡 Sau khi thêm các biến này vào <code>.env.local</code> và khởi động lại, CloudBox sẽ tự động dùng Google Drive 5 TB thay vì bộ nhớ mặc định!
                </p>
              </div>
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
