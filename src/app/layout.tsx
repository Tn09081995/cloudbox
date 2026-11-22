import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CloudBox — Lưu trữ đám mây cá nhân",
  description:
    "Không gian lưu trữ cá nhân tinh gọn, hiện đại và bảo mật. Trải nghiệm mượt mà, quản lý tệp tin trực quan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CloudBox",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnamPro.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
