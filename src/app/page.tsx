import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  Cloud,
  Shield,
  Zap,
  Share2,
  ArrowRight,
  Smartphone,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isDemo = cookieStore.get("cloudbox_demo_session")?.value === "true";

  if (user || isDemo) {
    redirect("/drive");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Navigation */}
      <header className="h-16 border-b px-6 flex items-center justify-between bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Cloud className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            CloudBox
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/cloudbox.apk"
            download="CloudBox.apk"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
          >
            <Smartphone className="h-4 w-4" />
            <span>Tải App APK</span>
          </a>
          <ThemeToggle />
          <Button asChild variant="ghost" className="rounded-xl">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild className="rounded-xl font-semibold shadow-sm">
            <Link href="/register">Bắt đầu miễn phí</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-primary/5 text-primary text-xs font-semibold">
          <Zap className="h-3.5 w-3.5" />
          <span>Lưu trữ đám mây cá nhân hiện đại</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground max-w-3xl leading-[1.15]">
          Không gian lưu trữ cá nhân{" "}
          <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            an toàn & thần tốc
          </span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
          Quản lý tệp tin, xem trước đa định dạng trực tiếp, tạo liên kết chia sẻ công khai và tải lên trực tiếp không giới hạn dung lượng Vercel.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button asChild size="lg" className="rounded-2xl h-12 px-8 font-bold shadow-md gap-2 text-base w-full sm:w-auto">
            <Link href="/register">
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-2xl h-12 px-8 font-semibold text-base w-full sm:w-auto">
            <Link href="/login">Đăng nhập tài khoản</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="rounded-2xl h-12 px-6 font-semibold text-base gap-2 border shadow-sm w-full sm:w-auto">
            <a href="/cloudbox.apk" download="CloudBox.apk">
              <Smartphone className="h-4 w-4 text-primary" />
              <span>Tải APK Android</span>
            </a>
          </Button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full text-left">
          <div className="p-6 rounded-3xl border bg-card shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Tải lên trực tiếp</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tải file trực tiếp từ trình duyệt đến Supabase Storage, theo dõi tiến trình và hủy tải lên tức thì.
            </p>
          </div>

          <div className="p-6 rounded-3xl border bg-card shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Chia sẻ công khai</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tạo link chia sẻ với mã token ngẫu nhiên bảo mật cao, thiết lập hạn sử dụng và thu hồi quyền truy cập khi cần.
            </p>
          </div>

          <div className="p-6 rounded-3xl border bg-card shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Bảo mật cấp độ cao</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Toàn bộ dữ liệu được bảo vệ bằng Row Level Security (RLS) của PostgreSQL, mã hóa lưu trữ an toàn.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-xs text-muted-foreground">
        © 2026 CloudBox. Dự án lưu trữ đám mây cá nhân hiện đại.
      </footer>
    </div>
  );
}
