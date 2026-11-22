"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ShieldCheck,
  Zap,
  Share2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { CloudBoxLogo } from "@/components/layout/CloudBoxLogo";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "demo@cloudbox.vn",
      password: "password123",
      remember: true,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginSchema.parse(data);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Đăng nhập thành công!");
      router.push("/drive");
    }, 400);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      toast.success("Đăng nhập bằng tài khoản Google thành công!");
      router.push("/drive");
    }, 450);
  };

  return (
    <div className="min-h-screen w-full flex bg-bg font-sans">
      {/* Left Column: Auth Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto lg:mx-0 w-full">
        <div>
          <Link href="/drive" className="inline-block mb-10">
            <CloudBoxLogo />
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {vi.auth.loginTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {vi.auth.loginSubtitle}
            </p>
          </div>

          {/* Google Mock OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-btn border border-border bg-surface hover:bg-surface-2 text-foreground text-xs font-semibold shadow-xs transition-colors"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{vi.auth.googleBtn}</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg px-3 text-muted-foreground font-mono text-[11px]">
                {vi.auth.or}
              </span>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-foreground block"
              >
                {vi.auth.email}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email", {
                  required: "Vui lòng nhập địa chỉ email",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Địa chỉ email không hợp lệ",
                  },
                })}
                placeholder="name@example.com"
                className="w-full h-10 px-3.5 rounded-btn bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {errors.email && (
                <p className="text-[11px] text-semantic-danger font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground block"
                >
                  {vi.auth.password}
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Tính năng quên mật khẩu (Chế độ UI)")}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                placeholder="••••••••"
                className="w-full h-10 px-3.5 rounded-btn bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {errors.password && (
                <p className="text-[11px] text-semantic-danger font-medium mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                {...register("remember")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="remember"
                className="text-xs text-muted-foreground select-none cursor-pointer"
              >
                Ghi nhớ đăng nhập trên thiết bị này
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-btn bg-primary hover:bg-primary-ink text-white text-xs font-semibold shadow-xs transition-colors mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{vi.auth.loginBtn}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            {vi.auth.noAccount}{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <p className="text-[11px] text-muted-foreground text-center lg:text-left mt-8">
          © 2026 CloudBox Inc. Bảo lưu mọi quyền.
        </p>
      </div>

      {/* Right Column: Brand Panel */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary-soft/60 via-surface-2 to-surface border-l border-border p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/4 -right-16 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            CloudBox 2.0
          </span>
          <h2 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight max-w-md">
            Lưu trữ đám mây cá nhân đơn giản, tinh tế & bảo mật.
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
            Thiết kế lấy cảm hứng từ sự thanh lịch của Linear và sức mạnh của Google Drive, mang lại trải nghiệm quản lý tệp tin vượt trội.
          </p>
        </div>

        {/* Feature Bullets */}
        <div className="relative z-10 space-y-4 max-w-md my-8">
          <div className="flex items-start gap-3 p-3.5 rounded-card bg-surface/80 border border-border shadow-xs backdrop-blur-sm">
            <div className="h-8 w-8 rounded-btn bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                {vi.auth.bullet1}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tải lên và tải xuống không giới hạn băng thông với độ trễ tối thiểu.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-card bg-surface/80 border border-border shadow-xs backdrop-blur-sm">
            <div className="h-8 w-8 rounded-btn bg-semantic-success/10 text-semantic-success flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                {vi.auth.bullet2}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Mã hóa dữ liệu tại chỗ, kiểm soát quyền truy cập chi tiết cho từng liên kết.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-card bg-surface/80 border border-border shadow-xs backdrop-blur-sm">
            <div className="h-8 w-8 rounded-btn bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                {vi.auth.bullet3}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Xem trước trực tiếp hơn 30 loại tệp tin: ảnh, video 4K, PDF và code.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom review badge */}
        <div className="relative z-10 pt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex -space-x-2">
            <div className="h-7 w-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-surface">
              A
            </div>
            <div className="h-7 w-7 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-surface">
              B
            </div>
            <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-surface">
              C
            </div>
          </div>
          <span>Được tin dùng bởi hơn 10.000+ người dùng cá nhân</span>
        </div>
      </div>
    </div>
  );
}
