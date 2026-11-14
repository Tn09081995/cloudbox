"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Lock,
  Mail,
  User,
  Loader2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isDummyConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("dummy") || false;

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true);
      await fetch("/api/auth/demo", { method: "POST" });
      toast.success("Đã vào Chế độ Trải nghiệm Demo!");
      router.push("/drive");
      router.refresh();
    } catch {
      toast.error("Không thể kích hoạt chế độ dùng thử");
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng điền email và mật khẩu");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsLoading(true);
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName || email.split("@")[0],
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.session) {
        toast.success("Đăng ký thành công! Đang chuyển hướng...");
        router.push("/drive");
        router.refresh();
      } else {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email của bạn để kích hoạt tài khoản."
        );
        router.push("/login");
      }
    } catch (err: unknown) {
      let errorMsg =
        err instanceof Error ? err.message : "Đăng ký thất bại";
      if (
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("fetch failed") ||
        errorMsg.includes("NetworkError")
      ) {
        errorMsg =
          "Không thể kết nối đến Supabase! Hãy điền thông tin dự án thật vào .env.local hoặc bấm 'Dùng thử chế độ Demo' bên dưới.";
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      let errorMsg =
        err instanceof Error ? err.message : "Lỗi khi kết nối Google";
      if (
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("fetch failed")
      ) {
        errorMsg =
          "Chưa kết nối Supabase thật trong file .env.local để dùng Google OAuth.";
      }
      toast.error(errorMsg);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/20 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-2">
            <Cloud className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Tạo tài khoản CloudBox
          </h1>
          <p className="text-sm text-muted-foreground">
            Nhận ngay 1 GB dung lượng lưu trữ đám mây miễn phí
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl border bg-card shadow-sm space-y-5">
          {/* Dummy Warning */}
          {isDummyConfig && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Chưa cấu hình Supabase thật</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                File <code>.env.local</code> đang dùng URL mẫu. Bạn có thể bấm nút
                dùng thử bên dưới để trải nghiệm ngay mọi tính năng mà không cần
                cài đặt tài khoản.
              </p>
            </div>
          )}

          {/* Instant Demo Button */}
          <Button
            type="button"
            variant="default"
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isLoading}
            className="w-full h-11 rounded-xl font-semibold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
          >
            {isDemoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-300" />
            )}
            <span>Dùng thử chế độ Demo (Trải nghiệm ngay)</span>
          </Button>

          <div className="relative flex items-center justify-center text-xs uppercase">
            <div className="w-full border-t" />
            <span className="bg-card px-3 text-muted-foreground font-medium">
              Hoặc đăng ký tài khoản
            </span>
            <div className="w-full border-t" />
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-10 rounded-xl font-medium gap-3 border-input hover:bg-accent text-xs"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Đăng ký với Google</span>
          </Button>

          <form onSubmit={handleRegister} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="display-name">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="display-name"
                  placeholder="Nguyễn Văn A"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  className="pl-9 rounded-xl h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  required
                  className="pl-9 rounded-xl h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  required
                  minLength={6}
                  className="pl-9 rounded-xl h-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              <span>Đăng ký với email</span>
            </Button>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
